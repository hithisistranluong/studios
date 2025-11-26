import { NextRequest, NextResponse } from 'next/server';
import { summarizeNotes, generateFlashcards, generateQuiz, answerQuestion, AIError, validateOpenAIConfig } from '@/lib/openai';

// Structure error response type
type ErrorResponse = {
  error: string;
  code: string;
  retryable?: boolean;
};

// Create error responses
function createErrorResponse(message: string, code: string, status: number, retryable = false): NextResponse<ErrorResponse> {
  return NextResponse.json(
    { error: message, code, retryable },
    { status }
  );
}

export async function POST(request: NextRequest) {
  // Early validation of OpenAI configuration
  const configCheck = validateOpenAIConfig();
  if (!configCheck.valid) {
    console.error('[API] OpenAI configuration error:', configCheck.error);
    return createErrorResponse(
      configCheck.error!,
      'CONFIG_ERROR',
      500
    );
  }

  try {
    const body = await request.json();
    const { action, content, question } = body;

    // Validate required fields
    if (!action) {
      return createErrorResponse('Action is required', 'VALIDATION_ERROR', 400);
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return createErrorResponse('Content is required and must be a non-empty string', 'VALIDATION_ERROR', 400);
    }

    let result;

    switch (action) {
      case 'summarize':
        result = await summarizeNotes(content);
        return NextResponse.json({ summary: result });
      
      case 'flashcards':
        result = await generateFlashcards(content);
        return NextResponse.json({ flashcards: result });
      
      case 'quiz':
        result = await generateQuiz(content);
        return NextResponse.json({ quiz: result });
      
      case 'qa':
        if (!question || typeof question !== 'string' || !question.trim()) {
          return createErrorResponse('Question is required for Q&A action', 'VALIDATION_ERROR', 400);
        }
        result = await answerQuestion(content, question);
        return NextResponse.json({ answer: result });
      
      default:
        return createErrorResponse(`Invalid action: ${action}. Valid actions are: summarize, flashcards, quiz, qa`, 'VALIDATION_ERROR', 400);
    }
  } catch (error) {
    // Handle AI Error
    if (error instanceof AIError) {
      console.error('[API] AI error:', {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
      });
      return createErrorResponse(
        error.message,
        error.code,
        error.statusCode,
        error.retryable
      );
    }

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      console.error('[API] JSON parse error:', error.message);
      return createErrorResponse('Invalid JSON in request body', 'PARSE_ERROR', 400);
    }

    // Handle unexpected errors
    console.error('[API] Unexpected error:', error);
    return createErrorResponse(
      'An unexpected error occurred. Please try again later.',
      'INTERNAL_ERROR',
      500
    );
  }
}
