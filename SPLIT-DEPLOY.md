# Split deploy: Backend (Render) + Frontend (Vercel)

Relocate runs in two parts:

| Part | Host | URL example | Role |
|------|------|-------------|------|
| **Backend** | Render (free) | `https://relocationweb-api.onrender.com` | API, database, M-Pesa, uploads |
| **Frontend** | Vercel (free) | `https://relocationweb.vercel.app` | Website pages users see |

---

## Step 1 — Backend on Render (do this first)

### 1A. Create a PostgreSQL database (Neon)

1. Go to [neon.tech](https://neon.tech) and sign up.
2. Create a project named `relocate`.
3. Copy the connection string (`postgresql://...?sslmode=require`).

### 1B. Create a Render account

1. Go to [render.com](https://render.com) and sign up with GitHub.
2. Allow Render to access your `techwizh/relocationweb` repo.

### 1C. Create the Web Service

1. Click **New +** → **Web Service**.
2. Connect repository **`techwizh/relocationweb`**.
3. Use these settings:

| Setting | Value |
|---------|-------|
| **Name** | `relocationweb-api` |
| **Region** | Choose closest to Kenya (e.g. Frankfurt) |
| **Branch** | `main` |
| **Root Directory** | *(leave blank)* |
| **Runtime** | Node |
| **Build Command** | `npm install && npx prisma generate && npx prisma migrate deploy && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | Free |

### 1D. Add environment variables on Render

In **Environment** → add:

```
DATABASE_URL=postgresql://...your-neon-url...
ADMIN_USERNAME=techwiz
ADMIN_PASSWORD=YourNewStrongPassword
ADMIN_SESSION_SECRET=relocate-prod-secret-2026-xK9mP2vL8nQ4
SKIP_MPESA_PAYMENT=true
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your-passkey
MPESA_CALLBACK_URL=https://relocationweb-api.onrender.com/api/mpesa/callback
MPESA_ACCOUNT_REFERENCE=Relocate
MPESA_TRANSACTION_DESC=Move booking
```

Replace `relocationweb-api` in `MPESA_CALLBACK_URL` with your actual Render service name if different.

### 1E. Deploy and test

1. Click **Create Web Service** and wait ~5–10 minutes (first build is slow).
2. When status is **Live**, open:

   `https://YOUR-SERVICE.onrender.com/api/health`

   You should see:

   ```json
   {"ok":true,"service":"relocate-api","timestamp":"..."}
   ```

3. Save your Render URL — you need it for Step 2.

**Note:** Render free tier sleeps after ~15 minutes of no traffic. The first request after sleep takes 30–60 seconds to wake up.

---

## Step 2 — Frontend on Vercel (after Step 1 works)

We will connect Vercel to proxy `/api/*` calls to your Render backend so the website works as one app.

Tell me when Step 1 is done (health check works) and we will do Step 2 together.

---

## Step 3 — Custom domain (optional, later)

- Point your domain to **Vercel** for the website.
- Update `MPESA_CALLBACK_URL` on **Render** to use that domain’s API path.
