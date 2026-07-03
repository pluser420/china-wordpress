# Requirements Document

## Introduction

This document defines the requirements for the Jiayi Tools product catalog website — a multilingual,
SEO-first marketing and inquiry platform for Jiayi Tools (嘉一工具), a Shenzhen-based precision
carbide cutting tools manufacturer founded in 2009. The site must showcase 200+ products across seven
categories, support independent content management by non-technical staff, and generate B2B leads from
global markets (primarily North America and Europe). The frontend is built with Next.js (SSR), content
is managed through Strapi CMS, and the stack is hosted on a Hostinger VPS.

---

## Glossary

- **Website**: The Jiayi Tools public-facing marketing and product catalog site.
- **CMS**: Strapi headless Content Management System used for backend content authoring.
- **Product**: A cutting tool item with name, category, description, specifications, images, and
  related documents managed in the CMS.
- **Product Category**: One of seven top-level groupings: Hole Making, Milling, Cavity Tools, Port
  Tools, Composite Material Machining, Threading Tools, Gear Tools.
- **Product Page**: A server-side-rendered Next.js page dedicated to a single Product.
- **TDK**: The HTML `<title>`, `<meta name="description">`, and `<meta name="keywords">` tags that
  search engines index.
- **SSR**: Server-Side Rendering — the Website returns fully rendered HTML for each request.
- **Locale**: One of two supported languages: English (`en`) and Spanish (`es`).
- **Inquiry Form**: A web form that collects visitor contact details and a product/service request, and
  delivers the submission to the client via email.
- **Admin**: A Jiayi Tools staff member who manages content through the CMS dashboard.
- **Visitor**: An anonymous end-user browsing the public Website.
- **Sitemap**: An XML file listing all public URLs on the Website, submitted to search engines.
- **Slug**: A URL-safe string that uniquely identifies a page (e.g., `carbide-drill-bits`).
- **Industry Application Page**: A page describing tools relevant to a specific industry vertical
  (Aerospace, Automotive, Medical Devices, Power & Energy, Electronics, Hydraulics, Shipbuilding,
  Rail Transit).
- **Specification Sheet**: A downloadable PDF attached to a Product in the CMS.

---

## Requirements

### Requirement 1: Site Navigation and Information Architecture

**User Story:** As a Visitor, I want a clear, consistent navigation structure so that I can quickly
find product categories, company information, and contact details from any page.

#### Acceptance Criteria

1. THE Website SHALL render a top-level navigation bar containing the links: Home, About JIAYI,
   Products, Industry Applications, Services, and Contact US on every page.
2. THE Website SHALL render a "Products" dropdown with second-level links for all seven Product
   Categories: Hole Making, Milling, Cavity Tools, Port Tools, Composite Material Machining,
   Threading Tools, and Gear Tools.
3. THE Website SHALL render an "About JIAYI" dropdown with links to: Company Profile, R&D &
   Manufacturing Capacity, and News & Exhibitions.
4. THE Website SHALL render a "Services" dropdown with links to: Career, Cooperate, Events,
   Technology, and Catalogs.
5. THE Website SHALL render a "Industry Applications" dropdown with links to all eight Industry
   Application Pages.
6. WHEN a Visitor clicks a navigation link, THE Website SHALL navigate to the target page within
   500 ms on a standard broadband connection.
7. THE Website SHALL render a footer on every page containing company contact information, quick
   links to all main sections, and a copyright notice.

---

### Requirement 2: Home Page

**User Story:** As a Visitor arriving at the Website, I want a compelling home page that communicates
Jiayi Tools' value proposition, product range, and credibility so that I understand what the company
offers within seconds.

#### Acceptance Criteria

1. THE Website SHALL render a hero section on the Home Page that displays a headline, subheadline,
   and a primary call-to-action button linking to the Products section.
2. THE Website SHALL render a featured Products section on the Home Page displaying at least one
   representative tool from each of the seven Product Categories.
3. THE Website SHALL render a company statistics section on the Home Page displaying key figures
   including: founding year (2009), facility size (1,800 m²), daily output (8,000 tools), and
   countries served (15).
4. THE Website SHALL render an Industry Applications section on the Home Page with cards linking to
   each of the eight Industry Application Pages.
5. THE Website SHALL render a "Why Choose JIAYI" section on the Home Page that highlights core
   competencies: custom tooling, advanced coatings, precision manufacturing, and competitive pricing.
