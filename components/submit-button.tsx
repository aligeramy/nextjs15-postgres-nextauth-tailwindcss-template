'use client';

import { useFormStatus } from 'react-dom';

export function SubmitButton({
  children,
  isSuccessful = false,
}: {
  children: React.ReactNode;
  isSuccessful?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className="bg-black rounded-md px-4 py-3 text-sm text-white transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 dark:bg-white dark:text-black dark:hover:bg-zinc-300"
      type="submit"
      disabled={pending || isSuccessful}
    >
      {pending ? (
        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white dark:border-black" />
      ) : isSuccessful ? (
        <div className="flex items-center justify-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Redirecting...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
} 