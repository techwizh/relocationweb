# Relocate — Full System Documentation

Book moving vehicles in **Mombasa** and **Nairobi**, Kenya. Own-fleet model with M-Pesa payments, in-app chat, live GPS tracking, driver portal, and admin dashboard.

---

## Table of contents

1. [Live URLs](#live-urls)
2. [Architecture](#architecture)
3. [Tech stack](#tech-stack)
4. [User roles & flows](#user-roles--flows)
5. [Pages & routes](#pages--routes)
6. [API reference](#api-reference)
7. [Database schema](#database-schema)
8. [Authentication & sessions](#authentication--sessions)
9. [M-Pesa payments](#m-pesa-payments)
10. [File uploads](#file-uploads)
11. [Environment variables](#environment-variables)
12. [Deployment](#deployment)
13. [Local development](#local-development)
14. [Project structure](#project-structure)
15. [Troubleshooting](#troubleshooting)

---

## Live URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Website (public)** | Your Vercel URL (e.g. `https://relocationweb.vercel.app`) | Customers, drivers, admin UI |
| **Backend API** | `https://relocationweb-api.onrender.com` | API, database, M-Pesa, uploads |
| **Health check** | `https://relocationweb-api.onrender.com/api/health` | Verify backend is running |
| **Source code** | `https://github.com/techwizh/relocationweb` | Git repository (not the live site) |

**Important:** GitHub shows the README and code. The live website is always the **Vercel URL**.

---

## Architecture

Production uses a **split deploy**:

```
┌─────────────────────────────────────────────────────────────┐
│  VERCEL (Frontend)                                          │
│  • Next.js pages (landing, book, admin UI, etc.)            │
│  • Proxies /api/* → Render via API_URL rewrite              │
│  • No database connection                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS (API calls + cookies)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  RENDER (Backend)                                           │
│  • Next.js API routes (/api/*)                              │
│  • Prisma + PostgreSQL (Neon)                               │
│  • M-Pesa STK Push + callback                               │
│  • Image uploads (local or Vercel Blob token)               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  NEON (PostgreSQL)                                          │
│  • Users, bookings, payments, chat, GPS, CMS content      │
└─────────────────────────────────────────────────────────────┘
```

**Local development** runs everything on one machine (`localhost:3000`) with no `API_URL` set.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL via Prisma 6 |
| Maps | Leaflet / react-leaflet |
| Payments | Safaricom Daraja M-Pesa (STK Push) |
| Frontend host | Vercel |
| Backend host | Render (free tier) |
| Database host | Neon (free tier) |
| Image storage | `public/uploads/` locally; Vercel Blob in production (optional) |

---

## User roles & flows

### Customer

1. Visit landing page → **Book a move**
2. Choose city, sub-county, ward, vehicle, date, contact details
3. Pay with M-Pesa (or skip if `SKIP_MPESA_PAYMENT=true`)
4. Chat with driver, track live GPS
5. Optional: register at `/register` → **My account** lists all bookings

### Driver

1. Register at `/driver/register` (photos, license, vehicle)
2. Wait for admin approval
3. Log in at `/login` (Driver tab)
4. **Driver portal**: toggle availability, accept assigned jobs, update status, share GPS, chat

### Admin

1. Log in at `/admin/login`
2. **Dashboard** — stats overview
3. **Content** — edit landing page text and upload hero/gallery images
4. **Drivers** — approve/reject applications, set internal contact phone
5. **Bookings** — assign paid bookings to approved drivers
6. **Fleet** — live map of driver GPS

---

## Pages & routes

### Public

| Path | Description |
|------|-------------|
| `/` | Landing page (CMS-driven) |
| `/book` | New booking form |
| `/book/[id]/pay` | M-Pesa payment |
| `/book/[id]/chat` | Booking chat |
| `/book/[id]/track` | Live driver map |
| `/book/access-denied` | Shown when booking access fails |
| `/login` | Customer or driver login |
| `/register` | Customer registration |
| `/driver/register` | Driver application |
| `/driver/register/success` | Post-registration confirmation |

### Customer (requires login)

| Path | Description |
|------|-------------|
| `/account` | My bookings, chat/track links |

### Driver (requires login + approved profile)

| Path | Description |
|------|-------------|
| `/driver/dashboard` | Jobs, availability, GPS sharing |

### Admin (requires admin session)

| Path | Description |
|------|-------------|
| `/admin` | Dashboard stats |
| `/admin/content` | Landing page CMS |
| `/admin/drivers` | Review driver applications |
| `/admin/bookings` | Assign drivers to bookings |
| `/admin/fleet` | Live fleet map |
| `/admin/login` | Admin login |

---

## API reference

All API routes live on **Render** in production. Vercel proxies `/api/*` to Render.

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | None | Service health check |

### Landing & CMS

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/landing` | None | Public landing page content |
| GET | `/api/admin/content` | Admin | Get CMS content |
| PUT | `/api/admin/content` | Admin | Save CMS content |
| POST | `/api/admin/upload` | Admin | Upload image |

### Bookings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/bookings` | Optional customer | Create booking |
| GET | `/api/bookings/[id]` | Guest/customer cookie | Booking details for pay page |
| GET | `/api/bookings/[id]/access` | Booking access | Access check for chat/track |
| POST | `/api/bookings/[id]/pay` | Booking access | Initiate M-Pesa STK Push |
| GET | `/api/bookings/[id]/payment-status` | Booking access | Poll payment status |
| GET | `/api/bookings/[id]/messages` | Booking access | List chat messages |
| POST | `/api/bookings/[id]/messages` | Booking access | Send chat message |
| GET | `/api/bookings/[id]/location` | Booking access | Latest driver GPS for booking |

### M-Pesa

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/mpesa/callback` | Safaricom | Payment webhook (Render URL only) |

### Customer auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/customer/register` | None | Register |
| POST | `/api/customer/login` | None | Login |
| POST | `/api/customer/logout` | Customer | Logout |
| GET | `/api/customer/me` | Customer | Current user |
| GET | `/api/customer/bookings` | Customer | My bookings list |

### Driver auth & portal

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/drivers/register` | None | Driver application |
| POST | `/api/driver/login` | None | Login |
| POST | `/api/driver/logout` | Driver | Logout |
| GET | `/api/driver/me` | Driver | Current driver user |
| GET | `/api/driver/dashboard` | Driver | Jobs + profile for portal |
| POST | `/api/driver/availability` | Driver | Toggle available/offline |
| POST | `/api/driver/location` | Driver | Submit GPS coordinates |
| POST | `/api/driver/jobs/[bookingId]/status` | Driver | Advance job status |

### Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/admin/login` | None | Admin login |
| POST | `/api/admin/logout` | Admin | Logout |
| GET | `/api/admin/stats` | Admin | Dashboard counts |
| GET | `/api/admin/bookings` | Admin | Bookings + approved drivers |
| POST | `/api/admin/bookings/[id]/assign` | Admin | Assign driver to booking |
| GET | `/api/admin/drivers` | Admin | Driver list (`?status=PENDING`) |
| POST | `/api/admin/drivers/[id]/review` | Admin | Approve/reject driver |
| PATCH | `/api/admin/drivers/[id]/contact` | Admin | Set driver internal phone |
| GET | `/api/admin/fleet` | Admin | Live driver locations |

---

## Database schema

PostgreSQL managed by Prisma. Key models:

| Model | Purpose |
|-------|---------|
| `User` | Customers, drivers, admins (role enum) |
| `DriverProfile` | Driver status, availability, photos |
| `Vehicle` | Driver vehicle details |
| `Booking` | Move details, status, pricing |
| `Payment` | M-Pesa payment records |
| `ChatMessage` | Per-booking chat |
| `LocationUpdate` | Driver GPS history |
| `LandingPageContent` | CMS JSON for home page |

### Booking status flow

```
DRAFT → PENDING_PAYMENT → PAID → ASSIGNED → EN_ROUTE → LOADING → IN_TRANSIT → DELIVERED
                                                                              ↘ CANCELLED
```

Driver advances: **Assigned → En route → Loading → In transit → Delivered**

### Vehicle types & base prices (KES)

| Type | Base price |
|------|------------|
| Van | 3,500 |
| Pickup | 5,500 |
| Canter (3-ton) | 9,000 |
| Lorry (7-ton+) | 15,000 |

### Cities

- **Mombasa** — Mvita, Nyali, Kisauni, Likoni, Changamwe, Jomvu
- **Nairobi** — Westlands, Dagoretti, Lang'ata, Kibra, etc.

---

## Authentication & sessions

All sessions use **httpOnly cookies** signed with `ADMIN_SESSION_SECRET`.

| Cookie | Role | Max age |
|--------|------|---------|
| `relocate_admin_session` | Admin | 8 hours |
| `relocate_customer_session` | Customer | 30 days |
| `relocate_driver_session` | Driver | 7 days |
| `relocate_booking_{id}` | Guest booking access | 90 days |

**Split deploy rule:** `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` must be **identical on Render and Vercel** so login cookies work across the proxy.

Guest booking cookies are set when a booking is created, allowing chat/track/pay without an account.

---

## M-Pesa payments

1. Customer submits booking → status `PENDING_PAYMENT`
2. `/book/[id]/pay` triggers STK Push via Daraja API
3. Customer enters PIN on phone
4. Safaricom calls `MPESA_CALLBACK_URL` on **Render**
5. Booking status → `PAID`; customer redirected to chat

### Sandbox testing

| Setting | Value |
|---------|-------|
| `MPESA_ENV` | `sandbox` |
| Test phone | `254708374149` |
| Test PIN | `174379` |
| Shortcode | `174379` |

Set `SKIP_MPESA_PAYMENT=true` to bypass payment during testing (booking goes straight to `PAID`).

### Production (live money)

1. Complete Safaricom **Go Live** on [Daraja portal](https://developer.safaricom.co.ke)
2. Set `MPESA_ENV=production` on **Render**
3. Use live shortcode, passkey, consumer key/secret
4. Set `MPESA_CALLBACK_URL=https://relocationweb-api.onrender.com/api/mpesa/callback`
5. Set `SKIP_MPESA_PAYMENT=false`

---

## File uploads

| Environment | Storage |
|-------------|---------|
| Local dev | `public/uploads/` |
| Render (with `BLOB_READ_WRITE_TOKEN`) | Vercel Blob (public URLs) |
| Render (without token) | `public/uploads/` (ephemeral on Render — use Blob for production) |

Allowed: JPG, PNG, WebP, GIF — max 5 MB each.

Used for: driver profile/license photos, vehicle photos, admin hero/gallery images.

---

## Environment variables

### Render (backend) — required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |
| `ADMIN_SESSION_SECRET` | Cookie signing secret (32+ chars) |
| `SKIP_MPESA_PAYMENT` | `true` to skip M-Pesa in testing |
| `MPESA_ENV` | `sandbox` or `production` |
| `MPESA_CONSUMER_KEY` | Daraja consumer key |
| `MPESA_CONSUMER_SECRET` | Daraja consumer secret |
| `MPESA_SHORTCODE` | Paybill/till (174379 sandbox) |
| `MPESA_PASSKEY` | Daraja passkey |
| `MPESA_CALLBACK_URL` | Render callback URL |
| `MPESA_ACCOUNT_REFERENCE` | `Relocate` |
| `MPESA_TRANSACTION_DESC` | `Move booking` |

### Vercel (frontend) — required

| Variable | Description |
|----------|-------------|
| `API_URL` | Render backend URL (no trailing slash) |
| `ADMIN_USERNAME` | Must match Render |
| `ADMIN_PASSWORD` | Must match Render |
| `ADMIN_SESSION_SECRET` | Must match Render |
| `SKIP_MPESA_PAYMENT` | `true` during testing |

**Do not set `DATABASE_URL` on Vercel.**

### Optional

| Variable | Where | Description |
|----------|-------|-------------|
| `BLOB_READ_WRITE_TOKEN` | Render | Vercel Blob for persistent uploads |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Either | Map provider (future use) |

---

## Deployment

See also: [SPLIT-DEPLOY.md](./SPLIT-DEPLOY.md)

### Render (backend)

```
Build:  npm install && npx prisma generate && npx prisma migrate deploy && npm run build
Start:  npm start
Health: /api/health
```

### Vercel (frontend)

```
Build:  prisma generate && next build
Env:    API_URL + admin secrets (no DATABASE_URL)
```

Vercel `next.config.ts` rewrites `/api/:path*` → `${API_URL}/api/:path*`.

### Custom domain

1. Add domain in **Vercel** → Settings → Domains (website)
2. Keep M-Pesa callback on **Render** URL (or proxy if using same domain)

---

## Local development

```powershell
cd C:\Users\ADMIN\Projects\relocate
npm install
```

Create `.env` from `.env.example`. For local DB use Neon URL or PostgreSQL:

```
DATABASE_URL="postgresql://..."
# Do not set API_URL locally
```

```powershell
npm run db:deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Useful scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:migrate` | Create migration (dev) |
| `npm run db:deploy` | Apply migrations (prod/local) |
| `npm run db:studio` | Prisma Studio GUI |

---

## Project structure

```
relocate/
├── prisma/
│   ├── schema.prisma          # Database models
│   └── migrations/            # PostgreSQL migrations
├── public/uploads/            # Local image uploads
├── src/
│   ├── app/
│   │   ├── api/               # Backend API routes
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── account/           # Customer account
│   │   ├── book/              # Booking flow
│   │   ├── driver/            # Driver portal
│   │   ├── login/ register/   # Auth pages
│   │   └── page.tsx           # Landing page
│   ├── components/            # React UI components
│   └── lib/
│       ├── admin-auth.ts      # Admin session
│       ├── customer-auth.ts   # Customer session
│       ├── driver-auth.ts     # Driver session
│       ├── booking-access.ts  # Guest booking cookies
│       ├── mpesa.ts           # Daraja API
│       ├── prisma.ts          # Database client
│       ├── uploads.ts         # Image upload handler
│       ├── api-server.ts      # Server-side API fetch (split deploy)
│       └── api-url.ts         # API_URL helper
├── render.yaml                # Render deploy blueprint
├── vercel.json                # Vercel build config
├── SPLIT-DEPLOY.md            # Deploy walkthrough
└── SYSTEM.md                  # This document
```

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---------|--------------|-----|
| GitHub shows README only | GitHub is code storage | Use **Vercel URL** for the website |
| `/api/health` fails on Render | Build failed or service sleeping | Check Render logs; wait 30–60s on free tier |
| Admin login fails on Vercel | Secrets don't match Render | Sync `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` |
| `Failed to parse URL from /api/...` | Server fetch without origin | Fixed in latest code; redeploy Render |
| M-Pesa STK push fails | Wrong keys or callback URL | Check Daraja credentials; callback must be Render HTTPS URL |
| Image upload fails on Render | No persistent disk | Add `BLOB_READ_WRITE_TOKEN` on Render |
| First request very slow | Render/Neon free tier cold start | Normal; upgrade plan for always-on |
| Booking chat "forbidden" | No guest cookie or not paid | Complete payment first; cookies must match domain |
| Build fails on Vercel with Prisma | `DATABASE_URL` set on Vercel | Remove `DATABASE_URL` from Vercel env |

---

## Security checklist (before public launch)

- [ ] Change `ADMIN_PASSWORD` from default/example
- [ ] Use a long random `ADMIN_SESSION_SECRET`
- [ ] Set real M-Pesa credentials and `SKIP_MPESA_PAYMENT=false`
- [ ] Do not commit `.env` to GitHub
- [ ] Review approved drivers before they receive jobs
- [ ] Consider custom domain + HTTPS on Vercel

---

*Last updated: July 2026 — Relocate v0.1.0*