6. WHEN a Visitor submits a quick-contact or newsletter form on the Home Page, THE Website SHALL
   deliver the submission to the configured recipient email address within 60 seconds.

---

### Requirement 3: Product Catalog and Category Pages

**User Story:** As a Visitor, I want to browse all products organized by category so that I can
efficiently discover the tools relevant to my machining application.

#### Acceptance Criteria

1. THE Website SHALL render a Category Page for each of the seven Product Categories listing all
   Products belonging to that category.
2. THE Website SHALL display each Product in the listing as a card showing: product image, product
   name, a brief description (≤ 160 characters), and a link to the Product Page.
3. WHEN a Category Page contains more than 24 Products, THE Website SHALL paginate the listing into
   groups of 24 Products per page.
4. THE Website SHALL render Category Pages using SSR so that the full HTML product listing is
   returned in the initial server response.
5. WHEN an Admin adds, updates, or removes a Product in the CMS, THE Website SHALL reflect the
   change on the Category Page within 60 seconds of CMS publication.
6. THE Website SHALL render a "Hole Making" Category Page containing subcategories: Carbide Drill
   Bit, High-Speed Steel Drill Bit, Modular Drill Bit, High-Precision Reamer, Deep-Hole Drill Bit,
   and Custom Drill Bits.
7. THE Website SHALL render a "Milling" Category Page containing subcategories: Carbide Milling
   Cutter, High-Speed Steel Milling Cutter, T-Slot Milling Cutter, Brazed Milling Cutter, and
   Custom Milling Cutters.
8. THE Website SHALL render a "Port Tools" Category Page containing subcategories organized by
   international standard: SAE J1926, HydraForce, ISO 1179, ISO 6149, Bosch Rexroth, Parker
   Hannifin, AS 5202, Danfoss, Eaton Vickers, and BSPP-G.
9. THE Website SHALL render a "Cavity Tools" Category Page containing subcategory groupings
   compatible with major OEM cavities: Sun Hydraulics, HydraForce, Parker, Parker Common, Parker
   Standard, and Eaton Vickers.

---

### Requirement 4: Individual Product Pages

**User Story:** As a Visitor evaluating a specific tool, I want a detailed product page with full
specifications, images, and a way to request a quote so that I can make a purchasing or sampling
decision.

#### Acceptance Criteria

1. THE Website SHALL render a unique Product Page at the URL path
   `/products/{category-slug}/{product-slug}` for every Product stored in the CMS.
2. THE Website SHALL render Product Pages using SSR so that the complete product content — name,
   description, specifications, and images — is present in the initial HTML response returned by
   the server.
3. THE Website SHALL display on every Product Page: product name, high-resolution images (with
   zoom), full technical description, a specifications table, available coatings, compatible
   materials, and related applications.
4. WHERE a Specification Sheet PDF is attached to a Product in the CMS, THE Website SHALL render a
   downloadable link on the Product Page.
5. WHEN a Visitor clicks "Request a Quote" on a Product Page, THE Website SHALL display the Inquiry
   Form pre-populated with the product name and category.
6. THE Website SHALL render a "Related Products" section at the bottom of every Product Page showing
   at least three Products from the same category.
7. THE Website SHALL generate a unique, human-readable Slug for each Product Page derived from the
   product name, ensuring no two Products share the same Slug.

---

### Requirement 5: SEO and Server-Side Rendering

**User Story:** As a marketing manager, I want every page to be fully crawlable by search engines
with accurate metadata so that the website ranks for targeted keywords in international markets.

#### Acceptance Criteria

1. THE Website SHALL render every page — including all Product Pages, Category Pages, and Industry
   Application Pages — as fully hydrated HTML on the server, with no product content loaded
   exclusively via client-side JavaScript.
2. THE Website SHALL render a unique `<title>` tag on every page containing the page-specific
   product or category name followed by the brand name "JIAYI Tools".
3. THE Website SHALL render a unique `<meta name="description">` tag on every page with a length
   between 120 and 160 characters.
4. WHERE an Admin has configured keywords for a page in the CMS, THE Website SHALL render a
   `<meta name="keywords">` tag containing those keywords.
5. THE Website SHALL render `<link rel="canonical">` tags on every page pointing to the
   authoritative URL for that page.
6. THE Website SHALL generate and serve a `/sitemap.xml` file containing URLs for all public pages,
   updated automatically when Products are added or removed in the CMS.
7. THE Website SHALL render `<link rel="alternate" hreflang>` tags on every page for both supported
   Locales (English and Spanish), pointing to the corresponding localized URL.
