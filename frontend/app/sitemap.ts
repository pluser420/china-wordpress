import { MetadataRoute } from 'next';
import {
  getProducts,
  getCategories,
  getIndustryPages,
  getNewsItems,
  getCatalogs,
} from '../lib/strapi';
import logger from '../lib/logger';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jiayitools.com';
const LOCALES = ['en', 'es'] as const;

type SitemapEntry = MetadataRoute.Sitemap[number];

function makeAlternateRefs(path: string) {
  return LOCALES.map((lang) => ({
    hreflang: lang,
    href: `${BASE_URL}/${lang}/${path}`,
  }));
}

function makeEntries(path: string, lastmod?: string): SitemapEntry[] {
  return LOCALES.map((locale) => ({
    url: `${BASE_URL}/${locale}/${path}`,
    lastModified: lastmod ? new Date(lastmod) : new Date(),
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((lang) => [lang, `${BASE_URL}/${lang}/${path}`]),
      ),
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: SitemapEntry[] = [];

  // -------------------------------------------------------------------------
  // Static pages
  // -------------------------------------------------------------------------
  const staticPaths = [
    '',                         // home
    'about/company-profile',
    'about/rd-manufacturing',
    'about/news',
    'industries',
    'products',
    'services/career',
    'services/cooperate',
    'services/events',
    'services/technology',
    'services/catalogs',
    'contact',
  ];

  for (const path of staticPaths) {
    entries.push(...makeEntries(path));
  }

  // -------------------------------------------------------------------------
  // Products
  // -------------------------------------------------------------------------
  try {
    const productsRes = await getProducts('en', undefined, 1);
    // getProducts is paginated to 24; for the sitemap we need all products.
    // We fetch all pages by looping through pagination.
    const allProducts = [...(productsRes.data ?? [])];
    const totalPages = productsRes.meta?.pagination?.pageCount ?? 1;

    for (let page = 2; page <= totalPages; page++) {
      try {
        const pageRes = await getProducts('en', undefined, page);
        allProducts.push(...(pageRes.data ?? []));
      } catch (err) {
        logger.warn({ err, page }, 'Sitemap: failed to fetch products page');
      }
    }

    for (const product of allProducts) {
      const { slug, updatedAt, category } = product.attributes;
      const catSlug = category?.data?.attributes?.slug;
      if (!catSlug) continue;
      const path = `products/${catSlug}/${slug}`;
      entries.push(...makeEntries(path, updatedAt));
    }
  } catch (err) {
    logger.warn({ err }, 'Sitemap: failed to fetch products');
  }

  // -------------------------------------------------------------------------
  // Categories
  // -------------------------------------------------------------------------
  try {
    const categoriesRes = await getCategories('en');
    for (const category of categoriesRes.data ?? []) {
      const { slug, updatedAt } = category.attributes;
      entries.push(...makeEntries(`products/${slug}`, updatedAt));
    }
  } catch (err) {
    logger.warn({ err }, 'Sitemap: failed to fetch categories');
  }

  // -------------------------------------------------------------------------
  // Industry pages
  // -------------------------------------------------------------------------
  try {
    const industriesRes = await getIndustryPages('en');
    for (const industry of industriesRes.data ?? []) {
      const { slug, updatedAt } = industry.attributes;
      entries.push(...makeEntries(`industries/${slug}`, updatedAt));
    }
  } catch (err) {
    logger.warn({ err }, 'Sitemap: failed to fetch industry pages');
  }

  // -------------------------------------------------------------------------
  // News items
  // -------------------------------------------------------------------------
  try {
    const newsRes = await getNewsItems('en', 1);
    const allNews = [...(newsRes.data ?? [])];
    const newsPages = newsRes.meta?.pagination?.pageCount ?? 1;

    for (let page = 2; page <= newsPages; page++) {
      try {
        const pageRes = await getNewsItems('en', page);
        allNews.push(...(pageRes.data ?? []));
      } catch (err) {
        logger.warn({ err, page }, 'Sitemap: failed to fetch news page');
      }
    }

    for (const item of allNews) {
      const { slug, updatedAt } = item.attributes;
      entries.push(...makeEntries(`about/news/${slug}`, updatedAt));
    }
  } catch (err) {
    logger.warn({ err }, 'Sitemap: failed to fetch news items');
  }

  return entries;
}
