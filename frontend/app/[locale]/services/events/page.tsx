import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { buildPageTitle, buildAlternates } from '@/lib/metadata';

interface EventsPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: EventsPageProps): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  const alternates = buildAlternates(locale, 'services/events');

  return {
    title: buildPageTitle(t('servicesEvents')),
    description:
      'JIAYI Tools trade show participation and industry events. Visit us at upcoming exhibitions to see our latest precision cutting tool innovations.',
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
  };
}

export default async function EventsPage({ params }: EventsPageProps) {
  const { locale } = params;

  return (
    <div className="min-h-screen bg-white">
      {/* Page Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-4">Services</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">Trade Shows &amp; Events</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Meet the JIAYI Tools team at industry trade shows and technical exhibitions worldwide.
          </p>
        </div>
      </section>

      {/* Content */}
      <section aria-label="events information" className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">📅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            We participate regularly in major metalworking and manufacturing trade shows across Asia,
            Europe, and North America. Visit our booth to see product demonstrations, discuss your
            tooling challenges with our engineers, and receive special show-only pricing.
          </p>

          <div className="bg-white rounded-xl border border-gray-200 p-10 max-w-2xl mx-auto">
            <h3 className="font-bold text-gray-900 mb-4">Stay Updated</h3>
            <p className="text-gray-600 mb-6">
              Contact us to receive notifications about our upcoming trade show participation and
              exhibition schedules.
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded-xl transition-colors duration-200"
            >
              Contact Us
            </Link>
          </div>

          <div className="mt-12 max-w-2xl mx-auto">
            <p className="text-sm text-gray-500">
              Past events include: EMO Hannover, IMTS Chicago, CIMT Beijing, and regional metalworking
              exhibitions across Southeast Asia.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