8. THE Website SHALL render structured data (JSON-LD `Product` schema) on every Product Page
   containing at minimum: product name, description, brand, image, and SKU.
9. WHEN a page is requested by a search engine crawler, THE Website SHALL respond with HTTP 200 and
   complete HTML content within 3 seconds under normal server load.

---

### Requirement 6: Multilingual Support (English / Spanish)

**User Story:** As a Spanish-speaking buyer, I want to browse the website in Spanish so that I can
understand product details and submit inquiries in my native language.

#### Acceptance Criteria

1. THE Website SHALL support two Locales: English (`en`) and Spanish (`es`), with English as the
   default Locale.
2. THE Website SHALL serve English content at paths prefixed `/en/` or at the root `/` and Spanish
   content at paths prefixed `/es/`.
3. WHEN a Visitor selects a Locale using the language switcher, THE Website SHALL navigate to the
   equivalent page in the selected Locale without requiring a page reload of unrelated assets.
4. THE Website SHALL render all UI labels, navigation items, button text, form labels, and error
   messages in the active Locale.
5. WHERE a Product has a Spanish translation configured in the CMS, THE Website SHALL render the
   translated product name, description, and specification labels on the Spanish Product Page.
6. IF a Product does not have a Spanish translation in the CMS, THEN THE Website SHALL render the
   English content on the Spanish Product Page and log a missing-translation warning in the CMS.
7. THE CMS SHALL allow an Admin to create, edit, and publish content independently for each Locale
   without requiring developer involvement.

---

### Requirement 7: Headless CMS — Strapi Content Management

**User Story:** As an Admin, I want to independently add, edit, and publish products and site
content through a user-friendly dashboard so that the website stays current without requiring a
developer.

#### Acceptance Criteria

1. THE CMS SHALL provide an authenticated web dashboard accessible only to authorized Admin accounts.
2. THE CMS SHALL allow an Admin to create a Product record with the following fields: name (per
   Locale), slug, category, subcategory, short description (per Locale), full description (per
   Locale), specifications (structured key-value pairs, per Locale), images (multiple), Specification
   Sheet PDF (optional), coatings, compatible materials, and SEO metadata (title, description,
   keywords per Locale).
3. THE CMS SHALL allow an Admin to upload, replace, and delete images and PDF files attached to a
   Product without developer assistance.
4. THE CMS SHALL enforce a maximum of one published Product per unique Slug to prevent duplicate URL
   conflicts.
5. WHEN an Admin publishes a Product in the CMS, THE Website SHALL make the Product Page publicly
   accessible within 60 seconds.
6. WHEN an Admin unpublishes a Product in the CMS, THE Website SHALL return HTTP 404 for the
   Product Page within 60 seconds and remove the Product from all Category Page listings.
7. THE CMS SHALL allow an Admin to manage all seven Product Categories and their subcategories
   without requiring a code deployment.
8. THE CMS SHALL allow an Admin to edit the SEO metadata (TDK) for any page independently per
   Locale.

---

### Requirement 8: Inquiry and Contact Forms

**User Story:** As a potential buyer, I want an easy way to submit a product inquiry or general
contact request so that I can start a conversation with Jiayi Tools' sales team.

#### Acceptance Criteria

1. THE Website SHALL render a Contact Page at `/contact` containing: a contact form, company address,
   phone number, email address, and an embedded map.
2. THE Inquiry Form SHALL collect: full name (required), company name (optional), email address
   (required), phone number (optional), country (required), product of interest (required), and a
   message field (required, max 2,000 characters).
3. WHEN a Visitor submits the Inquiry Form with all required fields populated, THE Website SHALL
   send a notification email to the configured recipient address within 60 seconds.
4. WHEN a Visitor submits the Inquiry Form with all required fields populated, THE Website SHALL
   display a confirmation message to the Visitor without reloading the page.
5. IF a Visitor submits the Inquiry Form with a missing required field, THEN THE Website SHALL
   display an inline validation error identifying the missing field without submitting the form.
6. IF a Visitor submits the Inquiry Form with an invalid email format, THEN THE Website SHALL
   display an inline validation error on the email field without submitting the form.
7. THE Website SHALL protect all forms against automated spam using a CAPTCHA or equivalent bot-
   detection mechanism.

---

### Requirement 9: Industry Application Pages

**User Story:** As a procurement engineer in a specific industry, I want a page that explains how
Jiayi Tools' products serve my sector so that I can quickly find the relevant tools for my
application.

