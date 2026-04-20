This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# Spark — Prompt-First Matching for Ditto

Most dating apps fail at the same place: the decision to match is made on near-zero signal, so when two people connect, they have nothing to say. Spark moves the meaningful signal — a short, candid answer to a personality prompt — to the front of the discovery experience, so the match decision carries weight and the first message already half-exists.

---

## Why Prompt-First Matching Is the Right First Feature

The default dating app loop is: swipe on photos → match → stare at a blank text box → ghost. The product failure is not in the messaging layer. It's upstream, at the moment of decision. Users are optimizing for volume because the system gives them no reason to optimize for quality.

The first feature on a new dating platform should answer one question: *what makes a match on this platform more valuable than a match anywhere else?* Everything else — the chat system, notifications, date scheduling, AI features — is downstream of that answer.

Prompt-first matching changes the decision variable. You are not just liking a photo. You are liking a person who said something specific. That asymmetry in information quality produces better conversations, longer retention, and — the metric that matters — higher first-message rates per match.

Hinge has prompts. The difference here is that the prompt answer is not decoration on a profile page you visit after matching. It is the lead element on the discovery card, visible at the moment of decision. That sequencing change is the product bet.

---

## What I Built

A Next.js 14 prototype with three screens, each proving one product hypothesis.

```
spark/
├── app/
│   ├── page.tsx                  → Root: routes to /setup or /feed via localStorage
│   ├── setup/page.tsx            → Prompt setup screen
│   ├── feed/page.tsx             → Discovery feed
│   └── match/[id]/page.tsx       → Match screen
├── components/
│   ├── ProfileCard.tsx           → Core card: photo + prompt answer + like/pass
│   ├── PromptSelector.tsx        → Prompt selection grid
│   └── MatchScreen.tsx           → Side-by-side prompt answers + suggested opener
├── data/
│   ├── prompts.ts                → 6 curated prompt strings
│   └── profiles.ts               → 8 mock profiles with realistic prompt answers
├── lib/
│   ├── feedLogic.ts              → Match trigger logic, seen-profile filtering
│   └── storage.ts                → LocalStorage read/write helpers
└── types/index.ts                → Profile, Prompt, UserState types
```

### Screen 1 — Prompt Setup
**Proves:** Users will invest a small amount of effort if the prompt options are good and the input friction is low.

User picks one of six prompts and writes a short answer (150 char max). This is the only gate before the feed. The prompt library is curated to surface personality, not demographics — "The best way to win me over is..." lands differently than "Looking for..." The answer becomes your first-class matching signal for every person who sees your profile.

### Screen 2 — Discovery Feed
**Proves:** Prompt answers change the like/pass decision and make discovery feel more intentional.

Each card shows a photo, name, age, and — leading visually — the other person's prompt answer. Not in a sidebar. Not in a secondary tab. As the primary readable element on the card. The hypothesis: users who read a prompt answer they connect with before liking will produce higher-quality matches than users who swipe on photos alone.

### Screen 3 — Match Screen
**Proves:** A shared text artifact at the moment of matching removes the blank-first-message problem.

