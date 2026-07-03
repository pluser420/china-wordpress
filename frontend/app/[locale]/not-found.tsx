import Link from 'next/link';

/**
 * Locale-level 404 not-found page.
 * Rendered when `notFound()` is called within the [locale] route segment.
 *
 * This is a Server Component — no 'use client' directive needed.
 * Uses static text to avoid i18n bootstrapping overhead for a simple 404.
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Large 404 number */}
        <p className="text-8xl font-extrabold text-blue-700 mb-2">404</p>

        {/* Subheading */}
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
          Page Not Found
        </p>

        {/* Heading */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
          This Page Doesn&apos;t Exist
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-10 leading-relaxed">
          The page you&apos;re looking for may have been moved, renamed, or is no longer available.
          Check the URL or navigate back to our home page.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded-xl transition-colors duration-200"
          >
            Back to Home
          </Link>
          <Link
            href="/en/products"
            className="inline-block bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 font-semibold px-8 py-3 rounded-xl transition-colors duration-200"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