#### Acceptance Criteria

1. THE Website SHALL render a unique Industry Application Page for each of the eight industries:
   Aerospace & Aviation, Automotive Manufacturing, Medical Devices & Equipment, Power & Energy,
   Electronics & Semiconductors, Hydraulics, Shipbuilding & Marine Engineering, and Rail Transit &
   Transportation.
2. THE Website SHALL render on each Industry Application Page: an industry headline, a descriptive
   paragraph, representative imagery, and a "View Related Tools" button that links to the relevant
   Product Category Page.
3. THE Website SHALL render Industry Application Pages using SSR so that all content is present in
   the initial HTML server response.
4. THE CMS SHALL allow an Admin to edit the description and imagery for each Industry Application
   Page independently per Locale without requiring a code deployment.

---

### Requirement 10: Performance

**User Story:** As a Visitor on a mobile device or slower connection, I want the website to load
quickly so that I am not lost to a slow experience before seeing the content.

#### Acceptance Criteria

1. THE Website SHALL achieve a Google Lighthouse Performance score of 85 or above on both desktop
   and mobile for the Home Page, measured using the production build.
2. THE Website SHALL serve all product images in a modern format (WebP or AVIF) and apply lazy
   loading to images below the viewport fold.
3. THE Website SHALL achieve a Largest Contentful Paint (LCP) of 2.5 seconds or less on the Home
   Page and Category Pages under a simulated Fast 3G connection.
4. THE Website SHALL serve static assets (JS, CSS, images) with HTTP cache headers configured for
   a minimum cache lifetime of 7 days.
5. THE Website SHALL serve all pages over HTTPS with a valid TLS certificate.

---

### Requirement 11: About and Company Pages

**User Story:** As a Visitor evaluating Jiayi Tools as a supplier, I want to learn about the
company's history, manufacturing capabilities, and certifications so that I can assess credibility.

#### Acceptance Criteria

1. THE Website SHALL render a Company Profile page that includes: company founding year (2009),
   facility location (Shenzhen), facility size (1,800 m²), daily output capacity (8,000 tools),
   geographic sales reach (15 countries), and a description of core product series.
2. THE Website SHALL render an R&D & Manufacturing Capacity page describing five-axis CNC grinding
   equipment (Walter and Rollomatic), material expertise (PCD, PCBN, cermet, carbide), and custom
   tooling capabilities.
3. THE Website SHALL render a News & Exhibitions page displaying company announcements and trade
   show participation records, managed through the CMS.
4. THE CMS SHALL allow an Admin to create, edit, and publish News items and Exhibition records
   without requiring a code deployment.

---

### Requirement 12: Downloadable Product Catalogs

**User Story:** As a Visitor, I want to download product catalogs as PDF files so that I can review
specifications offline or share them with colleagues.

#### Acceptance Criteria

1. THE Website SHALL render a Catalogs page under Services listing all available product catalog
   PDFs.
2. THE Website SHALL display each catalog entry with: catalog name, a cover thumbnail image, a brief
   description, and a download button.
3. WHEN a Visitor clicks a download button, THE Website SHALL initiate the PDF file download in the
   browser without navigating away from the Catalogs page.
4. THE CMS SHALL allow an Admin to upload new catalog PDFs, update existing ones, and set per-
   Locale titles and descriptions without requiring a code deployment.

---

### Requirement 13: Scalability and Maintainability

**User Story:** As the development team and Jiayi Tools, we want the system to be built on a
scalable, maintainable architecture so that the website can grow to hundreds of products and
additional languages without a full rebuild.

#### Acceptance Criteria

1. THE Website SHALL source all dynamic content (products, pages, navigation labels, SEO metadata)
   exclusively through the Strapi CMS REST or GraphQL API, with no content hard-coded in the
   frontend codebase.
2. THE Website SHALL implement Incremental Static Regeneration (ISR) or equivalent on-demand
   revalidation so that individual pages are rebuilt without a full site redeploy when CMS content
   changes.
3. THE Website SHALL be containerized using Docker so that the Next.js frontend and Strapi CMS can
   be deployed and updated independently on the Hostinger VPS.
4. THE CMS SHALL be designed so that adding a new Locale requires only CMS configuration and
   translation content entry by an Admin, with no frontend code changes required for pages already
   supporting the i18n pattern.
5. THE Website SHALL log server errors and API failures to a persistent log accessible to the
   development team, retaining logs for a minimum of 30 days.
