import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { buildPageTitle, buildAlternates } from '@/lib/metadata';

interface CooperatePageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: CooperatePageProps): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  const alternates = buildAlternates(locale, 'services/cooperate');

  return {
    title: buildPageTitle(t('servicesCooperate')),
    description:
      'Partner with JIAYI Tools. We welcome collaboration with distributors, OEM manufacturers, and technical partners worldwide.',
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
  };
}

export default async function CooperatePage({ params }: CooperatePageProps) {
  const { locale } = params;

  return (
    <div className="min-h-screen bg-white">
      {/* Page Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-4">Services</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">Cooperation &amp; Partnerships</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            We&apos;re always interested in building mutually beneficial partnerships with distributors,
            OEM manufacturers, and technical collaborators.
          </p>
        </div>
      </section>

      {/* Content */}
      <section aria-label="cooperation opportunities" className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="font-bold text-gray-900 mb-2">Distribution Partners</h3>
              <p className="text-gray-600 text-sm">
                Expand your product line with our precision carbide tools backed by factory-direct
                pricing and technical support.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-4">🏭</div>
              <h3 className="font-bold text-gray-900 mb-2">OEM Manufacturing</h3>
              <p className="text-gray-600 text-sm">
                Private-label and custom tool manufacturing services for equipment OEMs and tool
                brand owners.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="font-bold text-gray-900 mb-2">Technical Collaboration</h3>
              <p className="text-gray-600 text-sm">
                Joint development projects for specialized tooling in emerging material applications.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Interested in Partnering with Us?</h2>
            <p className="text-gray-600 mb-8">
              Contact our business development team to discuss partnership opportunities, private-label
              manufacturing, or technical collaboration.
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-colors duration-200"
            >
              Contact Business Development
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
