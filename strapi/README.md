# Jiayi Tools — Strapi v4 CMS

This directory will contain the Strapi v4 headless CMS.

## Setup

Bootstrapped in Task 2 (`Bootstrap Strapi v4 CMS with PostgreSQL and i18n`).

## Tech Stack

- **CMS**: Strapi v4
- **Database**: PostgreSQL 15 (via `postgres` Docker service)
- **Language**: TypeScript
- **Plugins**: i18n (en / es), Draft & Publish

## Content Types

- `Product` — individual cutting tool, i18n enabled
- `Category` — one of seven product categories, i18n enabled
- `IndustryPage` — one of eight industry application pages, i18n enabled
- `NewsItem` — news & exhibition entries, i18n enabled
- `Catalog` — downloadable PDF catalogs, i18n enabled

## Development

```bash
# From the repo root — starts all services including Strapi
make up

# Tail logs for just the Strapi service
docker compose logs -f strapi

# Access the admin panel
open https://yourdomain.com/strapi/admin
```

## Build

```bash
# Rebuild the Strapi Docker image
docker compose build strapi
```

## Environment Variables

See `.env.example` at the repo root for all required variables.
