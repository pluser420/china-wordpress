import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { buildPageTitle, buildAlternates } from '@/lib/metadata';
import { getIndustryPageBySlug, type IndustryPageItem } from '@/lib/strapi';
import logger from '@/lib/logger';

interface IndustryPageProps {
  params: {
    locale: string;
    industrySlug: string;
  };
}

// ---------------------------------------------------------------------------
// Supported locales and industry slugs (for generateStaticParams)
// ---------------------------------------------------------------------------

const SUPPORTED_LOCALES = ['en', 'es'] as const;

const INDUSTRY_SLUGS = [
  'aerospace',
  'automotive',
  'medical',
  'power',
  'electronics',
  'hydraulics',
  'shipbuilding',
  'rail-transit',
] as const;

// ---------------------------------------------------------------------------
// Static fallback data for each industry (Requirements 9.1–9.4)
// ---------------------------------------------------------------------------

const INDUSTRY_STATIC_DATA: Record<
  string,
  {
    name: string;
    headline: string;
    description: string;
    relatedCategorySlug: string;
    icon: string;
    highlights: string[];
  }
> = {
  aerospace: {
    name: 'Aerospace & Aviation',
    headline: 'Precision Tools for Demanding Aerospace Applications',
    description:
      'Aerospace manufacturing demands the highest levels of dimensional accuracy, surface integrity, ' +
      'and process repeatability. JIAYI Tools supplies certified carbide drills, reamers, milling cutters, ' +
      'and composite machining tools for titanium alloys (Ti-6Al-4V), aluminum aircraft structures, ' +
      'carbon fiber reinforced polymers (CFRP), and nickel superalloys used in engine components. ' +
      'Our tools are designed to deliver consistent hole quality for structural fastener applications, ' +
      'reduce burr formation on thin-section parts, and provide extended tool life in high-temperature alloys.',
    relatedCategorySlug: 'hole-making',
    icon: '✈️',
    highlights: [
      'Titanium alloy (Ti-6Al-4V) compatible',
      'CFRP & composite machining',
      'Nickel superalloy solutions',
      'Certified dimensional accuracy',
    ],
  },
  automotive: {
    name: 'Automotive Manufacturing',
    headline: 'High-Volume Tooling Solutions for Automotive Production',
    description:
      'Automotive manufacturing operates at relentless cycle times with zero tolerance for quality ' +
      'variation across millions of parts. JIAYI Tools provides high-volume carbide drills, thread taps, ' +
      'cavity tools for hydraulic valve bodies, port tools for engine components, and milling cutters ' +
      'optimized for cast iron, aluminum alloys, and steel used in engine blocks, transmission housings, ' +
      'and brake components. Our tools are engineered for automated production lines with consistent ' +
      'tool life predictability for scheduled maintenance planning.',
    relatedCategorySlug: 'milling',
    icon: '🚗',
    highlights: [
      'Cast iron & aluminum alloys',
      'High-volume production',
      'Predictable tool life',
      'Hydraulic valve body tools',
    ],
  },
  medical: {
    name: 'Medical Devices & Equipment',
    headline: 'Ultra-Precision Tools for Medical Device Manufacturing',
    description:
      'Medical device manufacturing demands impeccable surface finishes, burr-free edges, and strict ' +
      'dimensional repeatability to comply with regulatory requirements. JIAYI Tools provides PCD and ' +
      'carbide tools for machining implant-grade titanium (Grade 5, Grade 23), surgical stainless steel, ' +
      'cobalt-chrome alloys, and medical-grade polymers. Our micro-tools are used in the production of ' +
      'bone screws, dental implants, surgical instruments, and endoscopic components where sub-micron ' +
      'tolerances are mandatory.',
    relatedCategorySlug: 'hole-making',
    icon: '🏥',
    highlights: [
      'Implant-grade titanium',
      'Surgical stainless steel',
      'Cobalt-chrome alloys',
      'Burr-free micro-machining',
    ],
  },
  power: {
    name: 'Power & Energy',
    headline: 'Durable Tooling for Power Generation Equipment',
    description:
      'Power generation equipment — from gas turbine blades to wind turbine gearboxes and hydraulic ' +
      'turbine components — requires tooling that performs reliably in difficult-to-machine superalloys, ' +
      'large-diameter components, and high-integrity machining applications. JIAYI Tools supplies ' +
      'specialized indexable milling cutters, hole-making solutions for large flanges, threading tools ' +
      'for heavy bolt connections, and cavity tools for hydraulic control systems used across thermal, ' +
      'nuclear, and renewable energy sectors.',
    relatedCategorySlug: 'threading-tools',
    icon: '⚡',
    highlights: [
      'Superalloy machining',
      'Large-diameter components',
      'Hydraulic control systems',
      'Wind & thermal energy',
    ],
  },
  electronics: {
    name: 'Electronics & Semiconductors',
    headline: 'Micro-Precision Tools for Electronics Manufacturing',
    description:
      'Electronics manufacturing — PCB fabrication, semiconductor packaging, precision connector ' +
      'machining, and heat sink production — demands micro-precision tools capable of producing ' +
      'features measured in tens of microns. JIAYI Tools provides diamond-coated drills and end mills ' +
      'for PCB routing and drilling, PCD tools for aluminum heat sink machining, and ultra-fine grain ' +
      'carbide micro-drills and end mills for precision connector bodies, mold inserts, and ' +
      'semiconductor lead frames.',
    relatedCategorySlug: 'hole-making',
    icon: '💻',
    highlights: [
      'PCB drilling & routing',
      'PCD heat sink machining',
      'Micro-tool precision',
      'Semiconductor packaging',
    ],
  },
  hydraulics: {
    name: 'Hydraulics',
    headline: 'Specialized Tools for Hydraulic Component Manufacturing',
    description:
      'Hydraulic valve bodies, manifold blocks, and pump housings demand extremely precise bore ' +
      'geometries, thread forms, and port profiles to ensure leak-free performance at high operating ' +
      'pressures. JIAYI Tools is a recognized specialist in cavity tools compatible with Sun Hydraulics, ' +
      'HydraForce, Parker, and Eaton Vickers valve cavities, plus port tools covering SAE J1926, ' +
      'ISO 1179, ISO 6149, BSP, Bosch Rexroth, and Parker Hannifin port standards. All tools are ' +
      'verified against OEM cavity dimension drawings.',
    relatedCategorySlug: 'cavity-tools',
    icon: '🔧',
    highlights: [
      'OEM cavity compatibility',
      'Port tool standards (SAE, ISO, BSP)',
      'High-pressure seal integrity',
      'Manifold block machining',
    ],
  },
  shipbuilding: {
    name: 'Shipbuilding & Marine Engineering',
    headline: 'Heavy-Duty Tooling for Marine and Offshore Applications',
    description:
      'Shipbuilding and marine engineering involve large structural steel fabrication, heavy-duty ' +
      'thread cutting, and precision machining of marine-grade stainless steel, duplex stainless, ' +
      'and copper-nickel alloys. JIAYI Tools provides large-diameter drills and reamers for structural ' +
      'assembly, threading tools for pipe flanges and sea water systems, and milling cutters for propeller ' +
      'shaft housings, rudder stocks, and engine mounting frames. Our tools are engineered to maintain ' +
      'performance in the corrosive marine environment.',
    relatedCategorySlug: 'threading-tools',
    icon: '🚢',
    highlights: [
      'Marine stainless steel',
      'Large-diameter hole making',
      'Duplex stainless steel',
      'Pipe flange threading',
    ],
  },
  'rail-transit': {
    name: 'Rail Transit & Transportation',
    headline: 'Reliable Tooling for Rail and Transit Manufacturing',
    description:
      'Rail and transit manufacturing covers a wide spectrum of applications — from precision bogie ' +
      'machining and wheelset assembly to brake component manufacturing and high-speed rail carriage ' +
      'body fabrication. JIAYI Tools supplies carbide end mills for aluminum carriage profiles, ' +
      'threading tools for track fastener systems, cavity tools for pneumatic brake valve bodies, ' +
      'and hole-making solutions for axle and wheel assembly components. Our tools are used in ' +
      'facilities producing metro cars, high-speed trains, and freight locomotive components.',
    relatedCategorySlug: 'milling',
    icon: '🚆',
    highlights: [
      'Aluminum carriage profiles',
      'Track fastener threading',
      'Brake valve body tools',
      'Wheel & axle components',
    ],
  },
};

