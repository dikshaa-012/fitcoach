# ⚡ FitCoach AI

An AI-powered fitness tracking web app. Log workouts, track streaks and stats, get personalized AI motivational messages, and chat with a fitness AI assistant.

🔗 **[Live Demo →](https://fitcoach-ai.vercel.app)**

---

## Features

- **Workout Logging** — Log activity type, duration, and date with an intuitive form
- **Real-time Stats Dashboard** — Streak, weekly count, most frequent activity, total minutes — updates instantly without page refresh
- **Activity Breakdown** — Visual bar chart of your workout distribution
- **AI Motivational Nudge** — Context-aware motivation referencing your actual data, with 3 coach tones: Friendly Buddy, Tough Coach, Data Nerd
- **AI Q&A Chatbot** — Floating chat widget with multi-turn conversation and persisted history
- **Bonus:** Persisted chat history (survives page refresh), mobile responsive, loading states throughout

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| AI / LLM | Anthropic Claude (Haiku) |
| Deployment | Vercel |

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/fitcoach-ai.git
cd fitcoach-ai
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of [`supabase-schema.sql`](./supabase-schema.sql)
3. Copy your project URL and API keys from **Settings → API**

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

Get your Anthropic API key at [console.anthropic.com](https://console.anthropic.com).

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment (Vercel)

1. Push repo to GitHub
2. Import on [vercel.com](https://vercel.com) — it auto-detects Next.js
3. Add the same 4 environment variables in Vercel's project settings
4. Deploy ✓

---

## Design Decisions & Tradeoffs

**Single-user, no auth** — The assignment didn't specify multi-user. Adding Supabase Auth would be straightforward but adds setup complexity. RLS policies are open (`using (true)`) for simplicity.

**Claude Haiku for AI calls** — Fast and cost-effective for motivational messages and chat. Sonnet would give richer responses at higher cost — easy to swap in `/api/motivation/route.ts` and `/api/chat/route.ts`.

**Stats computed client-side** — `computeStats()` runs in the browser on the fetched workout array. This keeps the API simple (just CRUD) and avoids a dedicated stats endpoint. For large datasets, moving this to a DB query would be more efficient.

**Persisted chat** — Chat messages are stored in Supabase so they survive page refresh (bonus requirement). The chat API sends the last 10 messages as context to stay within token limits.

**Real-time updates** — New workouts are prepended to local state immediately after the POST response, so the stats dashboard and history update without a full refetch.

**Activity icons grid** — Instead of a dropdown for activity type, a visual grid of buttons makes selection faster and more tactile on mobile.
