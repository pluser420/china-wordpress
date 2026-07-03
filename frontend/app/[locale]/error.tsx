'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Locale-level error boundary.
 * Renders a user-friendly 500-context error page with a "Try again" button
 * and a link back to the home page.
 *
 * Requirement 13.5
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to console — server-side pino logging occurs upstream in the RSC
    console.error('[ErrorBoundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error illustration */}
        <div className="text-8xl mb-6">⚠️</div>

        {/* Error code */}
        <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">
          Error 500
        </p>

        {/* Heading */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
          Something Went Wrong
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          We encountered an unexpected error while processing your request. Our team has been
          notified. Please try again or return to the home page.
        </p>

        {/* Error digest for support reference (visible only when present) */}
        {error.digest && (
          <p className="text-xs text-gray-400 font-mono mb-8">
            Reference: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded-xl transition-colors duration-200"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-block bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 font-semibold px-8 py-3 rounded-xl transition-colors duration-200"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
