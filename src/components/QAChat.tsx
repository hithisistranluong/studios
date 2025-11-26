'use client';

import { useState } from 'react';

interface QAProps {
  notes: string;
}

export default function QAChat({ notes }: QAProps) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<{ type: 'question' | 'answer'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim() || !notes) return;

    const currentQuestion = question;
    setMessages((prev) => [...prev, { type: 'question', text: currentQuestion }]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'qa',
          content: notes,
          question: currentQuestion,
        }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { type: 'answer', text: data.answer || 'Unable to answer' }]);
    } catch {
      setMessages((prev) => [...prev, { type: 'answer', text: 'Error getting answer' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Q&A Chat</h3>
      
      {!notes ? (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4">
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            Please add some notes first to ask questions about them.
          </p>
        </div>
      ) : null}

      <div className="h-64 overflow-y-auto mb-4 space-y-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-20">
            Ask a question about your notes
          </p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                msg.type === 'question'
                  ? 'bg-blue-100 dark:bg-blue-900 ml-8'
                  : 'bg-gray-200 dark:bg-gray-700 mr-8'
              }`}
            >
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {msg.type === 'question' ? 'You' : 'AI'}
              </p>
              <p className="text-gray-800 dark:text-white whitespace-pre-wrap">{msg.text}</p>
            </div>
          ))
        )}
        {loading && (
          <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg mr-8">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">AI</p>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about your notes..."
          disabled={!notes || loading}
          className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
        />
        <button
          onClick={handleAsk}
          disabled={!notes || !question.trim() || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Ask
        </button>
      </div>
    </div>
  );
}
