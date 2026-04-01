# ASIN Review Intelligence Dashboard

Production-ready internal dashboard to monitor Amazon reviews from ASIN input.

## Core principles

- No login
- No account flow
- ASIN is the only business input
- Product metadata and review content are fetched automatically through an ingestion provider layer

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- TanStack Query + TanStack Table
- ExcelJS
- Zod

## Architecture

### Flow

1. ASIN input (single or bulk)
2. Ingestion service resolves metadata + reviews automatically
3. Normalization and upsert in PostgreSQL
4. Dashboard and review intelligence views
5. Excel export filtered by date/rating/keyword/marketplace/verified

### Key modules

- Input UI: `src/components/dashboard/asin-import-card.tsx`
- Sync API: `src/app/api/sync/route.ts`
- Ingestion service: `src/lib/ingestion/review-ingestion-service.ts`
- Provider abstraction: `src/types/index.ts` (`ReviewConnector`)
- Active provider switch: `src/lib/connectors/index.ts`
- Provider implementation (mock): `src/lib/connectors/mock-connector.ts`

### Provider methods

The provider contract is ASIN-centric:

- `discoverProductByAsin(asin, marketplace)`
- `fetchProductMetadata(asin, marketplace)`
- `fetchReviewsByAsin(asin, marketplace, options?)`

The ingestion service exposes:

- `syncMultipleAsins({ asins, marketplace, latestOnly })`
- `syncTrackedAsinsLatest()`

## Features

- ASIN input (single + bulk paste)
- Button: `Fetch reviews`
- Button: `Sync latest reviews`
- Product table (ASIN, title, image, rating, review count, latest review)
- Product detail with review list and filters
- Filters:
  - from date
  - to date
  - minimum rating
  - maximum rating
  - keyword
  - marketplace
  - verified purchase
- Excel + CSV export with active filter scope

## Excel output

Filename format:

- `amazon_reviews_export_YYYY-MM-DD_to_YYYY-MM-DD.xlsx`

Sheets:

1. `ASIN Summary`
   - ASIN
   - Product Title
   - Amazon Rating
   - Total Review Count
   - Latest Review Date
   - Reviews Included In Export
2. `Reviews`
   - ASIN
   - Product Title
   - Review Date
   - Review Rating
   - Review Title
   - Review Body
   - Reviewer Name
   - Marketplace
   - Verified Purchase
3. `Export Info`

## Database schema

Defined in `prisma/schema.prisma`.

Main tables:

- `products`
- `reviews`
- `marketplaces`
- `sync_logs`

Indexes include:

- ASIN
- reviewDate
- rating

## Local setup

1. Install

```bash
npm install
```

2. Configure environment

```bash
cp .env.example .env
```

Set at least:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/asinreview_watchers"
```

3. Generate Prisma client

```bash
npx prisma generate
```

4. Apply schema

```bash
npm run db:push
```

5. Optional seed

```bash
npm run db:seed
```

6. Run app

```bash
npm run dev
```

## Deploy on Vercel

- Framework: Next.js
- Root directory: `app`
- Build command: `npm run build`
- Install command: `npm install`
- Environment variable: `DATABASE_URL`

## Replace mock provider with real ingestion

1. Create a provider implementing `ReviewConnector`
2. Plug it in `src/lib/connectors/index.ts`
3. Keep UI and APIs unchanged

This keeps retrieval logic decoupled from dashboard components.
