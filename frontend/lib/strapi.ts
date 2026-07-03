import qs from 'qs';
import logger from './logger';

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export class StrapiApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly endpoint: string,
    cause: unknown,
  ) {
    super(`Strapi API error ${status} on ${endpoint}`);
    this.cause = cause;
    this.name = 'StrapiApiError';
  }
}

// ---------------------------------------------------------------------------
// Shared Strapi response shapes
// ---------------------------------------------------------------------------

export interface StrapiMedia {
  id: number;
  url: string;
  name: string;
  alternativeText: string | null;
  width: number | null;
  height: number | null;
  formats?: Record<string, { url: string; width: number; height: number }>;
  mime: string;
}

export interface StrapiSeoMeta {
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
}

export interface StrapiSpecification {
  key: string;
  value: string;
}

export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: StrapiPagination;
  };
}

// ---------------------------------------------------------------------------
// Content-type attribute shapes
// ---------------------------------------------------------------------------

export interface ProductAttributes {
  name: string;
  slug: string;
  subcategory: string | null;
  shortDescription: string | null;
  fullDescription: string | null;
  specifications: StrapiSpecification[] | null;
  coatings: string[] | null;
  compatibleMaterials: string[] | null;
  seo: StrapiSeoMeta | null;
  images?: { data: StrapiMediaItem[] | null };
  specificationSheet?: { data: StrapiMediaItem | null };
  category?: { data: CategoryItem | null };
  relatedProducts?: { data: ProductItem[] | null };
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale: string;
}

export interface StrapiMediaItem {
  id: number;
  attributes: StrapiMedia;
}

export interface ProductItem {
  id: number;
  attributes: ProductAttributes;
}

export interface CategoryAttributes {
  name: string;
  slug: string;
  description: string | null;
  subcategories: string[] | null;
  seo: StrapiSeoMeta | null;
  products?: { data: ProductItem[] | null };
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale: string;
}

export interface CategoryItem {
  id: number;
  attributes: CategoryAttributes;
}

export interface IndustryPageAttributes {
  name: string;
  slug: string;
  headline: string | null;
  description: string | null;
  seo: StrapiSeoMeta | null;
  image?: { data: StrapiMediaItem | null };
  relatedCategory?: { data: CategoryItem | null };
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale: string;
}

export interface IndustryPageItem {
  id: number;
  attributes: IndustryPageAttributes;
}

export interface NewsItemAttributes {
  title: string;
  slug: string;
  body: string | null;
  publishDate: string | null;
  seo: StrapiSeoMeta | null;
  coverImage?: { data: StrapiMediaItem | null };
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale: string;
}

export interface NewsItemEntry {
  id: number;
  attributes: NewsItemAttributes;
}

export interface CatalogAttributes {
  name: string;
  description: string | null;
  coverThumbnail?: { data: StrapiMediaItem | null };
  pdfFile?: { data: StrapiMediaItem | null };
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale: string;
}

