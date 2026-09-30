<img src="https://readme-typing-svg.herokuapp.com?font=Poppins&weight=800&size=45&pause=1000&color=38BDF8&center=true&vCenter=true&width=500&height=70&lines=🌍+VOYAGER+v2.1" alt="Voyager" />
<img src="client/src/components/voyager-logo.png" alt="Voyager logo" width="160" />

⚡ AI-Powered Travel Planner

🌍 Voyager

"Stop planning your trips with 50 open tabs."

AI-powered travel planner that verifies what the AI tells it




Stop planning your trips with 50 open tabs.
Tell Voyager where you're going, for how long, with whom and on what budget. You get a day-by-day itinerary with real map pins, real photos and real costs, and you can replan any day in one click.

<br />

React 18 · Vite · Node.js · Express · Groq AI · LocationIQ · Pexels · Leaflet.js · Tailwind CSS v4

<br />

<a href="https://voyager-node-f-inal-fefq.vercel.app/">
  <img src="https://img.shields.io/badge/▶_PLAN_YOUR_TRIP_NOW-FF4444?style=for-the-badge&logoColor=white" alt="Try Now" height="40" />
</a>
[![Live App](https://img.shields.io/badge/🚀_Live_App-Try_Voyager-F59E0B?style=for-the-badge)](https://voyager-node-f-inal-fefq.vercel.app/)
[![Demo Video](https://img.shields.io/badge/🎬_Demo_Video-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/posts/siva-charan-kg-72a900284_traveltech-generativeai-llm-ugcPost-7425072513896017920-r3tk)
[![Source](https://img.shields.io/badge/Source_Code-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Siva2583/Voyager-Node-FInal)









About •
Features •
How it works •
Quick start •
API •
Engineering notes •
Limitations

</div>

📖 About

Voyager is a full-stack AI application that generates personalized, day-by-day travel itineraries. Unlike generic AI wrappers, Voyager combines intelligent model orchestration with real-world data verification to produce trip plans that are:
Voyager is a full-stack app that generates personalised, day-by-day travel itineraries. Most "AI trip planners" are a prompt and a text box. The model's answer is shown as-is, so it often contains invented hotels, wrong coordinates and made-up prices.

📍 Geographically accurate — every activity is independently geocoded and cross-checked; the LLM's own guessed coordinates are never trusted

💰 Financially realistic — costs are per-person × group size, no LLM math hallucinations

🖼️ Visually enriched — real category-matched photos (hotel/restaurant/temple/etc.) fetched via Pexels for every activity

⚡ Blazing fast — Groq's custom LPU chips deliver ~1-3 second AI inference, with rate-limit-safe concurrent enrichment on top
Voyager treats the LLM as an untrusted planner and puts a verification pipeline behind it:

v2.1 — Replaced Nominatim/Wikipedia enrichment with a verified LocationIQ + Pexels pipeline, after discovering (through real production debugging) that free geocoders can silently return wrong-but-plausible matches. See Engineering Deep Dive for how that was found and fixed.
| Promise | How Voyager delivers it |
|---|---|
| 📍 Geographically honest | Every activity is geocoded independently with LocationIQ. The coordinates the LLM returns are discarded. Each match is checked against the returned address text and against a distance limit from the destination. |
| 💰 Numbers that add up | The LLM only returns a per-person cost. The UI does the maths (cost × travelers), so the model never does arithmetic. |
| 🖼️ Relevant visuals | Pexels photos are matched to the activity category (hotel, temple, market…) and fetched once per category, not once per card. |
| ⚡ Fast and resilient | Groq inference returns in a few seconds. If one model is rate-limited or returns bad JSON, the next model in the chain takes over. |

<br />
> **v2.1** replaced Nominatim and Wikipedia enrichment with a verified LocationIQ + Pexels pipeline. The reason: free geocoders can silently return *wrong-but-plausible* matches. See the [Engineering Deep Dive](#-engineering-deep-dive).

✨ Features

<table>
<tr>
<td width="50%">

🧠 Multi-Model Fallback Chain

Cascades through Groq-hosted models automatically. Rate-limited or malformed output? The next model in the chain picks up — zero downtime.

📍 Verified Geocoding, Not Guessed

Every activity is geocoded via LocationIQ, cross-checked against the returned address text, and sanity-checked for distance — the LLM's own invented coordinates are always discarded and replaced with a real lookup.

🗺️ Interactive Leaflet Maps

Rendered on CartoDB's free production tile service. Click a card → map flies to that location with smooth animation.

</td>
<td width="50%">
- **🧭 Complete "everything included" itineraries.** Every day has a hotel check-in, breakfast, lunch, dinner and 2–3 sightseeing stops. They are grouped by neighbourhood to keep travel time down.
- **🎛️ Rich trip form.** Destination, budget tier (Low / Standard / Luxury) with a slider up to ₹1,00,000, duration from 1 to 15 days, group presets (Solo, Couple, Friends, Family) with a custom headcount, and vibe chips (Chill, Adventure, Nature, Luxury, Party, Culture) plus your own custom vibes.
- **🧠 Multi-model fallback chain.** Three Groq-hosted models are tried in order, with a per-model timeout, 429 handling and response-shape validation.
- **📌 Verified map pins.** Leaflet map on CartoDB tiles. Click a card and the map flies to that place. Click a marker and the matching card opens.
- **🖼️ Category-matched photos.** Real Pexels photos, with a fallback image if a lookup fails.
- **🔄 Smart replan, with no extra API call.** Reshape any single day by **time**, **budget** or **energy**. Removed activities are greyed out with a reason.
- **🖨️ One-click PDF.** *Download PDF* uses a dedicated print layout. It shows a clean itinerary with per-person-times-group costs, without the map or UI chrome.
- **📱 Responsive.** On mobile the map moves to the top and the form collapses to a single column.
- **🎬 Polished UX.** Animated landing page, live trip preview while you fill the form, and an animated loading screen.

⚡ Rate-Limit-Safe Enrichment

All geocoding calls pass through a shared global rate limiter, so batched/concurrent requests never exceed the free-tier API limits — no silent failures, no rate-limit cascades.

🖼️ Category-Matched Images

Images are fetched once per category (hotel, restaurant, temple, market, etc.) via Pexels and reused across matching activities — real, relevant photos instead of random stock images.

🔄 Smart Replan Engine

Reshuffle any day by Time, Budget, or Energy constraints. Client-side optimizer — no extra API call needed.

🏗️ How it works

flowchart TD
    U([👤 User]) --> F["TripForm<br/>React + Vite"]
    F -->|"POST /api/generate"| S["Express API<br/>Vercel serverless"]

    subgraph LLM["1️⃣ Plan: Groq fallback chain"]
        direction LR
        M1["gpt-oss-120b"] -->|"429 / error / bad JSON"| M2["qwen3.6-27b"] -->|"429 / error / bad JSON"| M3["gpt-oss-20b"]
    end
    S --> LLM

    LLM -->|"itinerary JSON<br/>(coords untrusted)"| E

    subgraph E["2️⃣ Verify and enrich"]
        direction TB
        C["Destination centre<br/>LocationIQ city= query, highest importance"]
        G["Per-activity geocode<br/>bounded viewbox, word-overlap check, distance check"]
        P["Category images<br/>Pexels, one lookup per category"]
        Q[("Global rate limiter<br/>550 ms between LocationIQ calls")]
        C --> G
        G --- Q
    end

    E -->|"verified trip JSON"| R["TripResult<br/>cards + Leaflet map"]
    R --> RP["Client-side replan<br/>time / budget / energy"]
    R --> PDF["Print to PDF"]

</td>
</tr>
</table>
**Request lifecycle** (`POST /api/generate`):

<br />
1. **Validate** the input (`location` and `days` are required) and check that `GROQ_API_KEY` exists.
2. **Prompt** a Groq model with strict realism rules: real places only, per-person costs, a specific `area`, and a `category` from a fixed list. If the model isn't confident a business exists, it must describe it generically instead of inventing a name.
3. **Fall back** through the model chain until one returns valid JSON with a non-empty `itinerary`.
4. **Resolve the destination centre** using a structured `city=` LocationIQ query.
5. **Enrich**: fetch category images, then geocode every activity in small batches through the shared rate limiter.
6. **Respond** with the verified trip. If enrichment fails partway, the trip is still returned with whatever was enriched.

🛠️ Tech Stack

<table>
<tr>
<td align="center" width="25%">

🎨 Frontend

</td>
<td align="center" width="25%">

⚙️ Backend

</td>
<td align="center" width="25%">

🤖 AI / Data

</td>
<td align="center" width="25%">

🚀 Deploy

</td>
</tr>
<tr>
<td>

React 18<br/>
React Router v6<br/>
Leaflet.js<br/>
Tailwind CSS v4<br/>
Vite<br/>
Axios

</td>
<td>

Node.js<br/>
Express.js<br/>
CORS<br/>
dotenv

</td>
<td>

Groq Cloud API<br/>
LocationIQ (geocoding)<br/>
Pexels API (images)<br/>
CartoDB (map tiles)

</td>
<td>

Vercel (Frontend)<br/>
Vercel Serverless (Backend)

</td>
</tr>
</table>

<br />
| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router v6, Vite 5, Axios, Leaflet + React-Leaflet, hand-written CSS |
| **Backend** | Node.js, Express 4, CORS, dotenv, native `fetch` with `AbortController` timeouts |
| **AI** | [Groq Cloud](https://console.groq.com) (`openai/gpt-oss-120b` → `qwen/qwen3.6-27b` → `openai/gpt-oss-20b`) |
| **Data APIs** | [LocationIQ](https://locationiq.com) (geocoding), [Pexels](https://www.pexels.com/api) (images), CartoDB (map tiles) |
| **Deployment** | Vercel (static frontend + `@vercel/node` serverless backend) |

📁 Project Structure

Voyager-Node-FInal/
│
├── client/                        # ⚛️ React + Vite Frontend
├── client/                          # ⚛️ React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── TripForm.jsx       # Planning form (destination, budget, vibes)
│   │   │   ├── TripResult.jsx     # Itinerary dashboard + map + replan
│   │   │   ├── Loading.jsx        # Animated loading screen
│   │   │   ├── load.css           # Dashboard & loader styles
│   │   │   └── voyager-logo.png   # Brand logo
│   │   ├── App.jsx                # React Router setup
│   │   ├── main.jsx               # Entry point
│   │   └── index.css              # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── postcss.config.mjs
│   │   │   ├── TripForm.jsx         # Landing page + planner form (vibes, budget, travelers)
│   │   │   ├── Loading.jsx          # Animated "Designing Your Trip" screen
│   │   │   ├── TripResult.jsx       # Day tabs, cards, Leaflet map, replan modal, print layout
│   │   │   ├── load.css             # Dashboard, loader, modal and @media print styles
│   │   │   └── voyager-logo.png     # Brand logo
│   │   ├── App.jsx                  # Routes: /  →  /loading  →  /result
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global reset
│   ├── index.html                   # Loads Poppins + Leaflet CSS
│   ├── vite.config.js               # Dev server with /api proxy to :3000
│   └── package.json
│
├── server/                        # 🟢 Node.js + Express Backend
│   ├── index.js                   # API routes + AI chain + geocoding/image enrichment
│   ├── vercel.json                # Vercel serverless config
├── server/                          # 🟢 Express backend (single file)
│   ├── index.js                     # Routes, Groq chain, geocoding, images, rate limiter
│   ├── vercel.json                  # Routes every request to index.js via @vercel/node
│   └── package.json
│
├── package.json                   # Root monorepo scripts
├── drizzle.config.json
├── eslint.config.mjs
├── package.json                     # Root scripts: build (client), start (server)
├── drizzle.config.json              # ⚠️ Unused starter leftover (no database in the app)
├── eslint.config.mjs                # ⚠️ Unused starter leftover (Next.js preset)
└── .gitignore

⚙️ Quick Start

Prerequisites

Requirement

Details

🟢 Node.js

v18 or higher

📦 npm

v9 or higher

🔑 Groq API Key

Free at console.groq.com

🔑 LocationIQ API Key

Free at locationiq.com (5,000 req/day free tier)

🔑 Pexels API Key

Free at pexels.com/api

Requirement

Notes

---

---

Node.js

v18+ (the server relies on the built-in global fetch)

npm

v9+

Groq API key

Free at console.groq.com. Required.

LocationIQ key

Free tier at locationiq.com. Optional but recommended: without it, pins are missing.

Pexels key

Free at pexels.com/api. Optional: without it, every card gets the fallback image.

1️⃣ Clone

1. Clone

git clone https://github.com/Siva2583/Voyager-Node-FInal.git
cd Voyager-Node-FInal

2️⃣ Backend Setup

2. Start the backend

cd server

Create server/.env:

GROQ_API_KEY=your_groq_api_key_here
LOCATIONIQ_KEY=your_locationiq_api_key_here
PEXELS_API_KEY=your_pexels_api_key_here
PORT=3001
GROQ_API_KEY=your_groq_api_key
LOCATIONIQ_KEY=your_locationiq_api_key
PEXELS_API_KEY=your_pexels_api_key
PORT=3000

npm start
npm start        # → Voyager server running on port 3000

3️⃣ Frontend Setup

Quick check: curl http://localhost:3000/api/health should return {"ok":true}.

3. Start the frontend

In a second terminal:

cd client

Create client/.env:

VITE_API_URL=http://localhost:3001
VITE_API_URL=http://localhost:3000

npm run dev
npm run dev      # → http://localhost:5173

4️⃣ Open

ℹ️ VITE_API_URL is required. The form calls ${VITE_API_URL}/api/generate directly. The /api proxy in vite.config.js targets port 3000. If you change the backend PORT, update both places.

Navigate to http://localhost:5173 and start planning! 🎉

4. Plan a trip 🎉

⚠️ Deploying to Vercel? Environment variables set locally in .env do not carry over automatically — add GROQ_API_KEY, LOCATIONIQ_KEY, and PEXELS_API_KEY separately in the Vercel Dashboard under Project → Settings → Environment Variables, then redeploy.
Open http://localhost:5173, click Start Journey, fill in the form and hit Build My Journey. Generation usually takes a few seconds for the LLM, plus geocoding time that grows with the number of activities (see rate limiting).

<br />
### Root scripts

Command (repo root)

What it does

npm run build

Installs client deps and builds the frontend (client/dist)

npm start

Runs node server/index.js

<br />
---

🔐 Environment Variables

Variable

File

Description

GROQ_API_KEY

server/.env

Groq Cloud API key (get one free)

LOCATIONIQ_KEY

server/.env

LocationIQ geocoding key (get one free)

PEXELS_API_KEY

server/.env

Pexels image search key (get one free)

PORT

server/.env

Backend port (default: 3000)

VITE_API_URL

client/.env

Backend URL for API requests

Variable

Where

Required

Description

---

---

---

---

GROQ_API_KEY

server/.env

✅

Groq Cloud key. Without it, /api/generate returns 500 GROQ_API_KEY not configured.

LOCATIONIQ_KEY

server/.env

⚠️ Recommended

Enables geocoding. If missing, geocoding is skipped and activities get no coords.

PEXELS_API_KEY

server/.env

⚠️ Recommended

Enables category photos. If missing, every activity gets a fixed fallback photo.

PORT

server/.env

❌

Backend port (default 3000).

VITE_API_URL

client/.env (or Vercel env)

✅

Base URL of the backend, with no trailing slash.

<br />
Never commit `.env` files. They are already covered by `.gitignore`.

📡 API Reference

GET /api/health

Health check
Base URL: http://localhost:3000 locally, or your deployed server.

{ "ok": true }

GET /

Returns { "status": "Voyager API running" }.

GET /api/health

Health check. Returns { "ok": true }.

POST /api/generate

Generate a complete travel itinerary
Generates a complete, verified itinerary.

Request body

{
  "location": "Goa",
}

Field

Type

Required

Description

location

string

✅

Destination (e.g. "Goa", "Manali")

days

number

✅

Trip duration in days

people

number

✅

Travelers count as u wish

budget_tier

string

✅

"Low Budget" | "Standard" | "Luxury"

total_budget

number

✅

Total budget in INR

Field

Type

Required

Default

Description

---

---

---

---

---

location

string

✅

—

Destination, e.g. "Goa", "Manali"

days

number

✅

—

Trip length in days

people

number

❌

1

Number of travelers

budget_tier

string

❌

"Medium"

The UI sends "Low Budget", "Standard" or "Luxury"

total_budget

number

❌

"Flexible"

Total group budget in INR

The form also sends a vibe array. The server currently does not read it (see Known Limitations).

Response 200

{
  "trip_name": "Authentic Journey: Goa",
          "place": "Baga Beach",
          "area": "Baga, North Goa",
          "category": "sightseeing",
          "desc": "Pro-tip: Visit before 9 AM to avoid crowds.",
          "desc": "Pro-tip: visit before 9 AM to avoid crowds.",
          "cost": 0,
          "duration": 90,
          "priority": "high",
          "energy": "low",
          "coords": [15.5573721, 73.7509800],
          "coords": [15.5573721, 73.75098],
          "image": "https://images.pexels.com/photos/..."
        }
      ]
}

area and category are generated by the LLM and used server-side to improve geocoding precision and image relevance — they're kept in the response for transparency but the coords and image fields are always independently verified, never taken from the LLM directly.

Activity field

Notes

cost

Per person, in INR. The UI multiplies by the traveler count.

category

One of hotel, restaurant, sightseeing, temple, market, transport. Drives image selection.

area

Neighbourhood or locality. Used to sharpen geocoding.

priority / energy

high / medium / low. Used by the replan engine.

coords

[lat, lon], always set by the server, never by the LLM. If a place can't be verified it falls back to the destination centre.

image

Pexels URL matched to the category.

<br />
**Errors**

Status

Body

Cause

400

{"error":"location and days are required"}

Missing input

500

{"error":"GROQ_API_KEY not configured"}

Server misconfigured

500

{"error":"Service busy. Try again."}

Every model in the chain failed or was rate-limited

Diagnostic endpoints

Endpoint

Purpose

GET /api/debug-env

Reports which API keys are configured (booleans only, never the values).

GET /api/debug-geocode?place=…&area=…&location=…

Runs the geocoder for one place and returns the destination centre, resolved coordinates and distance.

These helped debug production geocoding. Consider disabling or protecting them in a public deployment, because they can spend your LocationIQ quota.

<br />
## 🔄 Replan Engine

Replanning runs entirely in the browser using the metadata already in the response. There are no extra API calls and the result is instant.

Mode

Rule

⏱ Less Time

Sorts the day by priority (high → low) and keeps activities until a 6-hour (360 min) budget is used. The rest are marked Not enough time.

💰 Lower Budget

Removes low-priority items costing over ₹500 and medium-priority items over ₹2,000 (group total). Reason: Budget saving.

😴 Low Energy

Removes every energy: "high" activity. Reason: Too tiring.

Removed activities are greyed out, drop off the map and are left out of the PDF.

🧠 Engineering Deep Dive

This section covers the real production issues found and fixed, not just the intended design — the debugging process here is arguably the most interview-relevant part of the project.
The pipeline in server/index.js exists because of real bugs found in production. Here are the problems and how each was fixed.

1. Never trust the LLM's own coordinates

1. Never trust the LLM's coordinates

❌ Problem: Early versions asked the LLM to also output coords for each activity as a placeholder. It turns out the model happily fabricates plausible-looking coordinates (a hotel, a fort, and a restaurant all within ~100m of each other) — and because they weren't exactly [0,0], the code treated them as "already valid" and skipped geocoding entirely.
Problem: Early versions asked the model for coords. It made up plausible numbers (a hotel, a fort and a restaurant all within ~100 m of each other). Because they weren't [0, 0], the code treated them as valid and skipped geocoding.

✅ Solution: Coordinates from the LLM are never trusted. Every activity is independently geocoded, every time — the model's own numbers are discarded.
Fix: The model's coordinates are ignored on purpose. Every activity is looked up for real.

```js
async function geocodeActivity(activity, locationContext, destinationCenter) {
  // LLM-provided coords are ignored on purpose — always verify for real
  const geocoded = await geocodePlace(activity.place, activity.area, locationContext, destinationCenter);
}

2. Word-overlap validation against fuzzy geocoding matches

2. Word-overlap validation against fuzzy matches

❌ Problem: Free geocoders do fuzzy text matching, not exact lookups. Searching "Shree Mangueshi Temple" once returned a real place 23km away in the wrong direction — confidently, with no error, just the wrong answer.
Problem: Free geocoders do fuzzy matching. Searching "Shree Mangueshi Temple" once returned a real place 23 km away, with no error.

✅ Solution: Every geocode result's returned address text (display_name) is checked for actual word overlap with the place name being searched. Zero overlap → the match is rejected as low-confidence and falls back to an honest city-center pin instead of a confidently wrong one.
Fix: The top result's display_name must share at least one meaningful word (4 or more characters) with the place name. Otherwise the match is rejected as low confidence.

```js
function nameOverlapsResult(placeName, displayName) {
  const placeWords = normalizeWords(placeName);
  const resultWords = new Set(normalizeWords(displayName));
  if (placeWords.length === 0) return true;
  return placeWords.some((w) => resultWords.has(w));
}

3. Destination-center resolution had to be structured, not free-text

3. Structured destination-centre lookup

❌ Problem: A trip to "Goa" once resolved its reference point to a random hamlet also named "Goa" — in Himachal Pradesh, 1,500km away. A trip to "Kurnool" resolved to the district boundary centroid instead of the city itself.
Problem: A trip to "Goa" once anchored to a hamlet named Goa in Himachal Pradesh, 1,500 km away. "Kurnool" resolved to the district centroid instead of the city.

✅ Solution: Structured city= queries instead of free text, plus picking the highest-importance result among several candidates instead of blindly trusting the first one returned.
Fix: Use a structured city= query (country-scoped) and pick the highest-importance result of up to five, with a free-text fallback.

```js
function pickMostImportant(results) {
  return results.reduce((best, r) =>
    parseFloat(r.importance || 0) > parseFloat(best.importance || 0) ? r : best
  );
    parseFloat(r.importance || 0) > parseFloat(best.importance || 0) ? r : best);
}

4. A global rate limiter, because retries can silently reintroduce the exact bug they're fixing

4. One global rate limiter, because retries can reintroduce the bug they fix

❌ Problem: Adding a smarter retry strategy (try with area, then without) meant each activity could fire up to 4 geocoding requests. With activities processed in small concurrent batches, that briefly burst past LocationIQ's free-tier rate limit — and nearly everything started silently falling back to the city center again, undoing earlier fixes without any code being "wrong" in isolation.
Problem: A smarter retry strategy meant each activity could fire up to 3 geocoding requests. Concurrent batches briefly burst past LocationIQ's free-tier limit, and most pins silently fell back to the city centre. Each piece was correct on its own, but together they undid earlier fixes.

✅ Solution: One shared queue that every LocationIQ call passes through, regardless of retries or batch concurrency, spacing real network calls at a safe fixed interval:
Fix: A single promise queue that every LocationIQ call passes through. It spaces real network calls by 550 ms no matter how many callers there are.

```js
let locationIqQueue = Promise.resolve();
function withLocationIqRateLimit(fn) {
  const run = locationIqQueue.then(() => fn());
}

5. Layered geocoding attempts with a safety net

5. Multi-Model Fallback Chain

For each activity the server tries, in order:

❌ Problem: Single model fails when rate-limited → entire app goes down.

place, area, destination, bounded to a ~150 km viewbox around the destination centre

place, destination, bounded

place, destination, unbounded

✅ Solution: Auto-cascading through a chain of Groq-hosted models — if one is rate-limited or errors, the next picks up automatically, with no downtime.
A result is accepted only if it passes the word-overlap check and lies within 150 km of the destination centre (Haversine). Otherwise the pin falls back to the destination centre, which is a pin that is honestly vague instead of confidently wrong.

6. Multi-model fallback chain

6. LLM Output Safety (JSON parsing)

Problem: A single model being rate-limited takes the whole app down.

❌ Problem: LLMs can return markdown fences, conversational preambles, or malformed JSON.
Fix: gpt-oss-120b → qwen3.6-27b → gpt-oss-20b. A model is skipped on HTTP 429, other HTTP errors, a timeout (20 s), an empty body, unparseable JSON, or a response without a non-empty itinerary array.

✅ Solution: Layered defense — an explicit system prompt instruction, Groq's native json_object response mode, server-side markdown-fence stripping, and a shape check (Array.isArray(parsed.itinerary)) before the result is ever trusted.

7. LLM output safety

A layered defence: a system prompt demanding JSON only, Groq's json_object response mode, temperature: 0.1, stripping of stray Markdown fences, and a shape check before anything is trusted. The prompt also tells the model to describe a business generically if it isn't sure it exists ("A local tiffin centre near Bandar Road"), because vaguely correct beats specifically wrong.

7. Client-Side Smart Replanning

8. Image strategy

❌ Problem: Re-calling the AI for every small tweak to a day's plan is slow and wastes API calls.
Images are resolved per category, not per activity. An activity.category maps to a curated Pexels query. Unknown categories fall back to keyword matching on the name and description (temple|mandir, fort|palace, beach, …). Identical queries are de-duplicated, fetched in parallel, and shared across cards. That means fewer API calls, consistent visuals and no stray, unrelated stock photos.

✅ Solution: A client-side optimizer that reshuffles activities by time, budget, or energy constraints using metadata already in the response — zero extra API calls.

9. Client-side replanning

<br />
Re-calling the AI for small tweaks is slow and costly. The response carries `priority`, `energy`, `duration` and `cost` per activity, so the client can optimise locally. See [Replan Engine](#-replan-engine).

<br />
## 🚀 Deployment

🧭 Known Limitations

Voyager is set up for Vercel. The backend ships a vercel.json that routes every request to index.js through @vercel/node. The frontend is a standard Vite static build.

Being upfront about what's still imperfect, rather than hiding it:
The simplest setup is two Vercel projects from the same repo:

Small, generically-named local businesses (a specific small restaurant or guest house) can occasionally still geocode to the wrong branch/town if a same-named place exists elsewhere in LocationIQ's data and the address text technically overlaps. Major landmarks, well-known hotels, and well-known restaurants are consistently accurate; small/obscure spots are the remaining soft edge.

This is a genuine free-tier data coverage ceiling, not a logic bug — the only stronger fix would be a paid API with real business listing data (e.g. Google Places), which isn't part of this project's budget.
| Project | Root Directory | Build | Environment variables |
|---|---|---|---|
| API | server | Auto (@vercel/node) | GROQ_API_KEY, LOCATIONIQ_KEY, PEXELS_API_KEY |
| Web | client | npm run build → dist | VITE_API_URL = URL of the API project |

<br />
Notes:

Environment variables from local .env files don't carry over. Add them in Project → Settings → Environment Variables and redeploy.

VITE_API_URL is baked in at build time, so redeploy the frontend after changing it.

Client-side routes (/loading, /result) need an SPA rewrite to index.html on the Web project.

Serverless function timeouts: a generation does a 5,500-token LLM call plus rate-limited geocoding (≈0.55 s per lookup, so longer trips take longer). For multi-day trips, check your plan's function duration limit. The client waits up to 100 s.

<br />
## 🧭 Known Limitations

📊 v1 → v2.1 Changelog

This is the honest list of rough edges, so you don't have to find them yourself.



v1 (Python)

v2.0 (Node.js)

v2.1 (Verified pipeline) ✨

Backend

Python + Flask + Gunicorn

Node.js + Express

Node.js + Express

AI Model

Google Gemini Pro

Groq (single model)

Groq multi-model fallback chain

Geocoding

❌ None

Nominatim (unverified)

LocationIQ + word-overlap validation + rate limiting

Images

❌ None

Wikipedia / random stock

Pexels, category-matched, cached per category

Coordinate trust

—

Trusted LLM output

LLM output always discarded, always re-verified

Map tiles

—

Raw OSM tile server (rate-limited in production)

CartoDB production-safe tiles

Concurrency safety

❌

Unbounded parallel requests

Global rate-limited queue

Replanning

❌ Not available

✅ Time / Budget / Energy

✅ Time / Budget / Energy

Deployment

Vercel + Railway (2 services)

Vercel only (serverless)

Vercel only (serverless)

India-first. Geocoding is restricted to countrycodes=in, prompts talk in ₹ INR, and image queries lean "india …". The form's placeholder mentions Kyoto and Paris, but non-Indian destinations will not geocode correctly today.

Small local businesses are the soft edge. A small restaurant or guesthouse can still geocode to a same-named place elsewhere if the address text happens to overlap. Landmarks and well-known hotels are consistently accurate. Fixing the rest properly needs a paid places dataset such as Google Places.

Vibes aren't used yet. The form collects vibes and sends them, but the server prompt doesn't include them.

No persistence. The trip lives in React Router state, so refreshing /result returns you to the form. There are no accounts or saved trips.

Replan is a filter, not a re-optimiser. It hides activities. It doesn't find replacements or re-time the day. "Less Time" also reorders the day by priority.

Geocoding latency scales with trip length. The 550 ms spacing is what keeps pins accurate on the free tier.

Diagnostic endpoints are unauthenticated (see above).

No automated tests or linter config that applies to this codebase yet. eslint.config.mjs and drizzle.config.json are leftovers from a starter template.

<br />
---

🗺️ Roadmap Ideas

Feed the selected vibes into the prompt

Global destinations (country-aware geocoding, multi-currency)

Persist and share trips (shareable links)

Replacement suggestions when an activity is removed during replan

Route lines and travel times between stops on the map

Response caching per (location, days, tier)

Tests for the geocoding helpers (nameOverlapsResult, pickMostImportant, haversineDistanceKm)

<br />
## 📊 Version History

🚀 Deployment



v1 (Python)

v2.0 (Node.js)

v2.1 (verified pipeline) ✨

Backend

Python + Flask + Gunicorn

Node.js + Express

Node.js + Express

AI

Google Gemini Pro

Groq (single model)

Groq multi-model fallback chain

Geocoding

❌ None

Nominatim (unverified)

LocationIQ + overlap + distance validation + rate limiting

Images

❌ None

Wikipedia / random stock

Pexels, category-matched, cached per category

Coordinate trust

—

Trusted LLM output

LLM output always discarded and re-verified

Map tiles

—

Raw OSM tile server

CartoDB tiles

Concurrency safety

❌

Unbounded parallel requests

Global rate-limited queue

Replanning

❌

✅ Time / Budget / Energy

✅ Time / Budget / Energy

Deployment

Vercel + Railway

Vercel only

Vercel only

The project is pre-configured for Vercel:

Push code to GitHub

Import repo in Vercel Dashboard

Add GROQ_API_KEY, LOCATIONIQ_KEY, and PEXELS_API_KEY in Environment Variables (Production scope)

Deploy ✅

🤝 Contributing

The root package.json handles everything:

{
  "build": "cd client && npm install && npm run build",
  "start": "node server/index.js"
}

Issues and PRs are welcome.

<br />
1. Fork the repo and create a branch: `git checkout -b feature/my-idea`
2. Run the backend and frontend locally (see [Quick Start](#-quick-start))
3. Keep changes focused, and explain *why* in the PR description, especially for anything touching the geocoding pipeline
4. Open a pull request

📬 Contact

<div align="center">
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Siva2583)
[![Demo](https://img.shields.io/badge/🎬_Demo_Video-FF0000?style=for-the-badge)](https://www.linkedin.com/posts/siva-charan-kg-72a900284_traveltech-generativeai-llm-ugcPost-7425072513896017920-r3tk)

<br />

If Voyager helped you, drop a ⭐ — it means a lot!

<br />
**If Voyager helped you, drop a ⭐. It means a lot!**

<a href="https://voyager-node-f-inal-fefq.vercel.app/">
