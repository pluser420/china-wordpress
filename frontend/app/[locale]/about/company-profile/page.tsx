import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildPageTitle, buildAlternates } from '@/lib/metadata';

interface CompanyProfilePageProps {
  params: { locale: string };
}

// ---------------------------------------------------------------------------
// Static company data (Requirements 11.1)
// ---------------------------------------------------------------------------

const COMPANY_STATS = [
  { label: 'Founded', value: '2009', icon: '📅' },
  { label: 'Facility Location', value: 'Shenzhen, Guangdong, China', icon: '📍' },
  { label: 'Facility Size', value: '1,800 m²', icon: '🏭' },
  { label: 'Daily Output', value: '8,000 tools / day', icon: '⚙️' },
  { label: 'Geographic Reach', value: '15+ Countries', icon: '🌍' },
] as const;

const PRODUCT_SERIES = [
  {
    name: 'Hole Making',
    slug: 'hole-making',
    description: 'Carbide drill bits, reamers, modular drill bits, and deep-hole drilling solutions.',
    icon: '🔩',
  },
  {
    name: 'Milling',
    slug: 'milling',
    description: 'End mills, face mills, T-slot cutters, and brazed milling tools in carbide and HSS.',
    icon: '⚙️',
  },
  {
    name: 'Cavity Tools',
    slug: 'cavity-tools',
    description: 'Precision cavity tools compatible with Sun Hydraulics, HydraForce, Parker, and Eaton Vickers.',
    icon: '🔧',
  },
  {
    name: 'Port Tools',
    slug: 'port-tools',
    description: 'Port machining tools for SAE J1926, ISO 1179, ISO 6149, BSP, and other standards.',
    icon: '🔗',
  },
  {
    name: 'Composite Material Machining',
    slug: 'composite-material-machining',
    description: 'Specialized tools for CFRP, GFRP, and other advanced composite materials.',
    icon: '🛡️',
  },
  {
    name: 'Threading Tools',
    slug: 'threading-tools',
    description: 'Taps, thread mills, and forming tools for a comprehensive range of thread standards.',
    icon: '🔀',
  },
  {
    name: 'Gear Tools',
    slug: 'gear-tools',
    description: 'Gear hobs, broaches, and gear-cutting solutions for precision gear manufacturing.',
    icon: '⚙️',
  },
] as const;

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: CompanyProfilePageProps): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  const alternates = buildAlternates(locale, 'about/company-profile');

  return {
    title: buildPageTitle(t('aboutCompanyProfile')),
    description:
      'Learn about JIAYI Tools — founded in 2009 in Shenzhen, Guangdong, China. ' +
      '1,800 m² facility, 8,000 tools daily output, serving 15+ countries with precision carbide cutting tools.',
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
  };
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default async function CompanyProfilePage({ params }: CompanyProfilePageProps) {
  const { locale } = params;
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  return (
    <div className="min-h-screen bg-white">
      {/* Page Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-4">About JIAYI</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">Company Profile</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Precision carbide cutting tools manufacturer — trusted by engineers across aerospace,
            automotive, medical, and industrial sectors worldwide.
          </p>
        </div>
      </section>

      {/* Company Statistics */}
      <section aria-label="company statistics" className="bg-blue-700 text-white py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl font-bold mb-10 text-blue-100">At a Glance</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
            {COMPANY_STATS.map(({ label, value, icon }) => (
              <div key={label} className="bg-blue-600/40 rounded-xl p-5">
                <div className="text-3xl mb-2">{icon}</div>
                <p className="text-xl sm:text-2xl font-extrabold mb-1">{value}</p>
                <p className="text-blue-200 text-xs font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section aria-label="company story" className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Story</h2>
          <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-4">
            <p>
              Founded in <strong>2009</strong> in <strong>Shenzhen, Guangdong, China</strong>, JIAYI
              Tools has grown from a focused precision tooling startup into a globally recognized
              manufacturer of carbide cutting tools, serving customers across <strong>15+ countries</strong>{' '}
              in North America, Europe, Southeast Asia, and beyond.
            </p>
            <p>
              Headquartered in Shenzhen — China&apos;s technology and manufacturing hub — our{' '}
              <strong>1,800 m²</strong> production facility operates with a daily output capacity of{' '}
              <strong>8,000 tools per day</strong>. Our integrated manufacturing process, from raw
              carbide blanks to final precision-ground tools, ensures consistent quality and rapid
              turnaround for both standard and custom orders.
            </p>
            <p>
              Our engineering team combines deep metallurgical expertise with cutting-edge five-axis
              CNC grinding technology. We work directly with procurement engineers and tooling
              managers to deliver solutions that reduce machining cycle times, improve surface
              finish, and extend tool life.
            </p>
          </div>
        </div>
      </section>

      {/* Core Product Series */}
      <section aria-label="core product series" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">Core Product Series</h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            Seven comprehensive product families covering the full spectrum of precision machining
            applications.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCT_SERIES.map((series) => (
              <div
                key={series.slug}
                className="bg-gray-50 border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{series.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{series.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{series.description}</p>
                <a
                  href={`/${locale}/products/${series.slug}`}
                  className="inline-block mt-4 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  View Products →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality & Certifications */}
      <section
        aria-label="quality and certifications"
        className="py-20 px-4 bg-gradient-to-br from-slate-900 to-blue-950 text-white"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Quality Commitment</h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-10">
            Every JIAYI tool is manufactured to exacting tolerances using premium carbide substrates,
            advanced PVD coatings, and five-axis CNC grinding — backed by rigorous in-process quality
            inspection at every stage of production.
          </p>
          <a
            href={`/${locale}/contact`}
            className="inline-block bg-blue-500 hover:bg-blue-400 text-white font-semibold px-10 py-4 rounded-xl text-lg shadow-lg transition-colors duration-200"
          >
            Contact Our Engineering Team
          </a>
        </div>
      </section>
    </div>
  );
}