export interface CatalogItem {
  id: number;
  attributes: CatalogAttributes;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export function getStrapiURL(path = ''): string {
  const base =
    process.env.STRAPI_API_URL ||
    process.env.NEXT_PUBLIC_STRAPI_API_URL ||
    'http://strapi:1337';
  return `${base}${path}`;
}

function buildUrl(endpoint: string, params: Record<string, unknown>): string {
  const query = qs.stringify(params, { encodeValuesOnly: true });
  return `${getStrapiURL(endpoint)}${query ? `?${query}` : ''}`;
}

async function fetchStrapi<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(process.env.STRAPI_API_TOKEN
      ? { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` }
      : {}),
    ...((options.headers as Record<string, string>) ?? {}),
  };

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (err) {
    logger.error({ err, url }, 'Strapi fetch network error');
    throw new StrapiApiError(0, url, err);
  }

  if (!response.ok) {
    logger.error({ status: response.status, url }, 'Strapi non-2xx response');
    throw new StrapiApiError(response.status, url, null);
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

export async function getProducts(
  locale: string,
  categorySlug?: string,
  page = 1,
): Promise<StrapiResponse<ProductItem[]>> {
  const url = buildUrl('/api/products', {
    locale,
    populate: ['images', 'category', 'seo'],
    filters: categorySlug ? { category: { slug: { $eq: categorySlug } } } : undefined,
    pagination: { page, pageSize: 24 },
    publicationState: 'live',
  });
  return fetchStrapi<StrapiResponse<ProductItem[]>>(url, {
    next: { tags: ['products', ...(categorySlug ? [`products-${categorySlug}`] : [])] },
  } as RequestInit);
}

export async function getProductBySlug(
  slug: string,
  locale: string,
): Promise<StrapiResponse<ProductItem[]>> {
  const url = buildUrl('/api/products', {
    locale,
    filters: { slug: { $eq: slug } },
    populate: [
      'images',
      'specificationSheet',
      'specifications',
      'category',
      'relatedProducts.images',
      'seo',
    ],
    publicationState: 'live',
  });
  return fetchStrapi<StrapiResponse<ProductItem[]>>(url, {
    next: { tags: [`product-${slug}`] },
  } as RequestInit);
}

export async function getCategories(
  locale: string,
): Promise<StrapiResponse<CategoryItem[]>> {
  const url = buildUrl('/api/categories', {
    locale,
    populate: ['seo'],
    publicationState: 'live',
  });
  return fetchStrapi<StrapiResponse<CategoryItem[]>>(url, {
    next: { tags: ['categories'] },
  } as RequestInit);
}

export async function getCategoryBySlug(
  slug: string,
  locale: string,
): Promise<StrapiResponse<CategoryItem[]>> {
  const url = buildUrl('/api/categories', {
    locale,
    filters: { slug: { $eq: slug } },
    populate: ['seo'],
    publicationState: 'live',
  });
  return fetchStrapi<StrapiResponse<CategoryItem[]>>(url, {
    next: { tags: ['categories', `category-${slug}`] },
  } as RequestInit);
}

export async function getIndustryPages(
  locale: string,
): Promise<StrapiResponse<IndustryPageItem[]>> {
  const url = buildUrl('/api/industry-pages', {
    locale,
    populate: ['image', 'relatedCategory', 'seo'],
    publicationState: 'live',
  });
  return fetchStrapi<StrapiResponse<IndustryPageItem[]>>(url, {
    next: { tags: ['industries'] },
  } as RequestInit);
}

export async function getIndustryPageBySlug(
  slug: string,
  locale: string,
): Promise<StrapiResponse<IndustryPageItem[]>> {
  const url = buildUrl('/api/industry-pages', {
    locale,
    filters: { slug: { $eq: slug } },
    populate: ['image', 'relatedCategory', 'seo'],
    publicationState: 'live',
  });
  return fetchStrapi<StrapiResponse<IndustryPageItem[]>>(url, {
    next: { tags: ['industries', `industry-${slug}`] },
  } as RequestInit);
}

export async function getNewsItems(
  locale: string,
  page = 1,
): Promise<StrapiResponse<NewsItemEntry[]>> {
  const url = buildUrl('/api/news-items', {
    locale,
    populate: ['coverImage', 'seo'],
    pagination: { page, pageSize: 24 },
    publicationState: 'live',
    sort: ['publishDate:desc'],
  });
  return fetchStrapi<StrapiResponse<NewsItemEntry[]>>(url, {
    next: { tags: ['news'] },
  } as RequestInit);
}

export async function getCatalogs(
  locale: string,
): Promise<StrapiResponse<CatalogItem[]>> {
  const url = buildUrl('/api/catalogs', {
    locale,
    populate: ['coverThumbnail', 'pdfFile'],
    publicationState: 'live',
  });
  return fetchStrapi<StrapiResponse<CatalogItem[]>>(url, {
    next: { tags: ['catalogs'] },
  } as RequestInit);
}

export async function getHomePageData(locale: string): Promise<{
  featuredProducts: ProductItem[];
  categories: CategoryItem[];
  industryPages: IndustryPageItem[];
}> {
  const [productsResponse, categoriesResponse, industryPagesResponse] =
    await Promise.all([
      getProducts(locale, undefined, 1),
      getCategories(locale),
      getIndustryPages(locale),
    ]);

  return {
    featuredProducts: productsResponse.data ?? [],
    categories: categoriesResponse.data ?? [],
    industryPages: industryPagesResponse.data ?? [],
  };
}
