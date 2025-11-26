'use client';

interface SummaryProps {
  summary: string;
  loading: boolean;
}

export default function Summary({ summary, loading }: SummaryProps) {
  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Click &quot;Summarize&quot; to generate a summary of your notes
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Summary</h3>
      <div className="prose dark:prose-invert max-w-none">
        <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{summary}</div>
      </div>
    </div>
  );
}
