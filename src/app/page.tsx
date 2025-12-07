'use client';

import { useState } from 'react';
import NoteInput from '@/components/NoteInput';
import Summary from '@/components/Summary';
import Flashcards from '@/components/Flashcards';
import Quiz from '@/components/Quiz';
import QAChat from '@/components/QAChat';

type Tab = 'summarize' | 'flashcards' | 'quiz' | 'qa';

// Error response type from API
type APIError = {
  error: string;
  code: string;
  retryable?: boolean;
};

export default function Home() {
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('summarize');
  const [summary, setSummary] = useState('');
  const [flashcards, setFlashcards] = useState<{ front: string; back: string }[]>([]);
  const [quiz, setQuiz] = useState<{ question: string; options: string[]; correct_answer: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: Tab) => {
    if (!notes.trim()) {
      setError('Please enter some notes first');
      return;
    }

    setLoading(true);
    setActiveTab(action);
    setError(null);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, content: notes }),
      });

      const data = await response.json();

      // Check for error response
      if (!response.ok) {
        const errorData = data as APIError;
        setError(errorData.error || 'An error occurred');
        if (errorData.retryable) {
          setError(`${errorData.error} (You can try again)`);
        }
        return;
      }

      switch (action) {
        case 'summarize':
          setSummary(data.summary || '');
          break;
        case 'flashcards':
          setFlashcards(data.flashcards || []);
          break;
        case 'quiz':
          setQuiz(data.quiz || []);
          break;
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'summarize' as Tab, label: 'Summary', action: () => handleAction('summarize') },
    { id: 'flashcards' as Tab, label: 'Flashcards', action: () => handleAction('flashcards') },
    { id: 'quiz' as Tab, label: 'Quiz', action: () => handleAction('quiz') },
    { id: 'qa' as Tab, label: 'Q&A', action: () => setActiveTab('qa') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">StudiOS</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Transform notes into smart study experiences</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Note Input */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Your Notes
              </h2>
              <NoteInput onNotesChange={setNotes} />
            </div>

            {/* Action Buttons */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Actions
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAction('summarize')}
                  disabled={loading || !notes.trim()}
                  className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-blue-200 dark:border-blue-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Summarize</span>
                </button>
                <button
                  onClick={() => handleAction('flashcards')}
                  disabled={loading || !notes.trim()}
                  className="flex flex-col items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-green-200 dark:border-green-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Flashcards</span>
                </button>
                <button
                  onClick={() => handleAction('quiz')}
                  disabled={loading || !notes.trim()}
                  className="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-purple-200 dark:border-purple-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quiz</span>
                </button>
                <button
                  onClick={() => setActiveTab('qa')}
                  disabled={!notes.trim()}
                  className="flex flex-col items-center gap-2 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-orange-200 dark:border-orange-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Q&A Chat</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="min-h-[400px]">
              {/* Display Error */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 dark:text-red-300">{error}</p>
                    <button 
                      onClick={() => setError(null)}
                      className="ml-auto text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              {activeTab === 'summarize' && <Summary summary={summary} loading={loading && activeTab === 'summarize'} />}
              {activeTab === 'flashcards' && <Flashcards flashcards={flashcards} loading={loading && activeTab === 'flashcards'} />}
              {activeTab === 'quiz' && <Quiz quiz={quiz} loading={loading && activeTab === 'quiz'} />}
              {activeTab === 'qa' && <QAChat notes={notes} />}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-700 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>StudiOS - Transform your notes into smart study experiences</p>
        </div>
      </footer>
    </div>
  );
}
