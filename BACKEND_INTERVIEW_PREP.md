# Voyager — Backend Explained (Interview Prep)

## 1. Elevator pitch (say this in 30 seconds)

> "Voyager's backend is a Node.js + Express API, deployed as a Vercel serverless
> function. Its one job is `POST /api/generate`: it takes trip parameters, calls an
> LLM (Groq) through a **multi-model fallback chain** to produce a structured JSON
> itinerary, and then **never trusts that JSON blindly** — every place name is
> independently geocoded through LocationIQ with confidence checks, and every
> activity gets a category-matched photo from Pexels. All third-party calls are
> timeout-bounded, rate-limit-safe through a global request queue, and the whole
> enrichment layer degrades gracefully so a partial API failure never kills the
> user's trip."

The architectural theme: **the LLM is a creative generator; the backend is a
verification and resilience layer around it.**

---

## 2. Stack & layout

| Concern | Choice | Why |
|---|---|---|
| Runtime | Node.js 18+ | Global `fetch` + `AbortController`, no extra HTTP client dependency |
| Framework | Express 4 | Familiar, minimal, works as both server and serverless handler |
| AI | Groq Cloud API (OpenAI-compatible) | LPU inference, ~1–3s responses |
| Geocoding | LocationIQ | Free tier (5k req/day), structured + free-text search, viewbox bias |
| Images | Pexels API | Free, category-relevant real photos |
| Config | dotenv | Secrets only in environment variables |
| Deploy | Vercel Serverless (`@vercel/node`) | One platform for client + API, free tier |

The backend is deliberately a single file (`server/index.js`) with clear internal
sections: middleware → utilities → geocoding → images → the generate route →
error handling. It is **stateless and database-free** — an itinerary is computed
on demand and returned; nothing is persisted.

```
Browser (React)
   │  POST /api/generate { location, days, people, budget_tier, total_budget }
   ▼
Express API (Vercel function / Node locally)
   │
   ├─ 1. Validate input + check API keys
   ├─ 2. Build strict prompt (schema + realism rules)
   ├─ 3. Groq model chain: gpt-oss-120b → qwen3.6-27b → gpt-oss-20b
   │        └─ parse + strip code fences + validate JSON shape
   ├─ 4. Geocode the destination's reference center (LocationIQ structured)
   └─ 5. Enrichment (enrichTrip)
          ├─ Pexels: one image fetch per *unique category*, cached into a map
          └─ LocationIQ: each activity re-geocoded, in batches, via a global
             rate-limit queue, with name-overlap + distance + viewbox checks
   ▼
JSON itinerary with verified coords + images → client renders cards & Leaflet map
```

---

## 3. The request lifecycle, step by step

### Step 1 — Input validation & fail-fast config checks
```js
const { location, days, people = 1, budget_tier = 'Medium', total_budget = 'Flexible' } = req.body;
if (!location || !days) return res.status(400).json({ error: 'location and days are required' });
if (!GROQ_API_KEY)    return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
```
Defaults are applied with destructuring; required fields return **400**; missing
server config returns **500** (that's our fault, not the user's).

### Step 2 — Prompt engineering as a contract
The prompt does three jobs:
1. Assigns a role ("professional local travel consultant in {location}").
2. Encodes **business rules as realism constraints** — include hotel + 3 meals +
   2–3 sights daily, group places by neighborhood to avoid traffic, **never invent
   business names** ("it is better to be vaguely correct than specifically wrong"),
   per-person costs, specific `area` locality for geocoding precision, and a fixed
   enum for `category`.
3. Pins an exact **JSON schema** the response must match.

Low temperature (`0.1`) for determinism and `max_completion_tokens: 5500` to bound
latency/cost for long trips.

### Step 3 — Multi-model fallback chain
```js
const MODEL_CHAIN = ['openai/gpt-oss-120b', 'qwen/qwen3.6-27b', 'openai/gpt-oss-20b'];
for (const modelName of MODEL_CHAIN) { ... if (valid) break; }
```
A model is considered failed and the next one is tried when:
- HTTP **429** (rate limited) or any non-OK status,
- the request **times out / throws** (20s budget via `AbortController`),
- content is empty,
- JSON doesn't parse,
- or the parsed object **fails the shape check** (`itinerary` must be a non-empty array).

If every model fails → honest `500 { error: 'Service busy. Try again.' }`.
This turned "one model's rate limit takes down the app" into automatic,
user-invisible failover.

