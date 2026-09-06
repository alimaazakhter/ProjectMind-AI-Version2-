# 🚀 Deploying ProjectMind AI (Free: Vercel + Render)

ProjectMind AI is a 3-tier app. You deploy **3 pieces**; your database, auth, and AI
are already cloud services.

| Piece | Where | Free? |
|---|---|---|
| Frontend (Next.js) | **Vercel** | ✅ |
| Backend (Express) | **Render** web service | ✅ |
| AI worker (FastAPI) | **Render** web service | ✅ |
| Database | **Supabase** (already) | ✅ |
| Auth | **Clerk** (already) | ✅ |
| LLM | **Google Gemini** (already) | ✅ (daily free quota) |

> Deploy order matters because the services reference each other's URLs. Follow the
> steps top to bottom. You'll do a small second pass to fill in cross-URLs at the end.

---

## 0) Before you start — have these ready
- Your GitHub repo pushed (done): `alimaazakhter/ProjectMind-AI-Version2-`
- **Gemini API key** — https://aistudio.google.com/
- **Supabase**: `SUPABASE_URL` + `service_role` key (Project Settings → API)
- **Clerk**: publishable + secret keys (dashboard.clerk.com)
- An **admin passcode** you choose (any strong string)

### Run the DB migrations once (if not already)
In Supabase → SQL Editor, run the files in `backend/src/migrations/` in order,
including `003_security_policies.sql` (Row-Level Security ownership policies).

---

## 1) Deploy the two servers on Render (Blueprint)

1. Go to https://dashboard.render.com → **New +** → **Blueprint**.
2. Connect the GitHub repo. Render detects **`render.yaml`** and shows two services:
   `projectmind-backend` and `projectmind-ai-worker`.
3. Click **Apply**. Render will prompt for the `sync: false` env vars. Fill them:

   **projectmind-ai-worker (FastAPI)**
   | Key | Value |
   |---|---|
   | `GEMINI_API_KEY` | your Gemini key |
   | `ALLOWED_ORIGINS` | leave blank for now (fill in step 4) |

   **projectmind-backend (Express)**
   | Key | Value |
   |---|---|
   | `SUPABASE_URL` | your Supabase URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | your service_role key |
   | `CLERK_PUBLISHABLE_KEY` | `pk_...` |
   | `CLERK_SECRET_KEY` | `sk_...` |
   | `ADMIN_PASSCODE` | your chosen passcode |
   | `FRONTEND_URL` | leave blank for now (fill in step 4) |
   | `FASTAPI_URL` | leave blank for now (fill in step 4) |

4. Let both deploy. Note their URLs, e.g.:
   - Backend → `https://projectmind-backend.onrender.com`
   - AI worker → `https://projectmind-ai-worker.onrender.com`
5. Verify health:
   - `https://projectmind-backend.onrender.com/health`
   - `https://projectmind-ai-worker.onrender.com/health`

---

## 2) Deploy the frontend on Vercel

1. Go to https://vercel.com → **Add New** → **Project** → import the repo.
2. **Root Directory: `frontend`** (important — it's a monorepo).
   Framework auto-detects as Next.js; leave build/output defaults.
3. Add Environment Variables:
   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_EXPRESS_API_URL` | `https://projectmind-backend.onrender.com/api/v1` |
   | `NEXT_PUBLIC_API_URL` | `https://projectmind-backend.onrender.com/api/v1` |
   | `NEXT_PUBLIC_USE_MOCK_DATA` | `false` |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_...` |
   | `CLERK_SECRET_KEY` | `sk_...` |
   | `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
   | `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
   | `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
   | `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |
4. **Deploy.** Note the URL, e.g. `https://projectmind-ai.vercel.app`.

---

## 3) Wire the cross-URLs (second pass) — this makes it all talk

Now that every URL exists, go back and fill the blanks:

**Render → projectmind-backend → Environment**
- `FRONTEND_URL` = `https://projectmind-ai.vercel.app`
- `FASTAPI_URL` = `https://projectmind-ai-worker.onrender.com/api/v1/ai`  ← note the `/api/v1/ai`

**Render → projectmind-ai-worker → Environment**
- `ALLOWED_ORIGINS` = `https://projectmind-backend.onrender.com,https://projectmind-ai.vercel.app`

Save each — Render redeploys automatically.

### Clerk: allow your production domain
In the Clerk dashboard, add your Vercel domain (`https://projectmind-ai.vercel.app`)
to the allowed origins / paths. Test keys (`pk_test`) work on any domain; for a real
launch, create a **Production** Clerk instance and use its `pk_live`/`sk_live` keys.

---

## 4) Test it
1. Open your Vercel URL, sign in.
2. Generate a project (first request may be slow — see cold starts below).
3. Chat with the assistant; check Project History persists after logout/login.
4. Admin portal → unlock with your `ADMIN_PASSCODE`.

---

## ⚠️ Free-tier realities (not bugs)
- **Cold starts:** Render free services sleep after ~15 min idle. The first request
  after idle takes ~50s to wake each service. Generation (~100s) can therefore feel
  like 2–3 min on the first cold hit, then it's fast.
- **Gemini free quota:** 20 requests/day *per model*. The app chains several models,
  so you get generous daily headroom, but heavy use can exhaust it; it resets at
  midnight Pacific (~12:30 PM IST). Add billing to your Gemini key to remove the cap.
- **Keep servers awake (optional):** a free uptime pinger (e.g. cron-job.org) hitting
  the two `/health` URLs every ~10 min avoids cold starts during demos.

## 🔐 Secrets
All real secrets live only in the Vercel/Render dashboards and in local `.env` files
(gitignored). The committed `.env.example` files document the keys with placeholder
values — never put real secrets in them.
