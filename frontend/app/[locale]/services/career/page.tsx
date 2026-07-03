import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { buildPageTitle, buildAlternates } from '@/lib/metadata';

interface CareerPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: CareerPageProps): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  const alternates = buildAlternates(locale, 'services/career');

  return {
    title: buildPageTitle(t('servicesCareer')),
    description:
      'Join JIAYI Tools. We are looking for talented engineers, machinists, and sales professionals to grow with us.',
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
  };
}

export default async function CareerPage({ params }: CareerPageProps) {
  const { locale } = params;

  return (
    <div className="min-h-screen bg-white">
      {/* Page Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-4">Services</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">Career Opportunities</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Join the JIAYI Tools team and help us deliver precision carbide cutting solutions to
            industries worldwide.
          </p>
        </div>
      </section>

      {/* Content */}
      <section aria-label="career information" className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">💼</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Building Our Team</h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            We&apos;re currently seeking skilled engineers, CNC machinists, quality inspectors, and
            technical sales representatives. If you&apos;re passionate about precision manufacturing
            and eager to contribute to a growing company, we&apos;d love to hear from you.
          </p>
          <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-2xl mx-auto">
            <h3 className="font-bold text-gray-900 mb-4">Send Your CV</h3>
            <p className="text-gray-600 mb-6">
              Please send your résumé and a brief introduction to our HR department via the
              contact form.
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded-xl transition-colors duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
