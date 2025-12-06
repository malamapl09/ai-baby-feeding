'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for debugging (production-safe)
    console.error('Global error:', error.digest || error.message);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            fontFamily: 'system-ui, sans-serif',
            backgroundColor: '#FFF1F2',
            padding: '20px',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🍼</div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#E11D48',
              marginBottom: '10px',
            }}
          >
            Oops! Something went wrong
          </h1>
          <p
            style={{
              color: '#6B7280',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            We encountered an unexpected error. Please try again.
          </p>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: '#E11D48',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
