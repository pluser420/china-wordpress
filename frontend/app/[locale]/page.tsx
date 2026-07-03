import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { getHomePageData } from '@/lib/strapi';
import type { CategoryItem, IndustryPageItem, ProductItem } from '@/lib/strapi';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HomePageProps {
  params: { locale: string };
}

// ---------------------------------------------------------------------------
// Static fallback data (shown when Strapi is not available)
// ---------------------------------------------------------------------------

const CATEGORY_SLUGS = [
  { key: 'holeMaking', slug: 'hole-making' },
  { key: 'milling', slug: 'milling' },
  { key: 'cavityTools', slug: 'cavity-tools' },
  { key: 'portTools', slug: 'port-tools' },
  { key: 'compositeMaterialMachining', slug: 'composite-material-machining' },
  { key: 'threadingTools', slug: 'threading-tools' },
  { key: 'gearTools', slug: 'gear-tools' },
] as const;

const INDUSTRY_SLUGS = [
  { key: 'aerospace', slug: 'aerospace' },
  { key: 'automotive', slug: 'automotive' },
  { key: 'medical', slug: 'medical' },
  { key: 'power', slug: 'power' },
  { key: 'electronics', slug: 'electronics' },
  { key: 'hydraulics', slug: 'hydraulics' },
  { key: 'shipbuilding', slug: 'shipbuilding' },
  { key: 'railTransit', slug: 'rail-transit' },
] as const;

const COMPANY_STATS = [
  { labelKey: 'statFounded', value: '2009' },
  { labelKey: 'statFacilitySize', value: '1,800 m²' },
  { labelKey: 'statDailyOutput', value: '8,000 tools' },
  { labelKey: 'statCountriesServed', value: '15' },
] as const;

const WHY_CHOOSE_FEATURES = [
  {
    labelKey: 'whyCustomTooling' as const,
    description: 'Tailored cutting tools engineered for your exact machining requirements.',
    icon: '⚙️',
  },
  {
    labelKey: 'whyAdvancedCoatings' as const,
    description: 'PVD/CVD coatings that extend tool life and improve surface finishes.',
    icon: '✨',
  },
  {
    labelKey: 'whyPrecisionManufacturing' as const,
    description: 'Five-axis CNC grinding with Walter and Rollomatic equipment.',
    icon: '🎯',
  },
  {
    labelKey: 'whyCompetitivePricing' as const,
    description: 'Factory-direct pricing with no intermediary markups.',
    icon: '💰',
  },
] as const;

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'home' });

  return {
    title: t('heroHeadline'),
    description: 'JIAYI Tools manufactures precision carbide cutting tools for global industries. ' +
      'Explore our product catalog of hole making, milling, cavity tools, and more.',
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        es: '/es',
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** A placeholder product card shown when Strapi data is unavailable */
function PlaceholderProductCard({
  categoryName,
  categorySlug,
  locale,
}: {
  categoryName: string;
  categorySlug: string;
  locale: string;
}) {
  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Placeholder image */}
      <div className="bg-gradient-to-br from-blue-50 to-slate-100 h-44 flex items-center justify-center">
        <span className="text-4xl">🔧</span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-1">
          {categoryName}
        </span>
        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
          {categoryName} — Precision Carbide Tool
        </h3>
        <p className="text-gray-500 text-xs mb-4 flex-1 line-clamp-3">
          High-performance carbide tool engineered for demanding machining applications.
        </p>
        <Link
          href={`/${locale}/products/${categorySlug}`}
          className="inline-block text-center text-sm font-medium text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
        >
          View Category →
        </Link>
      </div>
    </article>
  );
}

