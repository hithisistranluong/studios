import OpenAI from 'openai';

// OpenAI API key validation constants
const MIN_API_KEY_LENGTH = 20;
const API_KEY_PREFIX = 'sk-';

// Default model to use if OPENAI_MODEL is not set
const DEFAULT_MODEL = 'gpt-3.5-turbo';

// Check if mock mode is enabled
function isMockMode(): boolean {
  return process.env.MOCK_OPENAI === 'true';
}

// Get the preferred models in order of preference
export function getPreferredModels(): string[] {
  const primary = (process.env.OPENAI_MODEL || DEFAULT_MODEL).trim();
  const fallbacksStr = process.env.OPENAI_FALLBACK_MODELS || '';
  
  const fallbacks = fallbacksStr
    .split(',')
    .map(m => m.trim())
    .filter(m => m.length > 0);
  
  // Return unique list preserving order
  const seen = new Set<string>();
  const result: string[] = [];
  
  for (const model of [primary, ...fallbacks]) {
    if (!seen.has(model)) {
      seen.add(model);
      result.push(model);
    }
  }
  
  return result;
}

// Mock responses for development mode
const MOCK_RESPONSES = {
  summarize: '• This is a mock summary of your notes\n• Key point 1: Important concept explained\n• Key point 2: Another important detail\n• Key point 3: Final takeaway',
  flashcards: [
    { front: 'What is the main concept?', back: 'This is a mock answer explaining the main concept.' },
    { front: 'What is the second concept?', back: 'This is a mock answer for the second concept.' },
  ],
  quiz: [
    {
      question: 'What is the main topic of these notes?',
      options: ['Option A', 'Option B (correct)', 'Option C', 'Option D'],
      correct_answer: 1,
    },
    {
      question: 'Which statement is true?',
      options: ['True statement (correct)', 'False statement 1', 'False statement 2', 'False statement 3'],
      correct_answer: 0,
    },
  ],
  answer: 'This is a mock answer to your question based on the provided notes. In mock mode, actual AI processing is skipped.',
};

// Validate required environment variables
export function validateOpenAIConfig(): { valid: boolean; error?: string } {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return { valid: false, error: 'OPENAI_API_KEY environment variable is not set' };
  }
  
  if (apiKey.length < MIN_API_KEY_LENGTH) {
    return { valid: false, error: `OPENAI_API_KEY appears to be invalid (expected at least ${MIN_API_KEY_LENGTH} characters)` };
  }
  
  if (!apiKey.startsWith(API_KEY_PREFIX)) {
    return { valid: false, error: `OPENAI_API_KEY appears to be invalid (expected to start with '${API_KEY_PREFIX}')` };
  }
  
  return { valid: true };
}

// Custom error class for AI-related errors
export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIError';
  }
}

