'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Log the error to the console and any monitoring service if needed
    console.error('Admin route error:', error);
  }, [error]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-2">Something went wrong in Admin</h2>
      <p className="text-sm text-muted-foreground break-words">{error?.message || 'Unknown error'}</p>
      <div className="mt-4">
        <button className="px-3 py-2 rounded-md bg-primary text-primary-foreground" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </div>
  );
}