// ---------------------------------------------------------------------------
// generateStaticParams — 8 slugs × 2 locales = 16 pages
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.flatMap((locale) =>
    INDUSTRY_SLUGS.map((industrySlug) => ({ locale, industrySlug })),
  );
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: IndustryPageProps): Promise<Metadata> {
  const { locale, industrySlug } = params;
  const fallback = INDUSTRY_STATIC_DATA[industrySlug];

  let cmsName: string | null = null;
  let cmsMetaTitle: string | null = null;
  let cmsMetaDescription: string | null = null;

  try {
    const response = await getIndustryPageBySlug(industrySlug, locale);
    const page = response.data?.[0];
    if (page) {
      cmsName = page.attributes.name;
      cmsMetaTitle = page.attributes.seo?.metaTitle ?? null;
      cmsMetaDescription = page.attributes.seo?.metaDescription ?? null;
    }
  } catch (err) {
    logger.warn({ err, industrySlug, locale }, 'Strapi unavailable for industry metadata');
  }

  const name = cmsName ?? fallback?.name ?? industrySlug;
  const alternates = buildAlternates(locale, `industries/${industrySlug}`);

  return {
    title: buildPageTitle(cmsMetaTitle ?? name),
    description:
      cmsMetaDescription ??
      `JIAYI Tools precision cutting solutions for the ${name} industry. ` +
        `Discover specialized carbide tools, technical specifications, and contact our engineering team.`,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
  };
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default async function IndustryApplicationPage({ params }: IndustryPageProps) {
  const { locale, industrySlug } = params;
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  // Validate slug
  if (!INDUSTRY_STATIC_DATA[industrySlug]) {
    notFound();
  }

  const fallback = INDUSTRY_STATIC_DATA[industrySlug];

  // Fetch from Strapi; fall back to static data on failure
  let cmsPage: IndustryPageItem | null = null;

  try {
    const response = await getIndustryPageBySlug(industrySlug, locale);
    cmsPage = response.data?.[0] ?? null;
  } catch (err) {
    logger.warn({ err, industrySlug, locale }, 'Strapi unavailable for industry page; using static fallback');
  }

  // Resolve content (CMS first, then static fallback)
  const name = cmsPage?.attributes.name ?? fallback.name;
  const headline = cmsPage?.attributes.headline ?? fallback.headline;
  const description = cmsPage?.attributes.description ?? fallback.description;
  const imageUrl = cmsPage?.attributes.image?.data?.attributes.url ?? null;
  const relatedCategorySlug =
    cmsPage?.attributes.relatedCategory?.data?.attributes.slug ?? fallback.relatedCategorySlug;

  return (
    <div className="min-h-screen bg-white">
      {/* Page Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-4">
            Industry Applications
          </p>
          <div className="text-5xl mb-4">{fallback.icon}</div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">{name}</h1>
          <p className="text-blue-100 text-xl max-w-2xl mx-auto">{headline}</p>
        </div>
      </section>

      {/* Representative Imagery */}
      {imageUrl && (
        <div className="relative w-full h-64 sm:h-96 bg-gray-100">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            priority={true}
            sizes="100vw"
          />
        </div>
      )}

      {/* Industry Description */}
      <section aria-label="industry description" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main description */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                JIAYI Tools for {name}
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">{description}</p>

              <div className="mt-10">
                <Link
                  href={`/${locale}/products/${relatedCategorySlug}`}
                  className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors duration-200 shadow-md"
                >
                  View Related Tools →
                </Link>
              </div>
            </div>

            {/* Highlights sidebar */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 h-fit">
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">
                Key Capabilities
              </h3>
              <ul className="space-y-3">
                {fallback.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3">
                    <span className="text-blue-500 mt-0.5">✓</span>
                    <span className="text-gray-700 text-sm">{highlight}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link
                  href={`/${locale}/contact`}
                  className="block text-center text-sm font-semibold text-blue-600 border border-blue-200 rounded-lg py-3 hover:bg-blue-50 transition-colors"
                >
                  Request Technical Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        aria-label="contact CTA"
        className="py-16 px-4 bg-gray-50 text-center border-t border-gray-100"
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Optimise Your {name} Process?
          </h2>
          <p className="text-gray-500 mb-8">
            Our application engineers can help you select the right tools and cutting parameters
            for your specific workpiece materials and machining conditions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/products/${relatedCategorySlug}`}
              className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded-xl transition-colors duration-200"
            >
              Browse Related Products
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="inline-block bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 font-semibold px-8 py-3 rounded-xl transition-colors duration-200"
            >
              Contact Engineering Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
