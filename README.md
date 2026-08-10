# DevPulse

A live dashboard of your GitHub activity — commits, pull requests, issues,
and streaks — built with Next.js 14, NextAuth, MongoDB, and the GitHub API.

![stack](https://img.shields.io/badge/Next.js-14-black) ![stack](https://img.shields.io/badge/TypeScript-5-blue) ![stack](https://img.shields.io/badge/Tailwind-3-38bdf8)

---

## 1. Architecture

```
┌─────────────────────┐        ┌──────────────────────────┐        ┌─────────────┐
│   Next.js frontend   │  auth  │   NextAuth (GitHub OAuth) │        │   GitHub    │
│   (App Router, RSC)  │◄──────►│   JWT session strategy    │───────►│   REST API  │
└──────────┬───────────┘        └──────────────────────────┘        └─────────────┘
           │  fetch()
           ▼
┌─────────────────────┐
│  /api/github/stats   │  15-min cache per user
│  (Next.js API route) │─────────────┐
└──────────┬───────────┘             │
           ▼                         ▼
┌─────────────────────┐   ┌───────────────────┐
│   MongoDB Atlas      │   │  /api/github/sync  │  optional daily sweep,
│   Users + Stats      │   │  (cron-triggered)   │  triggered by Vercel Cron
└─────────────────────┘   └───────────────────┘
```

**Why this shape:**
- The dashboard never talks to GitHub directly from the browser — every call
  is server-side, so the user's OAuth token never reaches client JS.
- Stats are cached in MongoDB for 15 minutes per user so a page refresh
  doesn't burn GitHub's rate limit (5,000 req/hr authenticated).
- `/api/github/sync` is a stubbed hook for a scheduled background refresh —
  see the comment in that file for why it doesn't fetch live data itself
  (it needs a long-lived token strategy, e.g. a GitHub App, which is a real
  decision to make deliberately rather than bolt on).

## 2. Project structure

```
devpulse/
├── app/
│   ├── page.tsx                  # landing / sign-in
│   ├── layout.tsx                # fonts, providers
│   ├── providers.tsx             # SessionProvider + ThemeProvider
│   ├── globals.css               # design tokens, grid background
│   ├── dashboard/page.tsx        # authenticated dashboard shell
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       └── github/
│           ├── stats/route.ts    # cached GitHub summary for the session user
│           └── sync/route.ts     # cron-triggered background sweep hook
├── components/
│   ├── Sidebar.tsx
│   ├── StatCard.tsx
│   ├── CommitChart.tsx           # recharts area chart
│   ├── RepoBreakdown.tsx
│   ├── DashboardClient.tsx       # fetches + renders the above
│   ├── SignInButton.tsx
│   └── PulseLine.tsx             # animated hero signature element
├── lib/
│   ├── auth.ts                   # NextAuth config
│   ├── github.ts                 # Octokit calls + aggregation logic
│   ├── db.ts                     # cached Mongoose connection
│   └── utils.ts
├── models/
│   ├── User.ts
│   └── Stats.ts
├── types/next-auth.d.ts          # session typing (adds `login`, `accessToken`)
└── vercel.json                   # optional daily cron
```

## 3. Local setup

**Prerequisites:** Node 18+, a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster, a GitHub account.

```bash
git clone <this-repo> devpulse
cd devpulse
npm install
cp .env.example .env.local
```

### 3.1 Create a GitHub OAuth App
1. Go to **github.com/settings/developers → New OAuth App**
2. Homepage URL: `http://localhost:3000`
3. Callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and generate a Client Secret → paste into `.env.local`
   as `GITHUB_ID` / `GITHUB_SECRET`

### 3.2 MongoDB Atlas (free forever, M0 tier)
1. Create a free cluster → create a database user → allow access from
   anywhere (0.0.0.0/0) for local dev
2. Copy the connection string into `.env.local` as `MONGODB_URI`

### 3.3 NextAuth secret
```bash
openssl rand -base64 32   # paste into NEXTAUTH_SECRET
```

### 3.4 Run it
```bash
npm run dev
```
Visit `http://localhost:3000`, sign in with GitHub, and the dashboard fetches
your last 90 days of commits, PRs, and issues.

## 4. Deployment — two free paths

### Option A: Fully free, zero AWS (recommended to start)
| Piece | Service | Free tier |
|---|---|---|
| Frontend + API routes | **Vercel** | Generous hobby tier, native Next.js support |
| Database | **MongoDB Atlas M0** | 512MB, free forever |
| Cron (optional sync sweep) | **Vercel Cron** | Included on Hobby (daily granularity) |

Steps:
1. Push this repo to GitHub
2. Import it in [vercel.com/new](https://vercel.com/new)
3. Add the same env vars from `.env.local` in the Vercel project settings
4. Update the GitHub OAuth App's callback URL to your Vercel domain
   (`https://your-app.vercel.app/api/auth/callback/github`)
5. Set `NEXTAUTH_URL` to your production URL

### Option B: AWS free tier variant
If you want this running on AWS instead of Vercel:

| Piece | AWS free-tier service | Notes |
|---|---|---|
| Frontend + API | **Amplify Hosting** (SSR support) or **Lambda + API Gateway** via [OpenNext](https://open-next.js.org/) | Amplify is the simpler on-ramp for Next.js |
| Database | **DynamoDB** | Always-free tier (25GB) — would require swapping the Mongoose models for a DynamoDB SDK client, since the schema here is Mongo-shaped |
| Auth | Keep **NextAuth + GitHub OAuth** as-is, or swap for **Cognito** with a GitHub identity provider | NextAuth is simpler to keep |
| Cron | **EventBridge Scheduler** → target the `/api/github/sync` Lambda | Free tier covers this comfortably |
| Email digest | **SES** | 62,000 emails/month free when sent from an EC2-hosted sender |

The honest trade-off: Option A is less setup and has no "12-months-only"
billing traps. Option B is worth it once you specifically want AWS on your
resume/infrastructure, or need to integrate with other AWS services.

## 5. Extending this

- **Team mode**: add a `Team` model, let users join by invite code, and
  aggregate `Stats` across team members on a `/dashboard/team` route.
- **Weekly digest email**: wire up Resend or SES in `lib/`, and trigger it
  from `/api/github/sync` once you've decided on a long-lived token strategy.
- **GitHub App instead of OAuth App**: swaps per-user tokens (which expire
  and require re-consent) for installation tokens, which is what makes a
  real background sync worker practical.

## 6. Design notes

The visual identity treats commit activity literally as a **pulse** — an
animated ECG-style line is the hero's signature element, echoed in the
sidebar's live-signal dot and the "syncing…" state. Palette is nearly black
with a signal green as the primary accent, plus amber/coral/violet used
consistently to distinguish PRs, issues, and streaks across the dashboard.
Data is set in JetBrains Mono to read as instrumentation rather than prose.
