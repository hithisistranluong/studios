import { NextRequest, NextResponse } from 'next/server';
import { summarizeNotes, generateFlashcards, generateQuiz, answerQuestion } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { action, content, question } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'summary':
        result = await summarizeNotes(content);
        return NextResponse.json({ summary: result });
      
      case 'flashcards':
        result = await generateFlashcards(content);
        return NextResponse.json({ flashcards: result });
      
      case 'quiz':
        result = await generateQuiz(content);
        return NextResponse.json({ quiz: result });
      
      case 'qa':
        if (!question) {
          return NextResponse.json({ error: 'Question is required for Q&A' }, { status: 400 });
        }
        result = await answerQuestion(content, question);
        return NextResponse.json({ answer: result });
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
