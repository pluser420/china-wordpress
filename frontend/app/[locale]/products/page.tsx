/**
 * Products Overview Page
 *
 * Lists all seven product categories with links to their respective category pages.
 * Fetches live category data from Strapi when available; falls back to static
 * data when Strapi is unavailable.
 *
 * Requirements: 3.1, 5.1–5.5
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getCategories } from '@/lib/strapi';
import type { CategoryItem } from '@/lib/strapi';

// ---------------------------------------------------------------------------
// Static category data (fallback when Strapi is unavailable)
// ---------------------------------------------------------------------------

const STATIC_CATEGORIES = [
  {
    key: 'holeMaking',
    slug: 'hole-making',
    subcategories: [
      'Carbide Drill Bit',
      'High-Speed Steel Drill Bit',
      'Modular Drill Bit',
      'High-Precision Reamer',
      'Deep-Hole Drill Bit',
      'Custom Drill Bits',
    ],
  },
  {
    key: 'milling',
    slug: 'milling',
    subcategories: [
      'Carbide Milling Cutter',
      'High-Speed Steel Milling Cutter',
      'T-Slot Milling Cutter',
      'Brazed Milling Cutter',
      'Custom Milling Cutters',
    ],
  },
  {
    key: 'cavityTools',
    slug: 'cavity-tools',
    subcategories: [
      'Sun Hydraulics',
      'HydraForce',
      'Parker',
      'Parker Common',
      'Parker Standard',
      'Eaton Vickers',
    ],
  },
  {
    key: 'portTools',
    slug: 'port-tools',
    subcategories: [
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
  },
  {
    key: 'compositeMaterialMachining',
    slug: 'composite-material-machining',
    subcategories: [],
  },
  {
    key: 'threadingTools',
    slug: 'threading-tools',
    subcategories: [],
  },
  {
    key: 'gearTools',
    slug: 'gear-tools',
    subcategories: [],
  },
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductsPageProps {
  params: { locale: string };
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: ProductsPageProps): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'nav' });

  return {
    title: t('products'),
    description:
      'Browse JIAYI Tools precision carbide cutting tools across seven product categories: ' +
      'Hole Making, Milling, Cavity Tools, Port Tools, Composite Material Machining, Threading Tools, and Gear Tools.',
    alternates: {
      canonical: `/${locale}/products`,
      languages: {
        en: '/en/products',
        es: '/es/products',
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  const tCats = await getTranslations({ locale, namespace: 'categories' });

  // Attempt to load live categories from Strapi
  let liveCategories: CategoryItem[] = [];
  try {
    const res = await getCategories(locale);
    liveCategories = res.data ?? [];
  } catch {
    // Strapi unavailable — render with static data
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold mb-4">{t('products')}</h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Precision carbide cutting tools engineered for demanding industrial applications
            worldwide.
          </p>
        </div>
      </div>

      {/* Category grid */}
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STATIC_CATEGORIES.map(({ key, slug, subcategories }) => {
            // Prefer live Strapi data when available
            const live = liveCategories.find((c) => c.attributes.slug === slug);
            const name = live?.attributes.name ?? tCats(key);
            const description = live?.attributes.description ?? null;
            const liveSubcategories: string[] =
              (live?.attributes.subcategories as string[] | null) ?? subcategories;

            return (
              <Link
                key={slug}
                href={`/${locale}/products/${slug}`}
                className="group bg-white rounded-xl shadow-sm border border-gray-100
                           hover:shadow-md hover:border-blue-200 transition-all duration-200
                           p-6 flex flex-col gap-3"
              >
                {/* Category name */}
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                  {name}
                </h2>

                {/* Description (if available) */}
                {description && (
                  <p className="text-gray-500 text-sm line-clamp-2">{description}</p>
                )}

                {/* Subcategory chips */}
                {liveSubcategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {liveSubcategories.slice(0, 4).map((sub) => (
                      <span
                        key={sub}
                        className="text-xs bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 font-medium"
                      >
                        {sub}
                      </span>
                    ))}
                    {liveSubcategories.length > 4 && (
                      <span className="text-xs text-gray-400 px-1 py-0.5">
                        +{liveSubcategories.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* CTA */}
                <span className="text-blue-600 text-sm font-semibold mt-auto pt-2 group-hover:underline">
                  Browse {name} →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
