import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { buildPageTitle, buildAlternates } from '@/lib/metadata';

interface TechnologyPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: TechnologyPageProps): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  const alternates = buildAlternates(locale, 'services/technology');

  return {
    title: buildPageTitle(t('servicesTechnology')),
    description:
      'JIAYI Tools cutting-edge technology: five-axis CNC grinding, PVD coating processes, advanced carbide substrates, and precision quality control.',
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
  };
}

export default async function TechnologyPage({ params }: TechnologyPageProps) {
  const { locale } = params;

  return (
    <div className="min-h-screen bg-white">
      {/* Page Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-4">Services</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">Technology &amp; Innovation</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Precision manufacturing powered by world-class grinding equipment, advanced coating
            technologies, and rigorous quality control.
          </p>
        </div>
      </section>

      {/* Technology Highlights */}
      <section aria-label="technology highlights" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm">Five-Axis CNC Grinding</h3>
              <p className="text-gray-600 text-xs">
                Walter &amp; Rollomatic equipment delivering sub-micron precision
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm">PVD Coating Technology</h3>
              <p className="text-gray-600 text-xs">
                TiAlN, AlCrN, and DLC coatings for extended tool life
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm">Advanced Substrates</h3>
              <p className="text-gray-600 text-xs">
                PCD, PCBN, cermet, ultrafine-grain carbide expertise
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-4">📏</div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm">Quality Inspection</h3>
              <p className="text-gray-600 text-xs">
                Zoller presetter verification, in-process inspection
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-10 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Manufacturing Excellence
            </h2>
            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-4">
              <p>
                JIAYI Tools&apos; manufacturing process combines the latest grinding technology with
                decades of accumulated metallurgical and machining process knowledge. Every tool passes
                through multiple quality checkpoints before leaving our facility.
              </p>
              <p>
                Our five-axis CNC grinding centers from Walter and Rollomatic enable the production of
                complex geometries — helical flutes, variable rake angles, multi-stage cutting edges,
                and specialized chip-breaker designs — all maintained to tight tolerances even on
                micro-diameter tools.
              </p>
              <p>
                PVD coating is performed in partnership with certified coating suppliers who meet our
                specifications for coating uniformity, adhesion strength, and hardness. We work with
                our coating partners to select the optimal coating architecture for each substrate and
                application.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Learn More Section */}
      <section
        aria-label="learn more about our technology"
        className="py-16 px-4 bg-white text-center border-t border-gray-100"
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Want to Learn More About Our Manufacturing Process?
          </h2>
          <p className="text-gray-600 mb-8">
            Contact our engineering team to discuss how our technology can solve your machining
            challenges or to arrange a facility tour.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/about/rd-manufacturing`}
              className="inline-block bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 font-semibold px-8 py-3 rounded-xl transition-colors duration-200"
            >
              R&amp;D &amp; Manufacturing
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded-xl transition-colors duration-200"
            >
              Contact Engineering Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
