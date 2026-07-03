/**
 * SEO metadata utilities
 *
 * Provides helpers for building consistent Next.js Metadata objects,
 * JSON-LD structured data, and hreflang alternates across all pages.
 */

import logger from './logger';

const BRAND = 'JIAYI Tools';
const PAD_SUFFIX = ` — ${BRAND} precision carbide cutting tools.`;
const FALLBACK_DESCRIPTION =
  'JIAYI Tools — Precision carbide cutting tools for aerospace, automotive, medical, energy, and industrial applications worldwide.';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jiayitools.com';

// ---------------------------------------------------------------------------
// buildPageTitle
// ---------------------------------------------------------------------------

/**
 * Returns a consistently-formatted page title:
 *   "{pageName} | JIAYI Tools"
 */
export function buildPageTitle(pageName: string): string {
  return `${pageName} | ${BRAND}`;
}

// ---------------------------------------------------------------------------
// clampDescription
// ---------------------------------------------------------------------------

/**
 * Ensures the meta description is within SEO-optimal bounds (120–160 chars).
 *
 * - If longer than 160 chars → truncates to 160.
 * - If shorter than 120 chars → appends a brand suffix to bring it to ≥ 120
 *   (but still caps at 160).
 * - Logs a pino WARN when the original value was out of range.
 */
export function clampDescription(text: string): string {
  const MIN = 120;
  const MAX = 160;

  // Truncate if too long
  if (text.length > MAX) {
    logger.warn(
      { originalLength: text.length },
      'Meta description too long; truncating to 160 chars',
    );
    return text.slice(0, MAX);
  }

  // Pad if too short
  if (text.length < MIN) {
    logger.warn(
      { originalLength: text.length },
      'Meta description too short; appending brand suffix',
    );
    const trimmed = text.trim();
    const padded = trimmed.length > 0 ? trimmed + PAD_SUFFIX : FALLBACK_DESCRIPTION;
    // Still enforce the 160-char ceiling after padding
    const clamped = padded.slice(0, MAX);
    // If still under MIN, use the full fallback description
    if (clamped.length < MIN) {
      return FALLBACK_DESCRIPTION.slice(0, MAX);
    }
    return clamped;
  }

  return text;
}

// ---------------------------------------------------------------------------
// buildProductJsonLd
// ---------------------------------------------------------------------------

export interface ProductJsonLdInput {
  name: string;
  shortDescription?: string | null;
  fullDescription?: string | null;
  slug: string;
  /** First image URL (absolute or Strapi-relative) */
  imageUrl?: string | null;
}

export interface ProductJsonLd {
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  description: string;
  brand: {
    '@type': 'Brand';
    name: string;
  };
  image: string;
  sku: string;
}

/**
 * Builds a Schema.org Product JSON-LD object.
 */
export function buildProductJsonLd(product: ProductJsonLdInput): ProductJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description:
      product.shortDescription ||
      product.fullDescription ||
      `${product.name} — ${BRAND}`,
    brand: {
      '@type': 'Brand',
      name: BRAND,
    },
    image: product.imageUrl || '',
    sku: product.slug,
  };
}

// ---------------------------------------------------------------------------
// buildAlternates
// ---------------------------------------------------------------------------

export interface AlternatesResult {
  canonical: string;
  languages: {
    en: string;
    es: string;
  };
}

/**
 * Builds the `alternates` object used in Next.js `generateMetadata`.
 *
 * @param locale - The current locale ("en" | "es")
 * @param path   - The locale-independent path, e.g. "products/hole-making/drill-bit-12mm"
 */
export function buildAlternates(locale: string, path: string): AlternatesResult {
  // Normalise: strip leading slash, then reconstruct
  const normalised = path.replace(/^\//, '');
  return {
    canonical: `/${locale}/${normalised}`,
    languages: {
      en: `/en/${normalised}`,
      es: `/es/${normalised}`,
    },
  };
}
