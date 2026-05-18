# KATHER

KATHER is an Express.js and Prisma service for exploring a curated Arabic poetry dataset. It exposes poets, poems, individual lines, catalog metadata, health checks, readiness checks, Prometheus metrics, and OpenAPI documentation.

The API is designed to keep Arabic text UTF-8 safe, preserve right-to-left display at the client layer, and support fast discovery through PostgreSQL trigram indexes.

## Features

- REST API for poets, poems, lines, and catalog filters
- PostgreSQL-backed persistence via Prisma
- Redis-backed count caching and rate-limit storage
- Health and readiness endpoints for deployment checks
- OpenAPI 3.1 specification plus Swagger UI and ReDoc
- Trigram indexes for substring search across Arabic and English fields

## Requirements

- Node.js 22 or newer
- PostgreSQL 15+ with the `pg_trgm` extension available
- Redis 6+ if you want caching and rate limiting to work normally

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

The application starts on `http://localhost:3000` by default.

## Environment Variables

The project reads configuration from `.env`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma |
| `PORT` | No | HTTP port for the Express server |
| `NODE_ENV` | No | Controls logging and error verbosity |
| `TRUST_PROXY` | No | Express trust proxy setting for deployments behind a reverse proxy |
| `CORS_ORIGIN` | No | Comma-separated allowlist for browser origins |
| `REDIS_HOST` | No | Redis host for cache and rate-limit storage |
| `REDIS_PORT` | No | Redis port |
| `REDIS_PASSWORD` | No | Redis password, if required |
| `METRICS_BASIC_AUTH_USER` | No | Basic auth username for `/metrics` |
| `METRICS_BASIC_AUTH_PASSWORD` | No | Basic auth password for `/metrics` |

Notes:

- `DATABASE_URL` is required at startup.
- Redis is used for caching counts and backing the rate-limit store. If Redis is unavailable, the API can still respond, but cache behavior and readiness checks will degrade.
- Set both metrics auth variables in production. If both are empty, `/metrics` is currently left open by the service.

## Database Setup

1. Create the PostgreSQL database referenced by `DATABASE_URL`.
2. Ensure the `pg_trgm` extension is available.
3. Apply migrations.
4. Generate the Prisma client.
5. Seed the dataset if you want the API populated locally.

Typical local workflow:

```bash
npx prisma migrate dev
npx prisma generate
npm run seed
```

The repository also includes `prisma/add_trgm_indexes.sql` for environments where you want to create trigram indexes manually with `psql`.

## Seeding

The seed pipeline loads JSON data from `seedData/` and inserts poets, poems, and poem lines in that order.

```bash
npm run seed
```

Seeding details:

- Poet IDs and poem IDs are explicitly preserved from the seed files.
- Poem lines are inserted in batches for performance.
- Duplicate inserts are skipped, which makes the seed idempotent but can also hide partial dataset issues if the source JSON is inconsistent.

## Running the API

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Docker:

```bash
docker build -t KATHER .
docker run --rm -p 3000:3000 --env-file .env KATHER
```

## API Overview

The service exposes both canonical and versioned aliases. In practice, you can use either the root routes or the `/v1` routes depending on your client preference.

Common route groups:

- `/health` and `/ready`
- `/metrics`
- `/catalog` and `/v1/catalog`
- `/poets` and `/v1/poets`
- `/poems` and `/v1/poems`
- `/lines` and `/v1/lines`

Documentation routes:

- `/openapi.yaml`
- `/openapi.json`
- `/docs`
- `/redoc`

### Query Validation

The public endpoints use middleware-level validation for:

- integer IDs
- limit and offset bounds
- catalog filters such as era, country, sea, quafia, and gender
- search query length
- poem and line type constraints

This keeps invalid input out of the Prisma layer and reduces the chance of runtime query errors.

## Data Model Notes

The Prisma schema models three main entities:

- `Poets`
- `Poems`
- `PoemsLines`

Important implementation details:

- Arabic and English fields are stored as plain PostgreSQL text columns, which is UTF-8 safe.
- Search is implemented with `contains` filters and supported by trigram indexes.
- The schema uses composite indexes for common ordering patterns such as `poetId + order`.
- The data layer prefers deterministic ordering so pagination remains stable across requests.

## Search and Arabic Text

Arabic content is preserved as UTF-8 throughout the stack.

The current search strategy is pragmatic rather than linguistic:

- it uses trigram indexes for fast partial matching
- it does not perform full Arabic stem analysis or general-purpose text normalization
- line search falls back to a diacritic-stripped content column when the query has no diacritics
- results are best for discovery, browsing, and fuzzy search, not for strict lexical search

If you need true Arabic NLP search later, that will require a dedicated normalization or full-text pipeline.

## Caching and Observability

- Count queries are cached in Redis.
- Rate limiting uses a Redis-backed store when Redis is available.
- `/metrics` exposes Prometheus metrics.
- `/ready` checks both PostgreSQL and Redis.

## Security Notes

Before publishing or deploying publicly:

- Never commit a real `.env` file.
- Keep `DATABASE_URL` and Redis credentials in secrets management, not in source control.
- Set `METRICS_BASIC_AUTH_USER` and `METRICS_BASIC_AUTH_PASSWORD` in production.
- Review `CORS_ORIGIN` before deployment and avoid wildcard CORS unless you intentionally want public browser access.
- Treat readiness endpoint error details as operational data; do not expose them more widely than necessary.

## Project Structure

```text
src/
  controllers/   Request handlers and response shaping
  database/      Prisma client setup
  middleware/    Validation, auth, pagination, and request context helpers
  routes/        Express route wiring
  services/      Data access and domain logic
  utils/         Shared helpers, cache, and error types
prisma/
  schema.prisma  Prisma schema
  seed/          Seed loaders
  migrations/    Database migration history
seedData/        JSON source data for poets, poems, and lines
```

## Useful Commands

```bash
npm run dev
npm start
npm run seed
npm run validate:docs
```

## Verification Checklist

Before opening the repository publicly, verify the following:

- `.env` is excluded from Git history and not present in commits
- `.env.example` matches the runtime configuration you actually need
- migrations apply cleanly on a fresh PostgreSQL database
- seeding works end to end against a clean database
- `/health`, `/ready`, `/metrics`, and the documentation routes behave as expected

## Developer Notes

- Large corpus: more than 3 million lines, 2,000+ poets, and 120,000+ poems.
- Structured discovery first: the API is tuned for filtering and browsing, not ad hoc querying.
- Compact metadata layer: the catalog metadata files contain 21 countries, 11 eras, 36 quawafi, 65 seas, and 29 topics.
- Main tradeoff: line search can still be expensive on very large result sets, especially when broad filters are combined.
- Data quality reality: at this scale, some records may be misattributed or inconsistent — for example, a poem assigned to the wrong poet, lines linked to the wrong poem, or false poem type assigned. A single developer cannot manually verify a corpus this large, so if you encounter incorrect or misattributed data, please open a GitHub issue or submit a pull request so it can be corrected in the database.
- Future gap: no voice endpoint is included today; if it becomes a requirement, a cloud text-to-speech service such as Google Cloud Text-to-Speech would be a straightforward path.

## License

ISC