// Create OpenAI client with validation
function getOpenAIClient(): OpenAI {
  const config = validateOpenAIConfig();
  if (!config.valid) {
    throw new AIError(config.error!, 'CONFIG_ERROR', 500, false);
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

// Sleep for exponential backoff
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Handle OpenAI API errors and convert to AIError
function handleOpenAIError(error: unknown): AIError {
  if (error instanceof OpenAI.APIError) {
    const status = error.status || 500;
    const message = error.message || 'Unknown API error';
    
    switch (status) {
      case 401:
        return new AIError('Invalid API key. Please check your OPENAI_API_KEY configuration.', 'AUTH_ERROR', 401, false);
      case 403:
        return new AIError('Access forbidden. Your API key may not have access to this model.', 'FORBIDDEN', 403, false);
      case 429:
        return new AIError('Rate limit exceeded. Please try again in a few moments.', 'RATE_LIMIT', 429, true);
      case 400:
        return new AIError(`Bad request: ${message}`, 'BAD_REQUEST', 400, false);
      case 500:
      case 502:
      case 503:
      case 504:
        return new AIError('OpenAI service is temporarily unavailable. Please try again.', 'SERVICE_ERROR', status, true);
      default:
        return new AIError(`API error: ${message}`, 'API_ERROR', status, status >= 500);
    }
  }
  
  if (error instanceof AIError) {
    return error;
  }
  
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  return new AIError(errorMessage, 'UNKNOWN_ERROR', 500, false);
}

// Wrapper for API calls with retry logic
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  let lastError: AIError | null = null;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = handleOpenAIError(error);
      
      // Log error context
      console.error(`[AI] ${operationName} failed (attempt ${attempt + 1}/${MAX_RETRIES}):`, {
        code: lastError.code,
        message: lastError.message,
        statusCode: lastError.statusCode,
        retryable: lastError.retryable,
      });
      
      // Not retry non-retryable errors
      if (!lastError.retryable) {
        throw lastError;
      }
      
      // Not retry on last attempt
      if (attempt < MAX_RETRIES - 1) {
        const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
        console.log(`[AI] Retrying ${operationName} in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }
  
  throw lastError!;
}

// Attempt operation across preferred models
async function attemptModels<T>(
  operationFactory: (model: string) => Promise<T>,
  operationName: string
): Promise<T> {
  const models = getPreferredModels();
  let lastError: AIError | null = null;
  
  for (const model of models) {
    try {
      console.log(`[AI] Attempting ${operationName} with model: ${model}`);
      const result = await withRetry(() => operationFactory(model), operationName);
      console.log(`[AI] ${operationName} succeeded with model: ${model}`);
      return result;
    } catch (error) {
      if (error instanceof AIError) {
        lastError = error;
        console.log(`[AI] ${operationName} failed with model ${model}: ${error.code}`);
        
        // Only try next model if FORBIDDEN
        if (error.code === 'FORBIDDEN') {
          console.log(`[AI] Model ${model} forbidden, trying next model...`);
          continue;
        }
        // For other errors, rethrow immediately
        throw error;
      }
      throw error;
    }
  }
  
  // Throw last error if all models forbidden
  console.error(`[AI] All models forbidden for ${operationName}`);
  throw lastError!;
}

export async function summarizeNotes(content: string): Promise<string> {
  // Return mock response if mock mode is enabled
  if (isMockMode()) {
    console.log('[AI] Mock mode enabled - returning mock summarize response');
    return MOCK_RESPONSES.summarize;
  }

  const openai = getOpenAIClient();
  
  return attemptModels(async (model: string) => {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful study assistant. Summarize the following notes in a clear, concise manner while retaining key information. Use bullet points where appropriate.',
        },
        {
          role: 'user',
          content: content,
        },
      ],
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || 'Unable to generate summary';
  }, 'summarizeNotes');
}

export async function generateFlashcards(content: string): Promise<{ front: string; back: string }[]> {
  // Return mock response if mock mode is enabled
  if (isMockMode()) {
    console.log('[AI] Mock mode enabled - returning mock flashcards response');
    return MOCK_RESPONSES.flashcards;
  }

  const openai = getOpenAIClient();
  
  return attemptModels(async (model: string) => {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a study assistant. Generate flashcards from the following notes. Return a JSON array of objects with "front" (question/term) and "back" (answer/definition) fields. Generate 5-10 flashcards based on the content. Only return the JSON array, no other text.',
        },
        {
          role: 'user',
          content: content,
        },
      ],
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || '[]';
    try {
      const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedResponse);
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      console.error('[AI] Failed to parse flashcards JSON response:', {
        error: errorMessage,
        responsePreview: responseText.substring(0, 200),
      });
      throw new AIError(
        'Failed to parse flashcards response from AI. Please try again.',
        'PARSE_ERROR',
        500,
        true
      );
    }
  }, 'generateFlashcards');
}

export async function generateQuiz(content: string): Promise<{ question: string; options: string[]; correct_answer: number }[]> {
  // Return mock response if mock mode is enabled
  if (isMockMode()) {
    console.log('[AI] Mock mode enabled - returning mock quiz response');
    return MOCK_RESPONSES.quiz;
  }

  const openai = getOpenAIClient();
  
  return attemptModels(async (model: string) => {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a study assistant. Generate a quiz from the following notes. Return a JSON array of objects with "question", "options" (array of 4 choices), and "correct_answer" (index 0-3 of the correct option) fields. Generate 5 quiz questions. Only return the JSON array, no other text.',
        },
        {
          role: 'user',
          content: content,
        },
      ],
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || '[]';
    try {
      const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedResponse);
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      console.error('[AI] Failed to parse quiz JSON response:', {
        error: errorMessage,
        responsePreview: responseText.substring(0, 200),
      });
      throw new AIError(
        'Failed to parse quiz response from AI. Please try again.',
        'PARSE_ERROR',
        500,
        true
      );
    }
  }, 'generateQuiz');
}

export async function answerQuestion(notes: string, question: string): Promise<string> {
  // Return mock response if mock mode is enabled
  if (isMockMode()) {
    console.log('[AI] Mock mode enabled - returning mock Q&A response');
    return MOCK_RESPONSES.answer;
  }

  const openai = getOpenAIClient();
  
  return attemptModels(async (model: string) => {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You are a helpful study assistant. Answer questions based on the following notes. If the answer cannot be found in the notes, say so. Here are the notes:\n\n${notes}`,
        },
        {
          role: 'user',
          content: question,
        },
      ],
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || 'Unable to answer the question';
  }, 'answerQuestion');
}
