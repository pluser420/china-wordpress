'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary for uncaught root-layout errors.
 *
 * This component must render a complete HTML document since it replaces
 * the root layout when a catastrophic error occurs.
 *
 * Requirement 13.5
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('[GlobalErrorBoundary]', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          backgroundColor: '#f9fafb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '1rem',
        }}
      >
        <div
          style={{
            maxWidth: '28rem',
            width: '100%',
            textAlign: 'center',
          }}
        >
          {/* Icon */}
          <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>⚠️</div>

          {/* Error label */}
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#ef4444',
              marginBottom: '0.5rem',
            }}
          >
            Critical Error
          </p>

          {/* Heading */}
          <h1
            style={{
              fontSize: '1.875rem',
              fontWeight: 800,
              color: '#111827',
              marginBottom: '1rem',
            }}
          >
            Application Error
          </h1>

          {/* Description */}
          <p
            style={{
              color: '#4b5563',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}
          >
            A critical error occurred and the page could not be loaded. Please try refreshing the
            page. If the problem persists, contact our support team.
          </p>

          {/* Error digest */}
          {error.digest && (
            <p
              style={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                fontFamily: 'monospace',
                marginBottom: '2rem',
              }}
            >
              Reference: {error.digest}
            </p>
          )}

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <button
              onClick={reset}
              style={{
                backgroundColor: '#1d4ed8',
                color: '#ffffff',
                fontWeight: 600,
                padding: '0.75rem 2rem',
                borderRadius: '0.75rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                width: '100%',
                maxWidth: '16rem',
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                backgroundColor: '#ffffff',
                color: '#1d4ed8',
                fontWeight: 600,
                padding: '0.75rem 2rem',
                borderRadius: '0.75rem',
                border: '1px solid #bfdbfe',
                textDecoration: 'none',
                fontSize: '1rem',
                display: 'block',
                width: '100%',
                maxWidth: '16rem',
                boxSizing: 'border-box',
              }}
            >
              Go to Home Page
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