### Step 4 — Defense-in-depth JSON handling
LLMs leak prose and markdown even when asked not to, so there are four layers:
1. System message: *"Respond with ONLY valid JSON. No markdown, no code fences."*
2. Groq native `response_format: { type: 'json_object' }` (guarantees JSON on supported models).
3. Server-side stripping of ```json fences if they still appear.
4. `JSON.parse` in try/catch **plus a structural shape check** before use.

### Step 5 — Resolve a trusted reference point (destination center)
Before touching activities, geocode the city itself using a **structured** query
(`city=...&country=India`), take up to 5 candidates and pick the highest
LocationIQ `importance` score; fall back to a free-text query constrained by
`countrycodes=in`. This center is the anchor for every later confidence check.

> Production bug this fixed: "Goa" once resolved to a tiny hamlet named Goa in
> Himachal Pradesh (~1,500 km off); "Kurnool" resolved to the district centroid.
> Structured fields + importance ranking fixed both.

### Step 6 — Enrichment (`enrichTrip`)
First flatten every activity across all days into one list
(`flatMap`), then two pipelines:

**(a) Images — fetch once per category, not per activity:**
```js
const uniqueQueries = [...new Set(allActivities.map(resolveCategoryQuery))];
// Promise.all over unique queries → { query: imageUrl } map
```
Category is resolved from the LLM's `category` enum, then a regex-keyword
fallback over place + description (hotel/restaurant/temple/fort/beach/market…).
A 20-activity trip with 4 categories costs **4 Pexels calls, not 20**, and they
run concurrently. A hardcoded fallback image guarantees the UI never gets `null`.

**(b) Geocoding — every LLM coordinate is discarded and re-verified:**
- Activities process in **batches of 3** with a 600 ms pause between batches.
- *Every* LocationIQ HTTP call additionally passes through one **global promise
  chain queue** that spaces real network calls ≥550 ms apart — batching limits
  concurrency; the queue guarantees the rate limit regardless of retries.
- Each place gets up to **3 escalating query strategies**:
  1. `place + area + city`, geographically **bounded** to a 150 km viewbox around the center;
  2. `place + city`, bounded;
  3. `place + city`, unbounded (last resort).
- A candidate must pass two confidence gates:
  - **Name-overlap validation**: normalized significant words (≥4 chars) from the
    queried place must appear in the returned `display_name`, otherwise the fuzzy
    match is rejected.
  - **Haversine distance check**: result must be within 150 km of the city center.
- Failure path: pin to the city center rather than a confidently-wrong point;
  total failure → `coords: null`. The LLM's own `coords` field is **always
  overwritten**.

### Step 7 — Graceful degradation & response
Enrichment is wrapped in try/catch: if Pexels/LocationIQ are entirely down, the
trip still returns — with fallback images / center coords — because the core
value (the itinerary) must not be held hostage by an enrichment vendor.

---

## 4. Cross-cutting engineering patterns

### Timeouts on every external call (`fetchWithTimeout`)
```js
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), timeoutMs);
try { return await fetch(url, { ...options, signal: controller.signal }); }
finally { clearTimeout(timer); }
```
8 s default; 20 s for Groq. Without this, a hung vendor would pin a serverless
invocation until the platform killed it.

### Global rate limiter as a promise chain (no libraries)
```js
let locationIqQueue = Promise.resolve();
function withLocationIqRateLimit(fn) {
  const run = locationIqQueue.then(() => fn());
  locationIqQueue = run.catch(() => {}).then(() => sleep(550)); // `.catch` keeps the chain alive
  return run;
}
```
Each caller appends to the same chain, so even with batches × 3 retries per place,
outbound calls are serialized at a safe interval. The `.catch(() => {})` is
essential — one rejected request must not break the queue for everyone.

> Honest caveat for interviews: on serverless this queue is **per warm
> instance**, not a distributed lock. It bounds per-instance burst; a truly
> global guarantee would need Redis/Throttler or the vendor's account-level quota.

### Secrets never reach the browser
Groq/LocationIQ/Pexels keys live in server env vars only. The browser talks to
our API; our API attaches the keys. `GET /api/debug-env` returns **booleans**
(`hasGroqKey: true`) for production diagnostics — never the key values.

### Observability while debugging in production
- `console.log('[model] Trying / Status / Success')` traces the fallback chain.
- `GET /api/debug-geocode?place=...&area=...&location=...` runs the exact
  geocoding pipeline and returns center, coords, and haversine distance — this is
  the endpoint that exposed the "wrong-but-plausible match" bugs.

### Process-level safety nets
Express 4-arg error middleware, plus `unhandledRejection` and `uncaughtException`
handlers so an async surprise gets logged instead of dying silently.

### Dual-mode entry point
```js
if (require.main === module) { app.listen(process.env.PORT || 3000, ...) }
module.exports = app;
```
Locally it's a long-running server; on Vercel the platform imports `app` as a
serverless handler. Same code, two runtimes. `vercel.json` routes everything to
`index.js` with `@vercel/node`.

### Local dev networking
Vite dev server proxies `/api → http://localhost:3000`, so the client uses
relative URLs in dev and `VITE_API_URL` in production.

---

## 5. API surface

