# Railway deployment

This project is a Node/Express API that runs via `npm start` (see `package.json`) and binds to `process.env.PORT` (see `server.js`). Railway will provide `PORT` automatically.

## What about `.env`?

- **Do not commit `.env`**. It’s already ignored by `.gitignore`.
- Use `.env` **only for local development**.
- In Railway, add the same keys as **Railway Variables** (Project → Variables).
- You can copy/paste from `.env.example` and replace values.

### Local dev

1. Create your local file:
   - `cp .env.example .env`
2. Fill in the values (Supabase + Firebase + admins).
3. Run:
   - `npm run dev`

### Railway (production)

1. Push to GitHub.
2. Railway → New Project → Deploy from GitHub.
3. Railway → Variables: add all required env vars.

#### Required variables

- `NODE_ENV=production`
- `CORS_ORIGIN=https://your-frontend-domain.com`
- Supabase:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Firebase:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`
- Admin:
  - `ADMIN_EMAILS` (comma-separated)

#### Notes

- `FIREBASE_PRIVATE_KEY` must keep newlines. The common pattern is:
  - `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
- Migrations live in `migrations/supabase/migrations/*.sql` and should be applied to Supabase.

## Logging on Railway

Railway reads logs from stdout/stderr. This repo logs to console by default.

- Optional file logging (not recommended on Railway): set `LOG_TO_FILE=true`.

## Quick verification

After deploy, hit:
- `GET /api/v1/health`
