# Carbon Crunch Maintainers README

This document is for engineers maintaining the website and backend API.

## 1) Repository Layout

- Frontend app (React + Vite + Tailwind): project root
- Backend API (Express + MongoDB): `Backend/`
- Page sections are modularized per page under:
  - `src/components/pages/about/`
  - `src/components/pages/services/`
  - `src/components/pages/brsr/`
  - `src/components/pages/carbon-os/`
  - `src/components/pages/industries/`
  - `src/components/pages/book-demo/`
  - `src/components/pages/contact/`
  - `src/components/pages/case-studies/`
  - `src/components/pages/service-detail/`

## 2) Local Development (Frontend + Backend)

### Prerequisites

- Node.js 20+
- npm 10+

### Install dependencies

From repo root:

```bash
npm install
npm --prefix Backend install
```

### Backend environment variables

Create `Backend/.env`:

```env
MONGODB_URI=<your-mongodb-connection-string>
ADMIN_API_KEY=<strong-random-secret>
PORT=8787
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

Notes:

- `MONGODB_URI` is required for API read/write routes.
- `ADMIN_API_KEY` is required for protected GET read endpoints.
- If `ADMIN_API_KEY` is missing, read endpoints return `403 Read access is disabled`.

### Run locally

Terminal 1 (backend):

```bash
npm run api:dev
```

Terminal 2 (frontend):

```bash
npm run dev
```

Default URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://127.0.0.1:8787`

## 3) API Routes Summary

### Public route

- `GET /api/health`
  - No auth required
  - Returns:
    - `200` with `{ status: "ok", timestamp }` when DB is connected
    - `503` with `{ status: "degraded", timestamp }` when DB is disconnected

### Form submission routes (POST)

- `POST /api/book-demo`
- `POST /api/contact-us`
- `POST /api/subscribe`

### Protected read routes (GET)

All routes below require request header `x-admin-key: <ADMIN_API_KEY>`:

- `GET /api/book-demo`
- `GET /api/contact-us`
- `GET /api/subscribe`

Current behavior:

- Returns all records sorted by newest first (`createdAt: -1`)
- No pagination/filter parameters implemented yet

## 4) How To Use GET Routes To Fetch Data

## 4.1 Using curl

Set your key once in shell:

```bash
export ADMIN_API_KEY="<your-admin-key>"
```

Fetch demo bookings:

```bash
curl -s \
  -H "x-admin-key: $ADMIN_API_KEY" \
  http://127.0.0.1:8787/api/book-demo
```

Fetch contact submissions:

```bash
curl -s \
  -H "x-admin-key: $ADMIN_API_KEY" \
  http://127.0.0.1:8787/api/contact-us
```

Fetch subscribers:

```bash
curl -s \
  -H "x-admin-key: $ADMIN_API_KEY" \
  http://127.0.0.1:8787/api/subscribe
```

## 4.2 Using JavaScript fetch (Node/internal tool)

```js
const API_BASE = "http://127.0.0.1:8787";
const ADMIN_KEY = process.env.ADMIN_API_KEY;

async function readRoute(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: {
      "x-admin-key": ADMIN_KEY,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`${res.status} ${body.error || "Request failed"}`);
  }

  return res.json();
}

const bookDemoEntries = await readRoute("/api/book-demo");
const contactEntries = await readRoute("/api/contact-us");
const subscribers = await readRoute("/api/subscribe");

console.log({
  bookDemoCount: bookDemoEntries.length,
  contactCount: contactEntries.length,
  subscriberCount: subscribers.length,
});
```

## 4.3 Common errors when using GET routes

- `401 Unauthorized`
  - `x-admin-key` is missing or wrong
- `403 Read access is disabled`
  - `ADMIN_API_KEY` is not configured on server
- `403 Origin not allowed`
  - Request origin is not in `CORS_ORIGIN` (browser-based requests)
- `503 Service temporarily unavailable`
  - Database is reconnecting
- `429 Too many requests`
  - Rate limit exceeded

## 5) Returned Data Shapes

### `GET /api/book-demo`

Array of objects with fields:

- `_id`
- `name`
- `phone`
- `email`
- `company`
- `date`
- `time`
- `message`
- `createdAt`
- `updatedAt`

### `GET /api/contact-us`

Array of objects with fields:

- `_id`
- `name`
- `phone`
- `email`
- `company`
- `message`
- `createdAt`
- `updatedAt`

### `GET /api/subscribe`

Array of objects with fields:

- `_id`
- `email`
- `createdAt`
- `updatedAt`

## 6) Build and Release Checks

From repo root:

```bash
npm run build
```

Recommended before merging:

- Frontend build succeeds
- Backend starts with expected env vars
- `GET /api/health` returns `ok`
- Protected GET routes work with valid `x-admin-key`
- Protected GET routes fail with invalid key (`401`)

## 7) Security Notes

- Never commit real values from `Backend/.env`.
- Do not expose `ADMIN_API_KEY` in public client code.
- Use server-side/internal tooling for protected GET route access.
