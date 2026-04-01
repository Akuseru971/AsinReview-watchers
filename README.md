# AsinReview Watchers

A production-ready dashboard to centralize Amazon reviews for all your ASINs.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL |
| ORM | Prisma v7 |
| Tables | TanStack Table v8 |
| Data fetching | TanStack Query v5 |
| Auth | NextAuth v5 (Auth.js) |
| Charts | Recharts |
| Excel export | ExcelJS |
| Validation | Zod |

---

## Features

- **Dashboard overview** – KPI grid (total ASINs, avg rating, total reviews, new reviews)
- **ASIN list** – sortable table with product image, rating, review count, latest review date
- **ASIN detail page** – rating distribution, weekly trend chart, paginated review list
- **Review list** – global review browser with full filter set
- **Filters** – date range, min/max rating, keyword, marketplace, verified-only
- **Quick filter** – "Low-rated only" button (1–2 stars)
- **Excel export** – 3-sheet workbook (Summary, Reviews, Metadata), color-coded ratings
- **CSV export** – UTF-8, properly escaped
- **Sync** – one-click sync with loading/success/error states
- **Multi-user** – all data is scoped per authenticated user
- **Abstracted data layer** – swap the connector without touching UI

---

## Project Structure

```
app/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Demo data seed
├── prisma.config.ts           # Prisma v7 config (datasource URL)
├── src/
│   ├── app/
│   │   ├── (auth)/login/      # Login page
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   └── dashboard/
│   │   │       ├── page.tsx           # Overview (KPIs + product table)
│   │   │       ├── products/
│   │   │       │   ├── page.tsx       # ASIN list
│   │   │       │   └── [id]/page.tsx  # ASIN detail + reviews
│   │   │       ├── reviews/page.tsx   # All reviews global view
│   │   │       ├── analytics/page.tsx # Charts
│   │   │       └── settings/page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/    # Auth routes
│   │       ├── kpis/                  # KPI stats
│   │       ├── products/              # Product CRUD + reviews
│   │       ├── reviews/               # Global reviews + trend
│   │       ├── export/                # Excel + CSV export
│   │       └── sync/                  # Review sync trigger
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── kpi-grid.tsx
│   │   │   ├── filter-bar.tsx
│   │   │   ├── review-filter-bar.tsx
│   │   │   ├── product-table.tsx
│   │   │   ├── review-list.tsx
│   │   │   ├── trend-chart.tsx
│   │   │   ├── rating-distribution.tsx
│   │   │   ├── sync-button.tsx
│   │   │   └── export-button.tsx
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   └── topbar.tsx
│   │   ├── providers/
│   │   │   └── query-provider.tsx
│   │   └── ui/
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── empty-state.tsx
│   │       ├── input.tsx
│   │       ├── skeleton.tsx
│   │       └── star-rating.tsx
│   ├── hooks/
│   │   ├── use-kpis.ts
│   │   ├── use-products.ts
│   │   ├── use-reviews.ts
│   │   ├── use-sync.ts
│   │   └── use-trend.ts
│   ├── lib/
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── export.ts           # Excel + CSV builders
│   │   ├── prisma.ts           # Singleton Prisma client
│   │   ├── utils.ts            # Helpers
│   │   ├── validation.ts       # Zod schemas
│   │   └── connectors/
│   │       ├── index.ts        # Active connector export
│   │       └── mock-connector.ts
│   ├── middleware.ts           # Auth route protection
│   └── types/
│       └── index.ts            # Shared TypeScript types
```

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/Akuseru971/AsinReview-watchers.git
cd AsinReview-watchers/app
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/asinreview_watchers"
AUTH_SECRET="generate-with--openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

Also update `prisma.config.ts` if needed (it reads `DATABASE_URL` by default).

### 3. Set up the database

```bash
# Create & migrate the database
npm run db:migrate

# Seed with demo data (5 ASINs + ~200 reviews)
npm run db:seed
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).  
Login with: `demo@example.com` / `password123`

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:push` | Push schema changes (no migration) |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |

---

## Connecting a Real Amazon Data Source

1. Create a file `src/lib/connectors/amazon-connector.ts`
2. Implement the `ReviewConnector` interface from `src/types/index.ts`:
   - `fetchProducts(userId)` → returns `ExternalProduct[]`
   - `fetchReviewsByAsin(asin, marketplace, options?)` → returns `ExternalReview[]`
   - `syncReviews(userId)` → returns `SyncResult`
3. Update `src/lib/connectors/index.ts`:

```ts
import { amazonConnector } from "./amazon-connector";
export const activeConnector = amazonConnector;
```

No other files need to change.

---

## Excel Export Format

**File name:** `amazon_reviews_export_YYYY-MM-DD_to_YYYY-MM-DD.xlsx`

**Sheet 1 – ASIN Summary**
- ASIN, Product Title, Amazon Rating, Total Review Count, Latest Review Date, Reviews Included In Export

**Sheet 2 – Reviews**
- ASIN, Product Title, Review Date, Rating (color-coded), Review Title, Review Body (wrapped), Reviewer Name, Marketplace, Verified Purchase, Sentiment

**Sheet 3 – Export Info**
- Export metadata

---

## Deployment (Vercel)

```bash
# Set env vars in Vercel dashboard, then:
vercel deploy
```

Recommended: use [Supabase](https://supabase.com) or [Neon](https://neon.tech) for the hosted Postgres database.

---

## Security

- All API routes require authentication (JWT session)
- All database queries are scoped to `userId`
- Input validated with Zod on all API endpoints
- No secrets or credentials in the codebase
