'use client';

import { useState } from 'react';

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardsProps {
  flashcards: Flashcard[];
  loading: boolean;
}

export default function Flashcards({ flashcards, loading }: FlashcardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Click &quot;Generate Flashcards&quot; to create study flashcards
        </p>
      </div>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? flashcards.length - 1 : prev - 1));
    setIsFlipped(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === flashcards.length - 1 ? 0 : prev + 1));
    setIsFlipped(false);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Flashcards</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentIndex + 1} / {flashcards.length}
          </span>
        </div>
        
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="cursor-pointer perspective-1000"
        >
          <div
            className="relative w-full h-48 transition-transform duration-500"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            {/* Front of card */}
            <div 
              className="absolute inset-0 p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg flex items-center justify-center"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <p className="text-white text-center text-lg font-medium">
                {flashcards[currentIndex]?.front}
              </p>
            </div>
            
            {/* Back of card */}
            <div 
              className="absolute inset-0 p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg flex items-center justify-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-white text-center text-lg font-medium">
                {flashcards[currentIndex]?.back}
              </p>
            </div>
          </div>
        </div>
        
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Click the card to flip
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={handlePrevious}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