| Method | Route | Purpose |
|---|---|---|
| GET | `/` | Liveness status JSON |
| GET | `/api/health` | `{ ok: true }` health check |
| GET | `/api/debug-env` | Which keys are configured (booleans only) |
| GET | `/api/debug-geocode` | Trace the geocoding pipeline for a place |
| POST | `/api/generate` | Generate + verify + enrich a full itinerary |

---

## 6. STAR stories you can tell

**Situation → Task → Action → Result**

1. **"The AI confidently lied about coordinates."** S: Hotels/forts/restaurants
   appeared ~100 m apart on the map, and non-zero placeholder coords made the
   code skip geocoding. A: Made verification unconditional; LLM coords are always
   discarded; escalated query strategies + viewbox + name overlap + haversine
   gates; honest city-center fallback. R: Every pin now traces to a real
   geocoder result or an explicit fallback.

2. **"Retries reintroduced the rate-limit bug they were meant to fix."** S: Up to
   4 calls/place × concurrent batches burst past LocationIQ's free limit, causing
   silent mass fallback to city center. A: One global promise-chain queue
   spacing calls 550 ms, plus batches of 3 with inter-batch sleeps. R: Zero
   rate-limit failures while keeping enrichment fast.

3. **"One model outage killed the app."** S: A single Groq model getting 429s
   returned errors to every user. A: Ordered fallback chain across three models
   with status/parse/shape-aware failover. R: Automatic failover, no user-facing
   downtime.

4. **"Wrong city, 1,500 km away, with no error."** S: Free-text geocoding of the
   destination matched identically-named hamlets/district centroids. A:
   Structured `city` query, `countrycodes`, pick highest `importance`. R:
   Correct anchor city, which also made every downstream distance check
   meaningful.

5. **"N+1 image calls."** S: One image request per activity wasted quota and
   latency. A: Dedupe category queries via `Set`, fetch concurrently, share via a
   map, keyword fallback + default image. R: ~4 calls instead of ~20, consistent
   photos, guaranteed non-null UI.

---

## 7. Likely interview questions & answers

**Q: Why not trust the LLM for coordinates?**
Generative models optimize plausible text, not factual geodata; they fabricate
coordinates that look valid (non-null, inside the country). We treat the LLM as a
planner and use a deterministic geocoder as the source of truth for facts.

**Q: How does the rate limiter work?**
A serialized promise chain: each task is chained after the previous one plus a
550 ms delay. It's a mutex + fixed-interval scheduler in ~5 lines, shared by all
concurrent batch workers and all retries.

**Q: How do you handle a third-party API failing?**
Three tiers: (1) timeouts via AbortController so we never hang; (2) fallbacks —
next model, next geocode query strategy, center pin, fallback image; (3) graceful
degradation — enrichment failures don't block the core itinerary response.

**Q: How do you guarantee valid JSON from the LLM?**
Four layers: explicit system instruction, native JSON response mode, markdown
fence stripping, and parse + schema-shape validation; invalid output triggers the
next model.

**Q: Why serverless? Any cold-start concerns?**
Free hosting, automatic scaling, and the app exports the Express app for
`@vercel/node`. The work is I/O-bound with ~20 s timeouts; cold start is a few
hundred ms against a multi-second request, so it's negligible here.

**Q: Where's the database?**
There intentionally isn't one — trips are request-scoped and returned to the
client; statelessness keeps the function horizontally scalable and cheap. If we
added history/sharing, I'd add Postgres (the repo even retains a Drizzle config
scaffold) keyed by a trip ID.

**Q: How are API keys secured?**
Server-side env vars, attached server-side; the client never receives them; the
debug endpoint exposes only presence booleans; Vercel dashboard manages prod env
vars separately from local `.env`.

**Q: What would you improve at scale?** (see section 8)

---

## 8. Honest limitations & "what I'd do next"

Being upfront about these is itself an interview signal:

- **No persistence/auth** — no trip history, sharing, or rate limiting per user.
  Next: Postgres + Drizzle, JWT/session auth, Redis for caching identical
  destination lookups.
- **Single-file server** — fine at this size; next split into `routes/`,
  `services/llm.js`, `services/geocode.js`, `services/images.js`, with a schema
  validator like Zod.
- **In-memory rate limiter is per serverless instance**, not cluster-global;
  use a distributed limiter for strict guarantees.
- **Country is hardcoded to India** (`country=India`, `countrycodes=in`) —
  parameterize for international destinations.
- **No automated tests** — the pure functions (haversine, viewbox, word overlap,
  category resolution) are obvious unit-test candidates; mock vendors for
  integration tests.
- **CORS is wide open** — restrict to the known frontend origin in production.
- **Retry strategy is model-level only** — could add exponential backoff /
  circuit breakers (e.g. opossum) per vendor.
- The client sends a `vibe` field the backend currently ignores — easy win to
  fold into the prompt.
- Small, generically-named local businesses can still match a same-named place
  elsewhere; that's a free-tier *data coverage* ceiling — Google Places would
  close the gap.
