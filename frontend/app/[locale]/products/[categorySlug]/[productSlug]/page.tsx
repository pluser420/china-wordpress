/**
 * Individual Product Page
 *
 * Fetches a single product from Strapi by slug and locale.
 * Uses `generateStaticParams` returning an empty array (products are too dynamic
 * for full static generation at build time).
 * Cache tag: `product-{slug}`.
 *
 * Requirements: 4.1–4.7, 5.1–5.5, 5.8
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getProductBySlug, getStrapiURL } from '@/lib/strapi';
import type { ProductItem, StrapiMediaItem } from '@/lib/strapi';
import ProductCard from '@/components/ProductCard';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductPageProps {
  params: { locale: string; categorySlug: string; productSlug: string };
}

// ---------------------------------------------------------------------------
// generateStaticParams — return empty array (dynamic at request time)
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  // Products are updated too frequently to pre-render at build time.
  // Pages are rendered on-demand and cached via ISR cache tags.
  return [];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveMediaUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return getStrapiURL(url);
}

// ---------------------------------------------------------------------------
// generateMetadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale, categorySlug, productSlug } = params;

  let cmsTitle: string | null = null;
  let cmsDescription: string | null = null;
  let cmsKeywords: string | null = null;
  let productName: string = productSlug;

  try {
    const res = await getProductBySlug(productSlug, locale);
    const product = res.data?.[0];
    if (product) {
      productName = product.attributes.name;
      cmsTitle = product.attributes.seo?.metaTitle ?? null;
      cmsDescription = product.attributes.seo?.metaDescription ?? null;
      cmsKeywords = product.attributes.seo?.keywords ?? null;
    }
  } catch {
    // Strapi unavailable — fall back to slug-based title
  }

  const title = cmsTitle ?? `${productName} | JIAYI Tools`;
  const description =
    cmsDescription ??
    `${productName} — precision carbide cutting tool by JIAYI Tools. ` +
      'Engineered for demanding industrial machining applications.';

  return {
    title,
    description,
    ...(cmsKeywords ? { keywords: cmsKeywords } : {}),
    alternates: {
      canonical: `/${locale}/products/${categorySlug}/${productSlug}`,
      languages: {
        en: `/en/products/${categorySlug}/${productSlug}`,
        es: `/es/products/${categorySlug}/${productSlug}`,
      },
    },
  };
}

// ---------------------------------------------------------------------------
// JSON-LD builder
// ---------------------------------------------------------------------------

function buildProductJsonLd(
  product: ProductItem,
  firstImageUrl: string | null,
): Record<string, unknown> {
  const attrs = product.attributes;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: attrs.name,
    description: attrs.shortDescription ?? attrs.fullDescription ?? '',
    brand: {
      '@type': 'Brand',
      name: 'JIAYI Tools',
    },
    image: firstImageUrl ?? '',
    sku: attrs.slug,
  };
}

// ---------------------------------------------------------------------------
// Image Gallery component (CSS zoom on hover)
// ---------------------------------------------------------------------------

interface ImageGalleryProps {
  images: StrapiMediaItem[];
  productName: string;
}

function ImageGallery({ images, productName }: ImageGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="w-full aspect-square bg-gradient-to-br from-blue-50 to-slate-100 rounded-xl flex items-center justify-center">
        <span className="text-6xl" aria-hidden="true">🔧</span>
      </div>
    );
  }

  const [primary, ...thumbs] = images;
  const primaryUrl = resolveMediaUrl(primary.attributes.url);
  const primaryAlt = primary.attributes.alternativeText ?? productName;

  return (
    <div className="space-y-3">
      {/* Primary image with CSS zoom on hover */}
      <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-slate-100">
        <Image
          src={primaryUrl}
          alt={primaryAlt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain transition-transform duration-300 hover:scale-110"
          priority
        />
      </div>

      {/* Thumbnails */}
      {thumbs.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {thumbs.map((img) => {
            const url = resolveMediaUrl(img.attributes.url);
            const alt = img.attributes.alternativeText ?? productName;
            return (
              <div
                key={img.id}
                className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg
                           bg-gray-100 border border-gray-200"
              >
                <Image
                  src={url}
                  alt={alt}
                  fill
                  sizes="80px"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Specifications Table
// ---------------------------------------------------------------------------

interface SpecsTableProps {
  specs: Array<{ key: string; value: string }>;
  heading: string;
}

function SpecsTable({ specs, heading }: SpecsTableProps) {
  if (specs.length === 0) return null;
  return (
    <section aria-labelledby="specs-heading" className="mt-8">
      <h2 id="specs-heading" className="text-lg font-semibold text-gray-900 mb-3">
        {heading}
      </h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <tbody>
            {specs.map((spec, idx) => (
              <tr
                key={`${spec.key}-${idx}`}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="px-4 py-2.5 font-medium text-gray-700 w-1/3 border-r border-gray-200">
                  {spec.key}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, categorySlug, productSlug } = params;

  // Fetch product from Strapi
  let product: ProductItem | null = null;
  try {
    const res = await getProductBySlug(productSlug, locale);
    product = res.data?.[0] ?? null;
  } catch {
    // Strapi unavailable — treat as not found
    notFound();
  }

  // Call notFound() when product is not found / unpublished
  if (!product) {
    notFound();
  }

  const attrs = product.attributes;

  // Resolve category info
  const categoryName =
    attrs.category?.data?.attributes.name ?? categorySlug;
  const resolvedCategorySlug =
    attrs.category?.data?.attributes.slug ?? categorySlug;

  // Images
  const images: StrapiMediaItem[] = attrs.images?.data ?? [];
  const firstImageUrl =
    images.length > 0 ? resolveMediaUrl(images[0].attributes.url) : null;

  // Specifications
  const specs = attrs.specifications ?? [];

  // Related products (up to 3)
  const relatedProducts: ProductItem[] =
    (attrs.relatedProducts?.data ?? []).slice(0, 3);

  // Spec sheet PDF
  const specSheet = attrs.specificationSheet?.data ?? null;
  const specSheetUrl = specSheet ? resolveMediaUrl(specSheet.attributes.url) : null;

  // JSON-LD
  const jsonLd = buildProductJsonLd(product, firstImageUrl);

  const t = await getTranslations({ locale, namespace: 'products' });

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Page header / breadcrumb */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white py-8 px-4">
          <div className="max-w-5xl mx-auto">
            <nav aria-label="breadcrumb" className="text-sm text-blue-300 mb-3">
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
              <Link
                href={`/${locale}/products/${resolvedCategorySlug}`}
                className="hover:text-white transition-colors"
              >
                {categoryName}
              </Link>
              <span className="mx-2">›</span>
              <span className="text-white">{attrs.name}</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{attrs.name}</h1>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
            {/* Left: image gallery */}
            <div>
              <ImageGallery images={images} productName={attrs.name} />
            </div>

            {/* Right: product info */}
            <div className="flex flex-col gap-6">
              {/* Category badge */}
              <span className="inline-block text-xs font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 rounded-full px-3 py-1 w-fit">
                {categoryName}
              </span>

              {/* Product name */}
              <h2 className="text-2xl font-bold text-gray-900">{attrs.name}</h2>

              {/* Short description */}
              {attrs.shortDescription && (
                <p className="text-gray-600 leading-relaxed">{attrs.shortDescription}</p>
              )}

              {/* Available coatings */}
              {attrs.coatings && attrs.coatings.length > 0 && (
                <section aria-labelledby="coatings-heading">
                  <h3 id="coatings-heading" className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    {t('coatings')}
                  </h3>
                  <ul className="flex flex-wrap gap-2">
                    {attrs.coatings.map((coating) => (
                      <li
                        key={coating}
                        className="text-sm bg-amber-50 text-amber-800 border border-amber-200 rounded-full px-3 py-1"
                      >
                        {coating}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Compatible materials */}
              {attrs.compatibleMaterials && attrs.compatibleMaterials.length > 0 && (
                <section aria-labelledby="materials-heading">
                  <h3 id="materials-heading" className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    {t('compatibleMaterials')}
                  </h3>
                  <ul className="flex flex-wrap gap-2">
                    {attrs.compatibleMaterials.map((mat) => (
                      <li
                        key={mat}
                        className="text-sm bg-green-50 text-green-800 border border-green-200 rounded-full px-3 py-1"
                      >
                        {mat}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Related applications (subcategory label) */}
              {attrs.subcategory && (
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">Application:</span>{' '}
                  {attrs.subcategory}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                {/* Request a Quote CTA — placeholder until InquiryForm is built in task 12 */}
                <a
                  href={`/${locale}/contact?product=${encodeURIComponent(attrs.name)}&category=${encodeURIComponent(categoryName)}`}
                  className="inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800
                             text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  {t('requestQuote')}
                </a>

                {/* PDF spec sheet download */}
                {specSheetUrl && (
                  <a
                    href={specSheetUrl}
                    download
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50
                               text-gray-700 font-semibold px-6 py-3 rounded-lg border border-gray-300 transition-colors"
                    aria-label={`${t('downloadSpec')} for ${attrs.name}`}
                  >
                    📄 {t('downloadSpec')}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Full technical description */}
          {attrs.fullDescription && (
            <section aria-labelledby="description-heading" className="mb-10 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 id="description-heading" className="text-xl font-bold text-gray-900 mb-4">
                Product Description
              </h2>
              <div
                className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: attrs.fullDescription }}
              />
            </section>
          )}

          {/* Specifications table */}
          {specs.length > 0 && (
            <div className="mb-10 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <SpecsTable specs={specs} heading={t('specifications')} />
            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section aria-labelledby="related-heading" className="mt-12">
              <h2 id="related-heading" className="text-2xl font-bold text-gray-900 mb-6">
                {t('relatedProducts')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProducts.map((rel) => (
                  <ProductCard key={rel.id} product={rel} locale={locale} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
