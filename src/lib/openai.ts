import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function summarizeNotes(content: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
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
}

export async function generateFlashcards(content: string): Promise<{ front: string; back: string }[]> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
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
  } catch {
    return [];
  }
}

export async function generateQuiz(content: string): Promise<{ question: string; options: string[]; correct_answer: number }[]> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
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
  } catch {
    return [];
  }
}

export async function answerQuestion(notes: string, question: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
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
}
