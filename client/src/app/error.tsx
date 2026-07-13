'use client';

import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <div>
        <h1>Something went wrong.</h1>
        <p>{error.message}</p>
        <button onClick={() => reset()}>Try again</button>
      </div>
    </div>
  );
}
