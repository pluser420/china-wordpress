import type { Metadata } from 'next';
import type { SearchParams } from 'next/dist/server/request/search-params';
import { buildPageTitle, buildAlternates } from '../../../lib/metadata';
import InquiryForm from '../../../components/InquiryForm';

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const alternates = buildAlternates(locale, 'contact');

  return {
    title: buildPageTitle('Contact Us'),
    description:
      'Contact JIAYI Tools to request a quote, ask about our precision carbide cutting tools, or learn about custom tooling solutions. We serve customers in 15+ countries.',
    alternates,
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

interface ContactPageProps {
  params: { locale: string };
  searchParams: SearchParams;
}

export default async function ContactPage({
  params,
  searchParams,
}: ContactPageProps) {
  const { locale } = params;

  // Extract pre-population values from URL query params
  // e.g. /en/contact?product=Carbide+Drill+Bit&category=Hole+Making
  const product = typeof searchParams.product === 'string' ? searchParams.product : undefined;
  const category =
    typeof searchParams.category === 'string' ? searchParams.category : undefined;

  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <div className="bg-gray-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact Us</h1>
          <p className="mt-3 text-lg text-gray-300">
            Get in touch with our team for inquiries, quotes, and custom tooling solutions.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Contact information */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Get in Touch</h2>
            <p className="mt-3 text-base text-gray-600">
              We respond to all inquiries within 24 hours during business days.
              For urgent matters, please call us directly.
            </p>

            <dl className="mt-8 space-y-6">
              {/* Address */}
              <div className="flex gap-3">
                <dt className="sr-only">Address</dt>
                <div
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.013 3.956-5.07 3.956-8.827a8.25 8.25 0 00-16.5 0c0 3.758 2.012 6.814 3.957 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M12 9a2.25 2.25 0 100 4.5A2.25 2.25 0 0012 9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <dd className="text-sm text-gray-700">
                  <p className="font-semibold text-gray-900">Company Address</p>
                  <address className="mt-1 not-italic leading-6">
                    Shenzhen, Guangdong, China
                  </address>
                </dd>
              </div>

              {/* Phone */}
              <div className="flex gap-3">
                <dt className="sr-only">Phone</dt>
                <div
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <dd className="text-sm text-gray-700">
                  <p className="font-semibold text-gray-900">Phone</p>
                  <a href="tel:+8675512345678" className="mt-1 block hover:text-blue-600">
                    +86 755 1234 5678
                  </a>
                </dd>
              </div>

              {/* Email */}
              <div className="flex gap-3">
                <dt className="sr-only">Email</dt>
                <div
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                  </svg>
                </div>
                <dd className="text-sm text-gray-700">
                  <p className="font-semibold text-gray-900">Email</p>
                  <a
                    href="mailto:info@jiayitools.com"
                    className="mt-1 block hover:text-blue-600"
                  >
                    info@jiayitools.com
                  </a>
                </dd>
              </div>
            </dl>

            {/* Map placeholder */}
            <div className="mt-10">
              <h3 className="sr-only">Location map</h3>
              <div
                role="img"
                aria-label="Map showing JIAYI Tools location in Shenzhen, Guangdong, China"
                className="h-64 w-full overflow-hidden rounded-lg bg-gray-200 flex items-center
                           justify-center text-gray-500 text-sm"
              >
                {/* Google Maps embed or static map image goes here */}
                <span>Map — Shenzhen, Guangdong, China</span>
              </div>
            </div>
          </div>

          {/* Inquiry form */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Send us a message</h2>
            <p className="mt-2 text-sm text-gray-600">
              Fields marked with <span aria-hidden="true" className="text-red-500">*</span>{' '}
              are required.
            </p>
            <div className="mt-6">
              <InquiryForm
                defaultProductName={product}
                defaultCategory={category}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
