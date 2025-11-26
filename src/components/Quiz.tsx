'use client';

import { useState } from 'react';

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
}

interface QuizProps {
  quiz: QuizQuestion[];
  loading: boolean;
}

export default function Quiz({ quiz, loading }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (quiz.length === 0) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Click &quot;Generate Quiz&quot; to create a quiz from your notes
        </p>
      </div>
    );
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    if (selectedAnswer === quiz[currentIndex].correct_answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizComplete(false);
  };

  if (quizComplete) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
        <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Quiz Complete!</h3>
        <p className="text-4xl font-bold text-blue-600 mb-4">
          {score} / {quiz.length}
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {score === quiz.length
            ? 'Perfect score! Excellent work!'
            : score >= quiz.length / 2
            ? 'Good job! Keep studying!'
            : 'Keep practicing! You got this!'}
        </p>
        <button
          onClick={handleRestart}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Restart Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Quiz</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Question {currentIndex + 1} / {quiz.length}
        </span>
      </div>

      <p className="text-lg mb-4 text-gray-800 dark:text-white">
        {quiz[currentIndex]?.question}
      </p>

      <div className="space-y-2 mb-4">
        {quiz[currentIndex]?.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(index)}
            className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
              selectedAnswer === index
                ? showResult
                  ? index === quiz[currentIndex].correct_answer
                    ? 'border-green-500 bg-green-100 dark:bg-green-900'
                    : 'border-red-500 bg-red-100 dark:bg-red-900'
                  : 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                : showResult && index === quiz[currentIndex].correct_answer
                ? 'border-green-500 bg-green-100 dark:bg-green-900'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <span className="text-gray-800 dark:text-white">{option}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        {!showResult ? (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {currentIndex < quiz.length - 1 ? 'Next Question' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  );
}