/** A real product card built from Strapi data */
function ProductCard({
  product,
  locale,
  priority = false,
}: {
  product: ProductItem;
  locale: string;
  /** Set true for the first card to preload the LCP-candidate image */
  priority?: boolean;
}) {
  const { attributes } = product;
  const categorySlug = attributes.category?.data?.attributes.slug ?? 'products';
  const imageUrl = attributes.images?.data?.[0]?.attributes.url;
  const description = attributes.shortDescription ?? '';

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className="bg-gradient-to-br from-blue-50 to-slate-100 h-44 flex items-center justify-center overflow-hidden relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={attributes.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
            priority={priority}
          />
        ) : (
          <span className="text-4xl">🔧</span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-1">
          {attributes.category?.data?.attributes.name ?? ''}
        </span>
        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
          {attributes.name}
        </h3>
        {description && (
          <p className="text-gray-500 text-xs mb-4 flex-1 line-clamp-3">
            {description.slice(0, 160)}
          </p>
        )}
        <Link
          href={`/${locale}/products/${categorySlug}/${attributes.slug}`}
          className="inline-block text-center text-sm font-medium text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
        >
          View Details →
        </Link>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const tCats = await getTranslations({ locale, namespace: 'categories' });
  const tIndustries = await getTranslations({ locale, namespace: 'industries' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  // Fetch data from Strapi; gracefully degrade if Strapi is not available
  let featuredProducts: ProductItem[] = [];
  let categories: CategoryItem[] = [];
  let industryPages: IndustryPageItem[] = [];
  let strapiAvailable = true;

  try {
    const data = await getHomePageData(locale);
    featuredProducts = data.featuredProducts;
    categories = data.categories;
    industryPages = data.industryPages;
  } catch {
    strapiAvailable = false;
  }

  // Build one featured product card per category (7 minimum)
  // If Strapi data is available, pick the first product for each category;
  // otherwise fall back to placeholder cards.
  const featuredCardsByCategoryKey = CATEGORY_SLUGS.map(({ key, slug }) => {
    // Try to find a real product for this category
    const product = strapiAvailable
      ? featuredProducts.find(
          (p) => p.attributes.category?.data?.attributes.slug === slug,
        )
      : undefined;

    // Also look up the live category name from Strapi if available
    const liveCategory = categories.find((c) => c.attributes.slug === slug);
    const categoryName = liveCategory?.attributes.name ?? tCats(key);

    return { key, slug, product, categoryName };
  });

  return (
    <div className="min-h-screen bg-white">
      {/* ----------------------------------------------------------------- */}
      {/* Hero Section                                                        */}
      {/* ----------------------------------------------------------------- */}
      <section
        aria-label="hero"
        className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-white py-28 px-4 overflow-hidden"
      >
        {/* Decorative background grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-5xl mx-auto text-center">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-4">
            JIAYI Tools — Shenzhen, China
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            {t('heroHeadline')}
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            {t('heroSubheadline')}
          </p>
          <Link
            href={`/${locale}/products`}
            className="inline-block bg-blue-500 hover:bg-blue-400 text-white font-semibold px-10 py-4 rounded-xl text-lg shadow-lg transition-colors duration-200"
          >
            {t('heroCTA')}
          </Link>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Company Statistics Section                                          */}
      {/* ----------------------------------------------------------------- */}
      <section
        aria-label="company statistics"
        className="bg-blue-700 text-white py-14 px-4"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl font-bold mb-10 text-blue-100">
            {t('companyStats')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {COMPANY_STATS.map(({ labelKey, value }) => (
              <div key={labelKey}>
                <p className="text-3xl sm:text-4xl font-extrabold mb-1">{value}</p>
                <p className="text-blue-200 text-sm font-medium">{t(labelKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Featured Products Section                                           */}
      {/* ----------------------------------------------------------------- */}
      <section aria-label="featured products" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
            {t('featuredProducts')}
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            Seven precision tool categories engineered for demanding applications worldwide.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredCardsByCategoryKey.map(({ key, slug, product, categoryName }, index) =>
              product ? (
                // priority={true} on the first card — likely LCP candidate (Requirement 10.2)
                <ProductCard key={key} product={product} locale={locale} priority={index === 0} />
              ) : (
                <PlaceholderProductCard
                  key={key}
                  categoryName={categoryName}
                  categorySlug={slug}
                  locale={locale}
                />
              ),
            )}
          </div>

          <div className="text-center mt-12">
            <Link
              href={`/${locale}/products`}
              className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded-xl transition-colors duration-200"
            >
              {tCommon('viewAll')} Products
            </Link>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Industry Applications Section                                       */}
      {/* ----------------------------------------------------------------- */}
      <section aria-label="industry applications" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
            {t('industryApplications')}
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            Precision tooling solutions trusted across eight global industries.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INDUSTRY_SLUGS.map(({ key, slug }) => {
              // Prefer live Strapi data; fall back to translation keys
              const liveIndustry = industryPages.find(
                (i) => i.attributes.slug === slug,
              );
              const name = liveIndustry?.attributes.name ?? tIndustries(key);
              const headline = liveIndustry?.attributes.headline ?? null;

              return (
                <Link
                  key={key}
                  href={`/${locale}/industries/${slug}`}
                  className="group bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-xl p-6 transition-all duration-200 flex flex-col gap-2"
                >
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors text-sm">
                    {name}
                  </h3>
                  {headline && (
                    <p className="text-gray-500 text-xs line-clamp-2">{headline}</p>
                  )}
                  <span className="text-blue-500 text-xs mt-auto pt-2 font-medium">
                    {tCommon('learnMore')} →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Why Choose JIAYI Section                                            */}
      {/* ----------------------------------------------------------------- */}
      <section
        aria-label="why choose JIAYI"
        className="py-20 px-4 bg-gradient-to-br from-slate-900 to-blue-950 text-white"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">
            {t('whyChooseJiayi')}
          </h2>
          <p className="text-blue-200 text-center mb-14 max-w-2xl mx-auto">
            Over 15 years of precision carbide tooling expertise, serving industries across 15 countries.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CHOOSE_FEATURES.map(({ labelKey, description, icon }) => (
              <div
                key={labelKey}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 transition-colors duration-200"
              >
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-bold text-white mb-2">{t(labelKey)}</h3>
                <p className="text-blue-200 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Bottom CTA                                                          */}
      {/* ----------------------------------------------------------------- */}
      <section aria-label="contact CTA" className="py-16 px-4 bg-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to find the right tool?
          </h2>
          <p className="text-gray-500 mb-8">
            Contact our engineering team for custom tooling solutions and competitive quotations.
          </p>
          <Link
            href={`/${locale}/contact`}
            className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-semibold px-10 py-4 rounded-xl text-lg shadow transition-colors duration-200"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