When both users like each other, they see their two prompt answers side by side with a suggested conversation opener derived from the prompt content. The opener is not AI-generated in this prototype (it's seeded in mock data), but the architecture for generating it with an LLM is explicit in the production design below.

---

## Architecture

### What I Built (Prototype)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS FRONTEND                             │
│                    [ What I built — runs in browser ]               │
│                                                                     │
│  ┌──────────────┐   ┌──────────────────┐   ┌────────────────────┐  │
│  │ Prompt Setup │──▶│  Discovery Feed  │──▶│   Match Screen     │  │
│  │  /setup      │   │  /feed           │   │   /match/[id]      │  │
│  └──────────────┘   └──────────────────┘   └────────────────────┘  │
│          │                  │                        │              │
│          └──────────────────┴────────────────────────┘             │
│                             │                                       │
│                    ┌────────▼────────┐                             │
│                    │  localStorage   │                             │
│                    │  UserState:     │                             │
│                    │  - promptId     │                             │
│                    │  - answer       │                             │
│                    │  - liked[]      │                             │
│                    │  - passed[]     │                             │
│                    │  - matched[]    │                             │
│                    └────────────────┘                             │
│                                                                     │
│           ┌──────────────────────────────────┐                     │
│           │  Static Mock Data (JSON)          │                     │
│           │  profiles.ts — 8 profiles         │                     │
│           │  prompts.ts  — 6 prompt strings   │                     │
│           └──────────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Production Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PRODUCTION SYSTEM                                     │
│                   [ What this becomes at scale ]                                │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      NEXT.JS FRONTEND                            │
│  - Prompt setup, discovery feed, match screen                    │
│  - Emits structured behavior events on user actions              │
│                                                                  │
│  Events emitted:                                                 │
│    { type: "like",  userId, targetId, dwellMs, promptVisible }   │
│    { type: "pass",  userId, targetId, dwellMs, promptVisible }   │
│    { type: "match_open",  userId, matchId, openerShown }         │
│    { type: "message_sent", userId, matchId, messageBody }        │
└───────────────────────────┬──────────────────────────────────────┘
                            │  HTTPS → API Route (Next.js)
                            │  POST /api/events
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                      KAFKA EVENT STREAM                          │
│                                                                  │
│  Topics:                                                         │
│    user-interactions   ← like/pass events + dwell time           │
│    match-events        ← mutual like triggers                    │
│    outcome-signals     ← message sent, date confirmed            │
│                                                                  │
│  Partitioned by userId for ordered per-user event processing.    │
│  Retention: 7 days raw, compacted to outcome store indefinitely. │
└─────┬──────────────────────────┬───────────────────────┬─────────┘
      │                          │                       │
      ▼                          ▼                       ▼
┌──────────────┐    ┌────────────────────────┐   ┌──────────────────┐
│   POSTGRES   │    │   INFERENCE CONSUMER   │   │  RANKING MODEL   │
│              │    │   (Python / asyncio)   │   │                  │
│  Tables:     │    │                        │   │  Input features: │
│  profiles    │    │  Consumes:             │   │  - prompt_sim    │
│  prompts     │    │    match-events topic  │   │    (embedding    │
│  answers     │    │                        │   │     cosine sim)  │
│  likes       │    │  For each new match:   │   │  - dwell_time_ms │
│  passes      │    │  1. Fetch both users'  │   │  - like_rate     │
│  matches     │    │     prompt answers     │   │    by prompt cat │
│  messages    │    │     from Postgres      │   │  - outcome_label │
│  outcomes    │    │  2. Call LLM:          │   │    (messaged?)   │
│              │    │     - Generate match   │   │                  │
│  Indexes:    │    │       explanation      │   │  Trained on:     │
│  userId      │    │     - Generate 3       │   │  outcome signals │
│  promptId    │    │       conversation     │   │  from outcomes   │
│  createdAt   │    │       openers          │   │  topic           │
│              │    │  3. Write to           │   │                  │
│              │◀───│     matches table      │   │  Inference:      │
│              │    │                        │   │  Re-ranks feed   │
└──────────────┘    │  LLM layer:            │   │  candidates      │
       ▲            │  - Primary: claude-    │   │  before serving  │
       │            │    sonnet-4 (quality)  │   │  to frontend     │
       │            │  - Fallback: gpt-4o    │   └────────┬─────────┘
       │            │  - Cheap tier:         │            │
       │            │    haiku / gpt-4o-mini │            │
       │            │    (high volume)       │            │
       │            └────────────────────────┘            │
       │                                                   │
       └───────────────────────────────────────────────────┘
                         reads / writes

┌──────────────────────────────────────────────────────────────────┐
│                      FEEDBACK LOOP                               │
│                                                                  │
│  Signal collection:                                             │
│    outcome-signals topic captures:                              │
│      - message_sent     (weak positive)                         │
│      - conversation_len (medium positive: >3 exchanges)         │
│      - date_confirmed   (strong positive — in-app or manual)    │
│      - unmatch          (negative)                              │
│      - report           (strong negative)                       │
│                                                                  │
│  Pipeline:                                                       │
│    Kafka consumer → outcomes table in Postgres                  │
│    Nightly batch job → joins likes + outcomes                   │
│    Produces training rows: (feature_vec, label)                 │
│    Re-trains ranking model on rolling 90-day window             │
│    New model artifact pushed to ranking service                  │
│                                                                  │
│  Effect:                                                         │
│    Feed re-ranks candidates based on predicted                  │
│    conversation probability, not just recency or activity.      │
│    Prompt category affinity learned from outcome data.          │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE                              │
│                                                                  │
│  Containerization:  Docker + docker-compose (dev)               │
│                     Kubernetes (prod, horizontal pod scaling)   │
│  Inference consumers: parallelized workers, auto-scaled by      │
│                       Kafka consumer group lag                  │
│  Database:          Postgres (primary) + read replicas          │
│                     for feed ranking queries                    │
│  LLM hot-swap:      Model router checks latency/cost budget     │
│                     per request, falls back automatically       │
│  Observability:     Event lag, inference latency, match-to-     │
│                     message conversion rate — all instrumented  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Data Model

```typescript
// types/index.ts

type Prompt = {
  id: string;
  text: string;           // "I'm weirdly passionate about..."
  category: PromptCategory; // personality | humor | values | lifestyle
};

type Profile = {
  id: string;
  name: string;
  age: number;
  photo: string;
  promptId: string;
  promptAnswer: string;
  promptEmbedding?: number[]; // 1536-dim vector in prod (ada-002)
};

type UserState = {
  promptId: string;
  promptAnswer: string;
  liked: string[];
  passed: string[];
  matched: string[];
};

// Production additions (not built in prototype):
type MatchRecord = {
  id: string;
  userA: string;
  userB: string;
  matchExplanation: string;    // LLM-generated
  conversationOpeners: string[]; // LLM-generated, 3 options
  createdAt: Date;
};

type OutcomeSignal = {
  matchId: string;
  signalType: "message_sent" | "conversation_len" | "date_confirmed" | "unmatch";
  value: number;
  recordedAt: Date;
};
```

---

## Feed Logic

```typescript
// lib/feedLogic.ts

// Trigger a match on the 2nd like — deterministic for demo purposes.
// In production: mutual like in Postgres, async match-event published to Kafka.
export function checkForMatch(liked: string[]): string | null {
  if (liked.length === 2) return liked[1];
  return null;
}

export function getRemainingProfiles(
  allProfiles: Profile[],
  liked: string[],
  passed: string[]
): Profile[] {
  const seen = new Set([...liked, ...passed]);
  return allProfiles.filter(p => !seen.has(p.id));
}

// Production version: this becomes a ranked Postgres query.
// SELECT p.* FROM profiles p
// LEFT JOIN likes l ON l.target_id = p.id AND l.user_id = $userId
// WHERE l.id IS NULL
// ORDER BY ranking_score DESC   ← from ranking model
// LIMIT 20;
```

---

## Intentional Tradeoffs

**No authentication.** Auth is a solved problem and building it would have consumed 20% of the available time for zero product signal. In production: Supabase Auth or NextAuth with Google/Apple SSO. The mock user pattern is explicit and documented, not an oversight.

**No backend.** All state lives in localStorage. The data model is typed, the logic is isolated in `feedLogic.ts`, and the shape of the production system is documented in this README. The prototype proves the interaction design. The backend would be net-new work on top of it, not a rewrite.

**No messaging system.** Messaging is downstream of matching quality. If the match mechanism doesn't produce conversations people want to have, a better chat UI doesn't fix it. The "Send First Message" CTA is intentionally mocked to signal that this feature is complete on its own terms.

**Static mock data over generative profiles.** The prompt answers in mock data were written by hand to feel specific and charming. AI-generated placeholder profiles often feel hollow. In a demo context, the quality of the mock data is part of the product craft.

**Hardcoded conversation openers over live LLM calls.** The match screen shows a suggested opener seeded in mock data rather than hitting an LLM at runtime. This avoids latency, cost, and API key management in a prototype. The production inference consumer architecture handles this properly — see architecture above.

---

## What I'd Measure

**Primary metric: first-message rate per match.**

> Of all mutual matches created, what percentage result in at least one message sent by either party within 48 hours?

This is the metric that validates the core hypothesis. If prompt-visible matches produce a meaningfully higher first-message rate than baseline (photo-only matches), the feature works. If not, either the prompts are wrong, the prompt answers aren't legible at card size, or the suggested opener is unhelpful.

**Holdout test design:**
- Group A: discovery feed with prompt answer visible on card (treatment)
- Group B: discovery feed with prompt answer hidden, accessible only after match (control — approximates current Hinge behavior)
- Randomized at the user level, not session level
- Primary outcome: first-message rate per match at 48h
- Secondary outcomes: conversation length (>3 exchanges), match-to-date rate (if outcome signal exists)

**Secondary metrics:**
- Dwell time per card (proxy for prompt answer engagement)
- Pass rate by prompt category (which prompts produce more passes? → prune the library)
- Like rate on prompt-visible cards vs. profile-only cards (does more information increase or decrease like rate? either answer is interesting)

**What I'd watch for in week one:**
If first-message rate improves but like rate drops, that's a success — it means users are being more selective, which is the intended behavior. If both drop, the prompt answers aren't interesting enough and the prompt library needs iteration.

---

## Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript  
- **Styling:** Tailwind CSS  
- **State:** localStorage + useState (prototype) → Kafka + Postgres (production)  
- **Prod infra:** Kafka · Postgres · Python inference consumers · Multi-model LLM hot-swap

---

## Running Locally

```bash
git clone https://github.com/fhliu1219/spark
cd spark
npm install
npm run dev
# Open http://localhost:3000
# localStorage is used for state — clear it to reset the flow
```

To reset the experience (re-run prompt setup):

```javascript
// Browser console
localStorage.removeItem("spark_user_state");
location.reload();
```

---

## What's Next (V2 Priorities)

1. **Prompt category clustering** — group prompts by type (humor, values, lifestyle) and surface category-matched profiles higher in the feed. This is the first personalization layer.

2. **Live LLM inference for conversation openers** — connect the match screen to the inference consumer described above. A/B test 3 opener styles (question, observation, callback) against no opener at all.

3. **Outcome instrumentation** — add the Kafka event emit on "first message sent" and wire the feedback loop. The ranking model cannot improve without labeled outcome data. This is the highest-leverage infrastructure investment after launch.

4. **Prompt answer quality signal** — track which prompt answers get the most likes per impression. Feed that signal back to the prompt library curation process. Bad prompts produce boring answers; good prompts produce matches.
