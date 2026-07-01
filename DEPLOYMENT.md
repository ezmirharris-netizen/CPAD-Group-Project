# Deploying SkillSwap (free tier)

Three services, all free: **Netlify** (frontend) + **Render** (backend API) + **Railway** (MySQL).

## 0. Push to GitHub
Both Render and Vercel deploy by connecting to a GitHub repo, so push this project there first.

## 1. Database — Railway
1. New Project → Provision MySQL.
2. Open the MySQL service's **Variables** tab and note `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`.
3. Connect with any MySQL client (TablePlus, DBeaver, `mysql` CLI) using those credentials and import `docs/schema.sql`.

## 2. Backend — Render
1. New → Web Service → connect your repo.
2. Root directory: `backend`. Runtime: **Docker** (it'll pick up `backend/Dockerfile` automatically).
3. Plan: Free.
4. Add environment variables (values from Railway + your own JWT secret):
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` → from Railway
   - `DB_CHARSET=utf8mb4`
   - `JWT_SECRET` → generate a fresh one: `php -r "echo bin2hex(random_bytes(32));"`
   - `JWT_TTL=3600`, `JWT_ISSUER=SkillSwap`
   - `LOGIN_RATE_LIMIT=5`, `LOGIN_WINDOW_SECONDS=60`
   - `CORS_ALLOWED_ORIGINS` → leave blank for now, come back after step 3
5. Deploy. Render gives you a URL like `https://skillswap-backend.onrender.com`.
   - Free tier sleeps after 15 min idle; the first request after that takes ~30–60s to wake up.
   - (A `render.yaml` blueprint is included at the repo root if you'd rather use Render's "New Blueprint" flow instead of the manual steps above.)

## 3. Frontend — Netlify
1. Add new site → Import an existing project → connect your repo.
2. Netlify reads `netlify.toml` at the repo root automatically (base dir `Frontend`, build `npm run build`, publish `dist`) — you shouldn't need to touch the build settings.
3. Site settings → Environment variables → add `VITE_API_URL=https://skillswap-backend.onrender.com/api` (your actual Render URL + `/api`).
4. Deploy. Netlify gives you a URL like `https://skillswap.netlify.app`.
   - If you want a nicer one, Site settings → Domain management → Options → Edit site name.

## 4. Close the loop on CORS
Back in Render's environment variables, set:
```
CORS_ALLOWED_ORIGINS=https://skillswap.netlify.app
```
(no trailing slash — comma-separate multiple origins if you have a Netlify deploy-preview domain too). Redeploy the backend for it to take effect.

## 5. Smoke test
Visit the Netlify URL and try registering/logging in — that single flow touches the DB connection, JWT signing, and CORS all at once, so it's the fastest way to confirm everything's wired correctly.

## Notes
- The JWT secret that was committed in `backend/.env` for local dev should be treated as compromised — don't reuse it in production, only in the fresh `JWT_SECRET` you generate for Render.
- Railway's free MySQL runs on a monthly usage credit rather than being unlimited-forever. If you exhaust it on a long-running project, `db4free.net` is a smaller but genuinely-free-forever fallback.
