# Jiayi Tools — Next.js 14 Frontend

This directory will contain the Next.js 14 App Router frontend.

## Setup

Bootstrapped in Task 3 (`Bootstrap Next.js 14 frontend with next-intl and core configuration`).

## Tech Stack

- **Framework**: Next.js 14 (App Router, SSR/ISR)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **i18n**: next-intl (en / es)
- **Forms**: react-hook-form + zod
- **Testing**: Jest + React Testing Library + fast-check
- **Logging**: pino

## Development

```bash
# From the repo root — starts all services including Next.js
make up

# Tail logs for just the Next.js service
docker compose logs -f next
```

## Build

```bash
# Rebuild the Next.js Docker image
docker compose build next
```
