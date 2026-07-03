/**
 * ProductCard — Server Component
 *
 * Renders a product card with image, name, short description (≤ 160 chars),
 * and a link to the product page at `/{locale}/products/{categorySlug}/{productSlug}`.
 *
 * Requirements: 3.2, 4.1
 */

import Image from 'next/image';
import Link from 'next/link';
import { getStrapiURL } from '@/lib/strapi';
import type { ProductItem } from '@/lib/strapi';

interface ProductCardProps {
  product: ProductItem;
  locale: string;
}

/**
 * Resolves a Strapi media URL to an absolute URL (adds the Strapi host prefix
 * when the URL is relative, i.e. starts with '/uploads/').
 */
function resolveMediaUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return getStrapiURL(url);
}

export default function ProductCard({ product, locale }: ProductCardProps) {
  const { attributes } = product;

  // Category slug for URL building; fall back to 'products' if relation is missing
  const categorySlug = attributes.category?.data?.attributes.slug ?? 'products';

  // First image (if any)
  const firstImage = attributes.images?.data?.[0];
  const imageUrl = firstImage ? resolveMediaUrl(firstImage.attributes.url) : null;
  const imageAlt = firstImage?.attributes.alternativeText ?? attributes.name;

  // Truncate description to 160 chars as required by spec
  const rawDescription = attributes.shortDescription ?? '';
  const description =
    rawDescription.length > 160 ? rawDescription.slice(0, 160) : rawDescription;

  const href = `/${locale}/products/${categorySlug}/${attributes.slug}`;

  return (
    <article
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden
                 hover:shadow-md transition-shadow duration-200 flex flex-col"
    >
      {/* Product image */}
      <div className="relative h-44 bg-gradient-to-br from-blue-50 to-slate-100 overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-4xl" aria-hidden="true">🔧</span>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category label */}
        {attributes.category?.data?.attributes.name && (
          <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-1">
            {attributes.category.data.attributes.name}
          </span>
        )}

        {/* Product name */}
        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
          {attributes.name}
        </h3>

        {/* Short description (≤ 160 chars) */}
        {description && (
          <p className="text-gray-500 text-xs mb-4 flex-1 line-clamp-3">
            {description}
          </p>
        )}

        {/* Link to product page */}
        <Link
          href={href}
          className="inline-block text-center text-sm font-medium text-blue-700
                     border border-blue-200 rounded-lg px-3 py-1.5
                     hover:bg-blue-50 transition-colors"
        >
          View Details →
        </Link>
      </div>
    </article>
  );
}
