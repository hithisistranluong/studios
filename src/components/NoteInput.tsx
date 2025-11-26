'use client';

import { useState } from 'react';

interface NoteInputProps {
  onNotesChange: (notes: string) => void;
}

export default function NoteInput({ onNotesChange }: NoteInputProps) {
  const [notes, setNotes] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    onNotesChange(e.target.value);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const text = await file.text();
      setNotes(text);
      onNotesChange(text);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Notes
          <input
            type="file"
            accept=".txt,.md"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
        <span className="text-gray-500">or type below</span>
      </div>
      <textarea
        value={notes}
        onChange={handleChange}
        placeholder="Paste or type your notes here..."
        className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
      />
      <p className="text-sm text-gray-500">{notes.length} characters</p>
    </div>
  );
}
