# Relocate

Book moving vehicles in Mombasa and Nairobi — customer bookings, M-Pesa payments, driver portal, and admin dashboard.

## Live website

**The app is not hosted on GitHub.** This repository stores the source code only.

When you open `github.com/techwizh/relocationweb`, you will always see this README and the code — that is normal.

Your **live website** appears after you deploy on **Vercel**:

1. Push this repo to GitHub (done once).
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Add environment variables (see [DEPLOY.md](./DEPLOY.md)).
4. Deploy — Vercel gives you a URL like `https://relocationweb.vercel.app`.

Use that Vercel URL (or your custom domain) to visit the actual website. Do **not** enable GitHub Pages for this project.

## Local development

```powershell
npm install
npm run db:deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

See [DEPLOY.md](./DEPLOY.md) for full production setup (PostgreSQL, Vercel Blob, M-Pesa).
