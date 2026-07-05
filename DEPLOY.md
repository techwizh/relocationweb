# Deploy Relocate to production

Relocate is a full-stack Next.js app (API routes, database, M-Pesa, file uploads). **GitHub Pages will not work.** Use **Vercel + PostgreSQL + Vercel Blob**.

## What you need

| Service | Purpose | Cost |
|---------|---------|------|
| [GitHub](https://github.com) | Code hosting | Free |
| [Vercel](https://vercel.com) | Host the Next.js app | Free tier |
| [Neon](https://neon.tech) or [Supabase](https://supabase.com) | PostgreSQL database | Free tier |
| Vercel Blob | Admin and driver photo uploads | Free tier |
| Safaricom Daraja | M-Pesa payments | Sandbox free; live after Go Live |

---

## Step 1 — Push code to GitHub

1. Create a new repository on GitHub (e.g. `relocate`).
2. In your project folder, run:

```powershell
cd C:\Users\ADMIN\Projects\relocate
git add .
git commit -m "Prepare Relocate for production deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/relocate.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## Step 2 — Create a PostgreSQL database (Neon)

1. Sign up at [neon.tech](https://neon.tech).
2. Create a project (e.g. `relocate`).
3. Copy the **connection string** — it looks like:
   `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

Keep this for Step 4.

---

## Step 3 — Deploy on Vercel

1. Sign up at [vercel.com](https://vercel.com) with your GitHub account.
2. Click **Add New → Project**.
3. Import your `relocate` repository.
4. Before deploying, open **Storage** in the Vercel sidebar:
   - Add **Blob** store (name it `relocate-uploads`).
   - Vercel will auto-add `BLOB_READ_WRITE_TOKEN` to your project.
5. In **Environment Variables**, add everything from `.env.example`:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Neon connection string from Step 2 |
| `ADMIN_USERNAME` | Your admin login name |
| `ADMIN_PASSWORD` | A strong password (not the dev one) |
| `ADMIN_SESSION_SECRET` | Random string, 32+ characters |
| `SKIP_MPESA_PAYMENT` | `false` (or `true` to skip payments while testing) |
| `MPESA_ENV` | `sandbox` until Safaricom approves Go Live |
| `MPESA_CONSUMER_KEY` | From [Daraja portal](https://developer.safaricom.co.ke) |
| `MPESA_CONSUMER_SECRET` | From Daraja portal |
| `MPESA_SHORTCODE` | `174379` (sandbox) or your live paybill |
| `MPESA_PASSKEY` | From Daraja portal |
| `MPESA_CALLBACK_URL` | `https://YOUR-VERCEL-URL.vercel.app/api/mpesa/callback` |
| `MPESA_ACCOUNT_REFERENCE` | `Relocate` |
| `MPESA_TRANSACTION_DESC` | `Move booking` |

6. Click **Deploy**.

Vercel runs `prisma migrate deploy` during the build, which creates all database tables automatically.

---

## Step 4 — After the first deploy

1. Open your live URL (e.g. `https://relocate-xxx.vercel.app`).
2. Log in at `/admin/login` with your new admin credentials.
3. Go to **Admin → Content** and re-upload your hero image and gallery photos (Blob storage is fresh).
4. Test a booking end-to-end on sandbox M-Pesa (test phone `254708374149`, PIN `174379`).

---

## Step 5 — Custom domain (optional)

In Vercel → **Settings → Domains**, add your domain (e.g. `relocate.co.ke`).

Then update:

- `MPESA_CALLBACK_URL` to `https://yourdomain.com/api/mpesa/callback`
- Redeploy after changing env vars

---

## Local development after this change

The app now uses **PostgreSQL** instead of SQLite. For local dev:

1. Create a free Neon database (or a second branch on the same project).
2. Update your local `.env`:

```
DATABASE_URL="postgresql://..."
```

3. Run migrations and start dev:

```powershell
npm run db:deploy
npm run dev
```

Local uploads still save to `public/uploads/` when `BLOB_READ_WRITE_TOKEN` is not set.

---

## Going live with real M-Pesa

1. Complete Safaricom **Go Live** on the Daraja portal.
2. Set `MPESA_ENV=production` and your live shortcode/passkey.
3. Set `MPESA_CALLBACK_URL` to your production HTTPS callback URL.
4. Redeploy on Vercel.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails on `migrate deploy` | Check `DATABASE_URL` is correct and Neon project is active |
| Admin login fails | Verify `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars on Vercel |
| Image upload fails | Ensure Vercel Blob store is connected and `BLOB_READ_WRITE_TOKEN` exists |
| M-Pesa STK push fails | Callback URL must be public HTTPS; match exactly in Daraja portal |
| Old SQLite data missing | SQLite data does not migrate automatically — re-create test data on Postgres |
