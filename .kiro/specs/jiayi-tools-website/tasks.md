# Implementation Plan: Jiayi Tools Website

## Overview

Implement the Jiayi Tools multilingual B2B product catalog website from scratch. The work is split
into eight sequential epics that mirror the architecture: infrastructure scaffold → Strapi CMS
→ Next.js core → content pages → SEO/i18n → forms/email → testing → deployment. Every task
produces runnable, integrated code; there are no orphaned modules.

Stack: Next.js 14 (App Router, SSR/ISR) · Strapi v4 · PostgreSQL 15 · Docker Compose · Nginx ·
next-intl · react-hook-form + zod · fast-check · Nodemailer · Hostinger VPS.

---

## Tasks

- [ ] 1. Scaffold monorepo and Docker Compose stack
  - Create the top-level directory layout: `frontend/`, `strapi/`, `nginx/`, `docker-compose.yml`,
    `.env.example`, and `Makefile` with common targets (`up`, `down`, `logs`, `build`).
  - Write `docker-compose.yml` defining the four services: `postgres` (postgres:15-alpine),
    `strapi` (custom build), `next` (custom build), and `nginx` (nginx:alpine) with named volumes
    `postgres_data` and `strapi_uploads`.
  - Wire all environment variables listed in the design (`POSTGRES_PASSWORD`, `STRAPI_APP_KEYS`,
    `STRAPI_API_TOKEN`, `REVALIDATE_SECRET`, `RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`,
    `SMTP_*`, `INQUIRY_RECIPIENT`) via `.env` loaded by Compose.
  - Write `nginx/nginx.conf` routing `/strapi/` → `strapi:1337`, `/uploads/` → volume static
    files with `Cache-Control: public, max-age=604800, immutable`, and `/*` → `next:3000`.
  - Add TLS stanza to Nginx config (Let's Encrypt / Certbot mount at `/etc/letsencrypt`); include
    HTTP→HTTPS redirect server block.
  - _Requirements: 10.5, 13.3_

- [ ] 2. Bootstrap Strapi v4 CMS with PostgreSQL and i18n
  - Initialise a new Strapi v4 project inside `strapi/` configured for PostgreSQL as the database
    client.
  - Enable the Strapi i18n plugin and register the two locales: `en` (default) and `es`.
  - Create the reusable `SeoMeta` component with fields: `metaTitle` (String, max 70),
    `metaDescription` (String, max 160), `keywords` (Text).
  - Create the `Specification` component (key-value repeater) used by Product.
  - Create all five CMS collection types as specified in the design — `Product`, `Category`,
    `IndustryPage`, `NewsItem`, `Catalog` — with all fields, locale flags, and relations
    (Product→Category many-to-one, Product↔Product many-to-many for `relatedProducts`,
    IndustryPage→Category many-to-one).
  - Enable Draft & Publish on `Product`, `Category`, `IndustryPage`, `NewsItem`, `Catalog`.
  - Set `slug` field on `Product` to UID (source: `name`), unique, non-localized.
  - Configure the Strapi webhook to POST to `http://next:3000/api/revalidate` with header
    `x-revalidate-secret: <REVALIDATE_SECRET>` on events: `entry.publish`, `entry.unpublish`,
    `entry.update`, `entry.delete`.
  - Set public role READ permissions on all five collection types so the Next.js API token can
    fetch published content.
  - Write the `strapi/Dockerfile` (Node 18-alpine, copies source, `yarn build`, exposes 1337).
  - _Requirements: 7.1–7.8, 13.4_

- [ ] 3. Bootstrap Next.js 14 frontend with next-intl and core configuration
  - Initialise a Next.js 14 project inside `frontend/` using the App Router with TypeScript and
    Tailwind CSS.
  - Install dependencies: `next-intl`, `react-hook-form`, `zod`, `fast-check`, `jest`,
    `@testing-library/react`, `@testing-library/jest-dom`, `pino`, `nodemailer`, `qs`.
  - Configure `next.config.ts`: enable `remotePatterns` for the Strapi host, set image formats to
    `['image/avif', 'image/webp']`, expose `STRAPI_API_URL` and `STRAPI_API_TOKEN` as server-only
    env vars and `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` as public.
  - Create `middleware.ts` using `next-intl`'s `createMiddleware` to detect locale from path
    prefix (en/es), set default locale to `en`, and redirect bare `/` → `/en/`.
  - Create `messages/en.json` and `messages/es.json` containing all UI labels: navigation items,
    button text, footer copy, form labels, validation error messages, section headings.
  - Set up the `app/[locale]/layout.tsx` root layout: wrap with `NextIntlClientProvider`, render
    `<NavBar>` and `<Footer>` on every page, configure `<html lang={locale}>`.
  - Create `lib/strapi.ts` with `getStrapiURL()`, `fetchStrapi<T>()` (with `StrapiApiError`),
    and typed fetch helpers: `getProducts`, `getProductBySlug`, `getCategories`,
    `getCategoryBySlug`, `getIndustryPages`, `getIndustryPageBySlug`, `getNewsItems`,
    `getCatalogs`, `getHomePageData`. Every fetch uses `next: { tags: [...] }` cache tags.
  - Create `lib/i18n-fallback.ts` implementing `withLocaleFallback<T>()` with pino `WARN` log.
  - Write `frontend/Dockerfile` (Node 18-alpine, multi-stage: `builder` runs `next build`,
    `runner` copies `.next/standalone`, exposes 3000).
  - _Requirements: 6.1–6.4, 13.1–13.5_

  - [ ]* 3.1 Write property test for locale middleware (Property 14)
    - **Property 14: Locale middleware resolves correct locale from path prefix**
    - **Validates: Requirements 6.1, 6.2**
    - File: `__tests__/middleware.test.ts`

  - [ ]* 3.2 Write property test for locale path switcher (Property 15)
    - **Property 15: Locale path switching preserves the page slug**
    - **Validates: Requirements 6.3**
    - File: `__tests__/lib/locale.test.ts`

  - [ ]* 3.3 Write property test for translation key completeness (Property 16)
    - **Property 16: All UI translation keys have non-empty values in every locale**
    - **Validates: Requirements 6.4**
    - File: `__tests__/i18n/translations.test.ts`

  - [ ]* 3.4 Write property test for translation fallback (Property 17)
    - **Property 17: Translation fallback returns default locale data and logs warning**
    - **Validates: Requirements 6.6**
    - File: `__tests__/lib/i18n-fallback.test.ts`

- [ ] 4. Implement site navigation, NavBar, and Footer components
  - Create `components/NavBar.tsx` as a Server Component rendering: Home, About JIAYI (dropdown:
    Company Profile · R&D & Manufacturing Capacity · News & Exhibitions), Products (dropdown: all
    seven category links), Industry Applications (dropdown: all eight industry links), Services
    (dropdown: Career · Cooperate · Events · Technology · Catalogs), Contact US.
  - All nav labels MUST be sourced from `next-intl` translation keys (no hardcoded English strings).
  - Create `components/Footer.tsx` rendering company contact information, quick-links to all main
    sections, and a copyright notice; all text from translation keys.
  - Create `components/LanguageSwitcher.tsx` Client Component that builds locale-switched URLs
    using `usePathname` + `useRouter` from `next-intl` and renders an `en`/`es` toggle.
  - Ensure nav and footer appear on every page through `app/[locale]/layout.tsx`.
  - _Requirements: 1.1–1.7, 6.3, 6.4_

- [ ] 5. Implement Home Page
  - Create `app/[locale]/page.tsx` as an async Server Component fetching home-page data from
    Strapi (featured products per category, company stats, industry application cards).
  - Render hero section: headline, subheadline, and CTA button linking to `/[locale]/products`.
  - Render featured products section showing at least one product card per category (seven cards
    minimum) using the `<ProductCard>` component built in task 7.
  - Render company statistics section: founding year 2009, facility size 1 800 m², daily output
    8 000 tools, 15 countries served — values sourced from Strapi single-type or translation file.
  - Render Industry Applications section: eight cards linking to
    `/[locale]/industries/[industrySlug]`.
  - Render "Why Choose JIAYI" section highlighting: custom tooling, advanced coatings, precision
    manufacturing, competitive pricing — content from Strapi or translation keys.
  - Wire `generateMetadata` for the home page using Strapi SEO data.
  - _Requirements: 2.1–2.6, 5.1–5.5_

- [ ] 6. Implement Strapi API layer, slug utilities, and pagination helpers
  - Implement `lib/slug.ts` with `generateSlug(name: string): string` — lowercases, strips
    non-alphanumeric characters, replaces spaces/underscores with hyphens, collapses consecutive
    hyphens, trims leading/trailing hyphens.
  - Implement `lib/pagination.ts` with `paginateList<T>(items: T[], page: number, pageSize = 24)`
    returning `{ items: T[], totalPages: number, currentPage: number }`.
  - Complete all fetch helpers in `lib/strapi.ts` ensuring pagination params, locale, and populate
    arrays match the design query patterns (using `qs` for serialization).
  - _Requirements: 3.3, 4.7, 7.4_

  - [ ]* 6.1 Write property test for slug uniqueness and URL-safety (Property 7)
    - **Property 7: All product slugs are unique and URL-safe**
    - **Validates: Requirements 4.7, 7.4**
    - File: `__tests__/lib/slug.test.ts`

  - [ ]* 6.2 Write property test for pagination (Property 3)
    - **Property 3: Pagination never exceeds 24 items per page**
    - **Validates: Requirements 3.3**
    - File: `__tests__/lib/pagination.test.ts`

  - [ ]* 6.3 Write property test for category listing completeness (Property 1)
    - **Property 1: Category listing contains exactly its products**
    - **Validates: Requirements 3.1**
    - File: `__tests__/lib/strapi.test.ts`

- [ ] 7. Implement ProductCard component and Category Pages
  - Create `components/ProductCard.tsx` Server Component rendering: product image (Next.js
    `<Image>` with `loading="lazy"`), product name, short description (≤ 160 chars), and link to
    `/[locale]/products/[categorySlug]/[productSlug]`.
  - Create `app/[locale]/products/page.tsx` — products overview page listing all seven categories
    with links to their category pages.
  - Create `app/[locale]/products/[categorySlug]/page.tsx` — Category Page fetching products for
    the given category slug with pagination (24 per page). Use `generateStaticParams` to pre-render
    all category slugs. Cache tag: `products-{categorySlug}`.
  - Implement pagination UI: prev/next links using search params `?page=N`.
  - Call `generateMetadata` for each category page using CMS SEO data.
  - Verify that all seven category slugs (`hole-making`, `milling`, `cavity-tools`, `port-tools`,
    `composite-material-machining`, `threading-tools`, `gear-tools`) render with their correct
    subcategory data as specified in requirements 3.6–3.9.
  - _Requirements: 3.1–3.9, 5.1–5.5_

  - [ ]* 7.1 Write property test for ProductCard fields (Property 2)
    - **Property 2: Product card includes all required fields with valid description length**
    - **Validates: Requirements 3.2, 4.1**
    - File: `__tests__/components/ProductCard.test.tsx`

- [ ] 8. Implement Individual Product Pages
  - Create `app/[locale]/products/[categorySlug]/[productSlug]/page.tsx` — Product Page fetching
    the single product from Strapi by slug and locale. Use `generateStaticParams` for all published
    products. Cache tag: `product-{slug}`.
  - Render all required fields: product name, high-resolution image gallery with zoom
    (`react-medium-image-zoom` or CSS-based), full technical description, specifications table,
    available coatings, compatible materials, related applications.
  - Conditionally render a PDF download link when `specificationSheet` is non-null.
  - Render "Request a Quote" button that opens the `<InquiryForm>` dialog (built in task 12)
    pre-populated with `productName` and `categoryName`.
  - Render "Related Products" section at the bottom using `<ProductCard>` for at least three
    products from the same category (sourced from `relatedProducts` relation).
  - Render JSON-LD `Product` schema via `buildProductJsonLd(product)` in an inline
    `<script type="application/ld+json">` in the Server Component.
  - Call `generateMetadata` for each product page using CMS SEO data.
  - Call `notFound()` when `getProductBySlug` returns an empty array (unpublished / not-found).
  - _Requirements: 4.1–4.7, 5.1–5.5, 5.8_

  - [ ]* 8.1 Write property test for Product Page required fields (Property 4)
    - **Property 4: Product page renders all required content fields**
    - **Validates: Requirements 4.3, 4.4**
    - File: `__tests__/components/ProductPage.test.tsx`

  - [ ]* 8.2 Write property test for quote form pre-population (Property 5)
    - **Property 5: Quote form is pre-populated with product data**
    - **Validates: Requirements 4.5**
    - File: `__tests__/components/InquiryForm.test.tsx`

  - [ ]* 8.3 Write property test for related products same category (Property 6)
    - **Property 6: Related products belong to the same category**
    - **Validates: Requirements 4.6**
    - File: `__tests__/components/RelatedProducts.test.tsx`

- [ ] 9. Checkpoint — core pages
  - Ensure all tests pass, ask the user if questions arise.
  - Verify `docker compose up` starts all four services without errors.
  - Confirm the Next.js dev server renders home, a category page, and a product page with SSR HTML
    (curl / view-source check).

- [ ] 10. Implement SEO infrastructure: metadata, JSON-LD, sitemap, robots
  - Create `lib/metadata.ts` exporting:
    - `buildPageTitle(pageName: string): string` — returns `"${pageName} | JIAYI Tools"`.
    - `clampDescription(text: string): string` — truncates to 160 chars; pads to 120 if shorter
      using a suffix; warns via pino if CMS value is out of range.
    - `buildProductJsonLd(product)` — returns a JSON-LD `Product` object with `@type`, `name`,
      `description`, `brand.name = "JIAYI Tools"`, `image`, and `sku = product.slug`.
    - `buildAlternates(locale: string, path: string)` — returns the `alternates` object with
      `canonical` and `languages` for both `en` and `es`.
  - Update every page's `generateMetadata` call to use the helpers above.
  - Add `<link rel="canonical">` and `<link rel="alternate" hreflang>` via the `alternates`
    return value in every `generateMetadata`.
  - Create `app/sitemap.ts` generating entries for all published products × 2 locales, all
    categories × 2 locales, all industry pages × 2 locales, all news items × 2 locales, and
    static pages × 2 locales. Each entry includes `lastmod` and `alternateRefs`.
  - Create `app/robots.ts` allowing all crawlers and pointing to `/sitemap.xml`.
  - _Requirements: 5.1–5.9_

  - [ ]* 10.1 Write property test for page title format (Property 8)
    - **Property 8: Page title always contains page name and brand**
    - **Validates: Requirements 5.2**
    - File: `__tests__/lib/metadata.test.ts`

  - [ ]* 10.2 Write property test for canonical and hreflang (Property 9)
    - **Property 9: Metadata includes canonical and hreflang for both locales**
    - **Validates: Requirements 5.5, 5.7**
    - File: `__tests__/lib/metadata.test.ts`

  - [ ]* 10.3 Write property test for meta description length (Property 10)
    - **Property 10: Meta description length is within SEO bounds**
    - **Validates: Requirements 5.3**
    - File: `__tests__/lib/metadata.test.ts`

  - [ ]* 10.4 Write property test for keywords presence (Property 11)
    - **Property 11: Keywords metadata is present if and only if keywords are configured**
    - **Validates: Requirements 5.4**
    - File: `__tests__/lib/metadata.test.ts`

  - [ ]* 10.5 Write property test for JSON-LD completeness (Property 12)
    - **Property 12: Product JSON-LD contains all required schema fields**
    - **Validates: Requirements 5.8**
    - File: `__tests__/lib/jsonld.test.ts`

  - [ ]* 10.6 Write property test for sitemap coverage (Property 13)
    - **Property 13: Sitemap contains all published products for both locales**
    - **Validates: Requirements 5.6**
    - File: `__tests__/app/sitemap.test.ts`

- [ ] 11. Implement ISR revalidation webhook handler
  - Create `app/api/revalidate/route.ts` validating the `x-revalidate-secret` header, parsing the
    `StrapiWebhookPayload`, and calling `revalidateTag` / `revalidatePath` for the affected model
    as specified in the design's switch statement.
  - Handle all five models: `product`, `category`, `industry-page`, `news-item`, `catalog`.
  - Always call `revalidatePath('/sitemap.xml')` after any model change.
  - Return `401` on bad secret, `200` on success, `500` on unexpected errors (so Strapi retries).
  - Log every revalidation event at `INFO` level with pino.
  - _Requirements: 3.5, 7.5, 7.6, 13.2_

- [ ] 12. Implement Inquiry / Contact form, API route, and email delivery
  - Create `lib/inquiry-schema.ts` exporting the Zod schema `inquirySchema` validating: `fullName`
    (required string), `companyName` (optional string), `email` (required valid email format),
    `phone` (optional string), `country` (required string), `productOfInterest` (required string),
    `message` (required string, max 2 000 chars). Also export the inferred TypeScript type.
  - Create `components/InquiryForm.tsx` as a Client Component (`'use client'`) using
    `react-hook-form` + `zodResolver(inquirySchema)`. Render all eight fields with inline
    validation error messages in the active locale. Accept optional `defaultProductName` and
    `defaultCategory` props for pre-population. Integrate Google reCAPTCHA v3 (invisible)
    using `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`.
  - Create `app/api/inquiry/route.ts`:
    1. Validate reCAPTCHA token via `https://www.google.com/recaptcha/api/siteverify`.
    2. Re-validate submission with `inquirySchema.safeParse`.
    3. Send email via Nodemailer (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`) to `INQUIRY_RECIPIENT`.
    4. Return `200 { success: true }`, `400` on reCAPTCHA failure, `422` with field errors on
       validation failure, `500` on SMTP error.
  - Create `app/[locale]/contact/page.tsx` rendering the Contact Page: embedded `<InquiryForm>`,
    company address, phone, email, and a map embed (Google Maps iframe or static image).
  - Show inline confirmation message on successful submit without page reload.
  - _Requirements: 8.1–8.7_

  - [ ]* 12.1 Write property test for inquiry form validation (Property 18)
    - **Property 18: Form validation rejects any incomplete or malformed submission**
    - **Validates: Requirements 8.5, 8.6**
    - File: `__tests__/lib/inquiry-schema.test.ts`

- [ ] 13. Implement About, Industry Application, News, and Catalogs pages
  - Create `app/[locale]/about/company-profile/page.tsx` — fetches from Strapi single-type or
    hardcoded structured content; renders founding year, location, facility size, daily output,
    geographic reach, and core product series. `generateMetadata` with CMS SEO data.
  - Create `app/[locale]/about/rd-manufacturing/page.tsx` — renders five-axis CNC grinding
    equipment (Walter, Rollomatic), material expertise (PCD, PCBN, cermet, carbide), and custom
    tooling capabilities.
  - Create `app/[locale]/about/news/page.tsx` — fetches all published `NewsItem` records from
    Strapi (cache tag: `news`), renders a list of news cards. `generateMetadata` from CMS.
  - Create `app/[locale]/industries/[industrySlug]/page.tsx` — fetches `IndustryPage` by slug
    and locale; renders industry headline, descriptive paragraph, representative imagery, and a
    "View Related Tools" button linking to the related category page. `generateStaticParams` for
    all eight industry slugs. Cache tag: `industry-{slug}`.
  - Create `app/[locale]/services/catalogs/page.tsx` — fetches all `Catalog` records; renders
    catalog name, cover thumbnail (`<Image>`), description, and a download button wired to the
    `pdfFile` URL (uses `download` attribute to trigger browser download without navigation).
  - Create remaining services stubs: `career/page.tsx`, `cooperate/page.tsx`, `events/page.tsx`,
    `technology/page.tsx` — static pages with placeholder content and correct navigation links.
  - _Requirements: 9.1–9.4, 11.1–11.4, 12.1–12.4_

- [ ] 14. Implement logging, error boundaries, and 404/500 pages
  - Configure `pino` in `lib/logger.ts` writing structured JSON to stdout; set log level from
    `LOG_LEVEL` env var (default `info`).
  - Replace all `console.log/error/warn` calls with `logger.info / logger.error / logger.warn`.
  - Create `app/[locale]/error.tsx` React error boundary rendering a user-friendly error page
    with a "Try again" button; returns HTTP 500.
  - Create `app/[locale]/not-found.tsx` rendering a 404 page with a link back to the home page.
  - Create `app/global-error.tsx` for uncaught root-layout errors.
  - _Requirements: 13.5_

- [ ] 15. Performance optimisations
  - Audit all `<Image>` usages: confirm `priority={true}` on hero / LCP-candidate images and
    `loading="lazy"` (default) on all below-fold images.
  - Confirm `next.config.ts` has `formats: ['image/avif', 'image/webp']`.
  - Add `Cache-Control: public, max-age=604800, immutable` header in Nginx config for
    `location ~* \.(js|css|woff2|png|jpg|webp|avif)$` — or confirm it is already present from
    task 1.
  - Verify all page-level `fetch` calls include appropriate `next: { tags }` so ISR revalidates
    only the affected pages.
  - _Requirements: 10.1–10.5_

- [ ] 16. Checkpoint — full stack integration
  - Ensure all unit and property tests pass (`jest --runInBand`), ask the user if questions arise.
  - Verify `docker compose up` starts cleanly; confirm Nginx routes `/`, `/strapi/admin`, and
    `/uploads/` correctly via `curl`.
  - Confirm ISR revalidation end-to-end: publish a product in Strapi admin, wait ≤ 60 s, verify
    the category page reflects the change.

- [ ] 17. Write unit and integration tests
  - [ ] 17.1 Write unit tests for NavBar link presence
    - Verify all required nav links and dropdowns render (Requirements 1.1–1.5).
    - File: `__tests__/components/NavBar.test.tsx`

  - [ ]* 17.2 Write unit tests for Home Page statistics section
    - Verify the stats section renders values: 2009, 1 800 m², 8 000 tools, 15 countries.
    - _Requirements: 2.3_
    - File: `__tests__/app/HomePage.test.tsx`

  - [ ]* 17.3 Write unit tests for Contact Page structure
    - Verify form fields, address, phone, email elements are present (Requirements 8.1, 8.2).
    - File: `__tests__/app/ContactPage.test.tsx`

  - [ ]* 17.4 Write unit tests for Industry Application Page structure
    - Verify headline, paragraph, image, and CTA button render (Requirements 9.1, 9.2).
    - File: `__tests__/app/IndustryPage.test.tsx`

  - [ ]* 17.5 Write Playwright integration test: SSR HTML completeness
    - For home, one category page, and one product page: `curl` the URL and assert product/category
      name is present in raw HTML without JavaScript execution (Requirements 5.1).
    - File: `e2e/ssr.spec.ts`

  - [ ]* 17.6 Write Playwright integration test: revalidation within 60 s
    - Publish a product via Strapi API, wait 60 s, assert it appears on the category page
      (Requirements 3.5, 7.5).
    - File: `e2e/revalidation.spec.ts`

  - [ ]* 17.7 Write Playwright integration test: unpublished product returns 404
    - Unpublish a product via Strapi API, wait 60 s, assert GET returns HTTP 404 (Requirements 7.6).
    - File: `e2e/revalidation.spec.ts`

  - [ ]* 17.8 Write Playwright integration test: inquiry form email delivery
    - Submit the inquiry form with valid data, assert the API returns 200 and (in a test SMTP
      environment) a message was queued (Requirements 8.3).
    - File: `e2e/inquiry.spec.ts`

- [ ] 18. Final checkpoint — all tests pass, deployment ready
  - Ensure all unit, property, and integration tests pass, ask the user if questions arise.
  - Verify the production Docker build completes: `docker compose build` runs without errors for
    all four services.
  - Confirm `.env.example` documents every required environment variable.
  - Confirm `robots.ts` allows crawling and `sitemap.xml` is reachable.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP; core functionality is
  not affected.
- Each property-based test uses `fc.assert(fc.property(...), { numRuns: 100 })` via fast-check.
  Generator-heavy render tests may use `{ numRuns: 50 }`.
- Every task references specific requirements for traceability.
- Checkpoints (tasks 9, 16, 18) validate incremental progress before moving to the next epic.
- The implementation language is **TypeScript** throughout (Next.js 14 + Strapi v4 both use TS).

