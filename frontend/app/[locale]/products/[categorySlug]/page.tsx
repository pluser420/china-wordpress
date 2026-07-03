/**
 * Category Page
 *
 * Fetches products for the given category slug with pagination (24 per page).
 * Uses `generateStaticParams` to pre-render all seven category slugs.
 * Cache tag: `products-{categorySlug}`.
 * Gracefully handles Strapi being unavailable.
 *
 * Requirements: 3.1–3.9, 5.1–5.5
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getProducts, getCategoryBySlug } from '@/lib/strapi';
import type { ProductItem } from '@/lib/strapi';
import ProductCard from '@/components/ProductCard';

// ---------------------------------------------------------------------------
// Category static data (slugs + subcategory lists for static/fallback render)
// ---------------------------------------------------------------------------

const CATEGORY_SLUGS = [
  'hole-making',
  'milling',
  'cavity-tools',
  'port-tools',
  'composite-material-machining',
  'threading-tools',
  'gear-tools',
] as const;

type KnownCategorySlug = (typeof CATEGORY_SLUGS)[number];

// Subcategory data per requirements 3.6–3.9
const CATEGORY_SUBCATEGORIES: Record<KnownCategorySlug, string[]> = {
  'hole-making': [
    'Carbide Drill Bit',
    'High-Speed Steel Drill Bit',
    'Modular Drill Bit',
    'High-Precision Reamer',
    'Deep-Hole Drill Bit',
    'Custom Drill Bits',
  ],
  milling: [
    'Carbide Milling Cutter',
    'High-Speed Steel Milling Cutter',
    'T-Slot Milling Cutter',
    'Brazed Milling Cutter',
    'Custom Milling Cutters',
  ],
  'cavity-tools': [
    'Sun Hydraulics',
    'HydraForce',
    'Parker',
    'Parker Common',
    'Parker Standard',
    'Eaton Vickers',
  ],
  'port-tools': [
    'SAE J1926',
    'HydraForce',
    'ISO 1179',
    'ISO 6149',
    'Bosch Rexroth',
    'Parker Hannifin',
    'AS 5202',
    'Danfoss',
    'Eaton Vickers',
    'BSPP-G',
  ],
  'composite-material-machining': [],
  'threading-tools': [],
  'gear-tools': [],
};

const CATEGORY_DISPLAY_NAMES: Record<KnownCategorySlug, string> = {
  'hole-making': 'Hole Making',
  milling: 'Milling',
  'cavity-tools': 'Cavity Tools',
  'port-tools': 'Port Tools',
  'composite-material-machining': 'Composite Material Machining',
  'threading-tools': 'Threading Tools',
  'gear-tools': 'Gear Tools',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CategoryPageProps {
  params: { locale: string; categorySlug: string };
  searchParams: { page?: string };
}

// ---------------------------------------------------------------------------
// generateStaticParams — pre-render all 7 category slugs × 2 locales
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const locales = ['en', 'es'];
  return locales.flatMap((locale) =>
    CATEGORY_SLUGS.map((categorySlug) => ({ locale, categorySlug })),
  );
}

// ---------------------------------------------------------------------------
// generateMetadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { locale, categorySlug } = params;

  // Try to get CMS SEO data
  let cmsTitle: string | null = null;
  let cmsDescription: string | null = null;
  let cmsKeywords: string | null = null;

  try {
    const res = await getCategoryBySlug(categorySlug, locale);
    const category = res.data?.[0];
    if (category) {
      cmsTitle = category.attributes.seo?.metaTitle ?? null;
      cmsDescription = category.attributes.seo?.metaDescription ?? null;
      cmsKeywords = category.attributes.seo?.keywords ?? null;
    }
  } catch {
    // Strapi unavailable — fall back to static data
  }

  const displayName =
    CATEGORY_DISPLAY_NAMES[categorySlug as KnownCategorySlug] ?? categorySlug;
  const title = cmsTitle ?? displayName;
  const description =
    cmsDescription ??
    `Browse JIAYI Tools ${displayName} precision carbide cutting tools. ` +
      'High-quality tools engineered for demanding industrial machining applications.';

  return {
    title,
    description,
    ...(cmsKeywords ? { keywords: cmsKeywords } : {}),
    alternates: {
      canonical: `/${locale}/products/${categorySlug}`,
      languages: {
        en: `/en/products/${categorySlug}`,
        es: `/es/products/${categorySlug}`,
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Pagination UI helpers
// ---------------------------------------------------------------------------

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  locale: string;
  categorySlug: string;
  prevLabel: string;
  nextLabel: string;
  pageLabel: string;
  ofLabel: string;
}

function Pagination({
  currentPage,
  totalPages,
  locale,
  categorySlug,
  prevLabel,
  nextLabel,
  pageLabel,
  ofLabel,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const base = `/${locale}/products/${categorySlug}`;

  return (
    <nav
      aria-label="pagination"
      className="flex items-center justify-center gap-4 mt-10"
    >
      {currentPage > 1 ? (
        <Link
          href={`${base}?page=${currentPage - 1}`}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700
                     hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-colors"
        >
          ← {prevLabel}
        </Link>
      ) : (
        <span className="px-4 py-2 rounded-lg border border-gray-100 text-sm font-medium text-gray-300 cursor-not-allowed">
          ← {prevLabel}
        </span>
      )}

      <span className="text-sm text-gray-500">
        {pageLabel} {currentPage} {ofLabel} {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link
          href={`${base}?page=${currentPage + 1}`}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700
                     hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-colors"
        >
          {nextLabel} →
        </Link>
      ) : (
        <span className="px-4 py-2 rounded-lg border border-gray-100 text-sm font-medium text-gray-300 cursor-not-allowed">
          {nextLabel} →
        </span>
      )}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { locale, categorySlug } = params;

  // Validate that this is a known category slug
  if (!(CATEGORY_SLUGS as readonly string[]).includes(categorySlug)) {
    notFound();
  }

  const slug = categorySlug as KnownCategorySlug;

  // Parse page number from search params (default 1)
  const rawPage = parseInt(searchParams.page ?? '1', 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const t = await getTranslations({ locale, namespace: 'products' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  // Fetch category info and products from Strapi
  let categoryName = CATEGORY_DISPLAY_NAMES[slug];
  let categoryDescription: string | null = null;
  let products: ProductItem[] = [];
  let totalPages = 1;
  let strapiAvailable = true;

  try {
    const [categoryRes, productsRes] = await Promise.all([
      getCategoryBySlug(categorySlug, locale),
      getProducts(locale, categorySlug, page),
    ]);

    const category = categoryRes.data?.[0];
    if (category) {
      categoryName = category.attributes.name;
      categoryDescription = category.attributes.description ?? null;
    }

    products = productsRes.data ?? [];
    const pagination = productsRes.meta?.pagination;
    if (pagination) {
      totalPages = pagination.pageCount;
    }
  } catch {
    strapiAvailable = false;
  }

  // Subcategories for this category (from CMS or static fallback)
  const subcategories = CATEGORY_SUBCATEGORIES[slug];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white py-14 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="text-sm text-blue-300 mb-4">
            <Link href={`/${locale}`} className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="mx-2">›</span>
            <Link
              href={`/${locale}/products`}
              className="hover:text-white transition-colors"
            >
              Products
            </Link>
            <span className="mx-2">›</span>
            <span className="text-white">{categoryName}</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">{categoryName}</h1>
          {categoryDescription && (
            <p className="text-blue-200 text-base max-w-2xl">{categoryDescription}</p>
          )}
        </div>
      </div>

      {/* Subcategory tabs / section headings */}
      {subcategories.length > 0 && (
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 py-3 overflow-x-auto">
            <div className="flex gap-2 flex-nowrap min-w-max sm:min-w-0 sm:flex-wrap">
              {subcategories.map((sub) => (
                <span
                  key={sub}
                  className="text-xs sm:text-sm font-medium bg-blue-50 text-blue-700
                             rounded-full px-3 py-1 whitespace-nowrap border border-blue-100"
                >
                  {sub}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products grid */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {!strapiAvailable ? (
          /* Empty state — Strapi not available */
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔧</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {categoryName} Products
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">
              {categoryDescription ??
                `Our ${categoryName} precision cutting tools are currently being updated. Please check back soon or contact us for product information.`}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-block mt-6 bg-blue-700 hover:bg-blue-800 text-white
                         font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              Contact Us for Details
            </Link>
          </div>
        ) : products.length === 0 ? (
          /* Empty state — no products in Strapi yet */
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No products found
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Products in the {categoryName} category are coming soon.
            </p>
          </div>
        ) : (
          <>
            {/* Product count summary */}
            <p className="text-sm text-gray-500 mb-6">
              {t('page')} {page} {t('of')} {totalPages}
            </p>

            {/* Product cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              locale={locale}
              categorySlug={categorySlug}
              prevLabel={tCommon('previous')}
              nextLabel={tCommon('next')}
              pageLabel={t('page')}
              ofLabel={t('of')}
            />
          </>
        )}
      </div>
    </div>
  );
}
