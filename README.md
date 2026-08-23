<div align="center">

<img src="https://readme-typing-svg.herokuapp.com?font=Poppins&weight=800&size=45&pause=1000&color=38BDF8&center=true&vCenter=true&width=500&height=70&lines=🌍+VOYAGER+v2.1" alt="Voyager" />

### ⚡ AI-Powered Travel Planner

> **"Stop planning your trips with 50 open tabs."**

[![🚀 Live App](https://img.shields.io/badge/🚀_Live_App-Try_Voyager-F59E0B?style=for-the-badge&logoColor=white)](https://voyager-node-f-inal-fefq.vercel.app/)
[![GitHub](https://img.shields.io/badge/Source_Code-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Siva2583/Voyager-Node-FInal)
[![Demo Video](https://img.shields.io/badge/Demo_Video-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/posts/siva-charan-kg-72a900284_traveltech-generativeai-llm-ugcPost-7425072513896017920-r3tk)

<br />

`React 18` · `Vite` · `Node.js` · `Express` · `Groq AI` · `LocationIQ` · `Pexels` · `Leaflet.js` · `Tailwind CSS v4`

<br />

<a href="https://voyager-node-f-inal-fefq.vercel.app/">
  <img src="https://img.shields.io/badge/▶_PLAN_YOUR_TRIP_NOW-FF4444?style=for-the-badge&logoColor=white" alt="Try Now" height="40" />
</a>

</div>

<br />

---

<br />

## 📖 About

Voyager is a **full-stack AI application** that generates personalized, day-by-day travel itineraries. Unlike generic AI wrappers, Voyager combines **intelligent model orchestration** with **real-world data verification** to produce trip plans that are:

- 📍 **Geographically accurate** — every activity is independently geocoded and cross-checked; the LLM's own guessed coordinates are never trusted
- 💰 **Financially realistic** — costs are per-person × group size, no LLM math hallucinations
- 🖼️ **Visually enriched** — real category-matched photos (hotel/restaurant/temple/etc.) fetched via Pexels for every activity
- ⚡ **Blazing fast** — Groq's custom LPU chips deliver **~1-3 second** AI inference, with rate-limit-safe concurrent enrichment on top

> **v2.1** — Replaced Nominatim/Wikipedia enrichment with a verified LocationIQ + Pexels pipeline, after discovering (through real production debugging) that free geocoders can silently return wrong-but-plausible matches. See [Engineering Deep Dive](#-engineering-deep-dive) for how that was found and fixed.

<br />

---

<br />

## ✨ Features

<table>
<tr>
<td width="50%">

### 🧠 Multi-Model Fallback Chain
Cascades through Groq-hosted models automatically. Rate-limited or malformed output? The next model in the chain picks up — zero downtime.

### 📍 Verified Geocoding, Not Guessed
Every activity is geocoded via **LocationIQ**, cross-checked against the returned address text, and sanity-checked for distance — the LLM's own invented coordinates are always discarded and replaced with a real lookup.

### 🗺️ Interactive Leaflet Maps
Rendered on CartoDB's free production tile service. Click a card → map **flies** to that location with smooth animation.

</td>
<td width="50%">

### ⚡ Rate-Limit-Safe Enrichment
All geocoding calls pass through a shared global rate limiter, so batched/concurrent requests never exceed the free-tier API limits — no silent failures, no rate-limit cascades.

### 🖼️ Category-Matched Images
Images are fetched **once per category** (hotel, restaurant, temple, market, etc.) via Pexels and reused across matching activities — real, relevant photos instead of random stock images.

### 🔄 Smart Replan Engine
Reshuffle any day by **Time, Budget, or Energy** constraints. Client-side optimizer — **no extra API call** needed.

</td>
</tr>
</table>

<br />

---

<br />

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="25%">

**🎨 Frontend**

</td>
<td align="center" width="25%">

**⚙️ Backend**

</td>
<td align="center" width="25%">

**🤖 AI / Data**

</td>
<td align="center" width="25%">

**🚀 Deploy**

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

---

<br />

## 📁 Project Structure

```
Voyager-Node-FInal/
│
├── client/                        # ⚛️ React + Vite Frontend
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
│   └── package.json
│
├── server/                        # 🟢 Node.js + Express Backend
│   ├── index.js                   # API routes + AI chain + geocoding/image enrichment
│   ├── vercel.json                # Vercel serverless config
│   └── package.json
│
├── package.json                   # Root monorepo scripts
├── drizzle.config.json
├── eslint.config.mjs
└── .gitignore
```

<br />

---

<br />

## ⚙️ Quick Start

### Prerequisites

| Requirement | Details |
|------------|---------|
| 🟢 Node.js | v18 or higher |
| 📦 npm | v9 or higher |
| 🔑 Groq API Key | Free at [console.groq.com](https://console.groq.com) |
| 🔑 LocationIQ API Key | Free at [locationiq.com](https://locationiq.com) (5,000 req/day free tier) |
| 🔑 Pexels API Key | Free at [pexels.com/api](https://www.pexels.com/api) |

### 1️⃣ Clone

```bash
git clone https://github.com/Siva2583/Voyager-Node-FInal.git
cd Voyager-Node-FInal
```

### 2️⃣ Backend Setup

```bash
cd server
npm install
```

Create `server/.env`:
```env
GROQ_API_KEY=your_groq_api_key_here
LOCATIONIQ_KEY=your_locationiq_api_key_here
PEXELS_API_KEY=your_pexels_api_key_here
PORT=3001
```

```bash
npm start
```

### 3️⃣ Frontend Setup

```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:3001
```

```bash
npm run dev
```

### 4️⃣ Open

Navigate to **`http://localhost:5173`** and start planning! 🎉

> ⚠️ **Deploying to Vercel?** Environment variables set locally in `.env` do **not** carry over automatically — add `GROQ_API_KEY`, `LOCATIONIQ_KEY`, and `PEXELS_API_KEY` separately in the Vercel Dashboard under Project → Settings → Environment Variables, then redeploy.

<br />

---

<br />

## 🔐 Environment Variables

| Variable | File | Description |
|----------|------|-------------|
| `GROQ_API_KEY` | `server/.env` | Groq Cloud API key ([get one free](https://console.groq.com)) |
| `LOCATIONIQ_KEY` | `server/.env` | LocationIQ geocoding key ([get one free](https://locationiq.com)) |
| `PEXELS_API_KEY` | `server/.env` | Pexels image search key ([get one free](https://www.pexels.com/api)) |
| `PORT` | `server/.env` | Backend port (default: `3000`) |
| `VITE_API_URL` | `client/.env` | Backend URL for API requests |

<br />

---

<br />

## 📡 API Reference

### `GET /api/health`
> Health check

```json
{ "ok": true }
```

### `POST /api/generate`
> Generate a complete travel itinerary

**Request:**
```json
{
  "location": "Goa",
  "days": 3,
  "people": 2,
  "budget_tier": "Standard",
  "total_budget": 40000
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `location` | string | ✅ | Destination (e.g. `"Goa"`, `"Manali"`) |
| `days` | number | ✅ | Trip duration in days |
| `people` | number | ✅ | Travelers count as u wish |
| `budget_tier` | string | ✅ | `"Low Budget"` \| `"Standard"` \| `"Luxury"` |
| `total_budget` | number | ✅ | Total budget in INR |

**Response:**
```json
{
  "trip_name": "Authentic Journey: Goa",
  "total_budget": "Total for 2 travelers",
  "itinerary": [
    {
      "day": 1,
      "activities": [
        {
          "id": "goa_d1_a1",
          "time": "08:00 AM",
          "place": "Baga Beach",
          "area": "Baga, North Goa",
          "category": "sightseeing",
          "desc": "Pro-tip: Visit before 9 AM to avoid crowds.",
          "cost": 0,
          "duration": 90,
          "priority": "high",
          "energy": "low",
          "coords": [15.5573721, 73.7509800],
          "image": "https://images.pexels.com/photos/..."
        }
      ]
    }
  ]
}
```

`area` and `category` are generated by the LLM and used server-side to improve geocoding precision and image relevance — they're kept in the response for transparency but the `coords` and `image` fields are always independently verified, never taken from the LLM directly.

<br />

---

<br />

## 🧠 Engineering Deep Dive

This section covers the real production issues found and fixed, not just the intended design — the debugging process here is arguably the most interview-relevant part of the project.

### 1. Never trust the LLM's own coordinates

**❌ Problem:** Early versions asked the LLM to also output `coords` for each activity as a placeholder. It turns out the model happily fabricates plausible-looking coordinates (a hotel, a fort, and a restaurant all within ~100m of each other) — and because they weren't exactly `[0,0]`, the code treated them as "already valid" and **skipped geocoding entirely**.

**✅ Solution:** Coordinates from the LLM are never trusted. Every activity is independently geocoded, every time — the model's own numbers are discarded.

```javascript
async function geocodeActivity(activity, locationContext, destinationCenter) {
  // LLM-provided coords are ignored on purpose — always verify for real
  const geocoded = await geocodePlace(activity.place, activity.area, locationContext, destinationCenter);
  activity.coords = geocoded || destinationCenter || null;
  return activity;
}
```

---

### 2. Word-overlap validation against fuzzy geocoding matches

**❌ Problem:** Free geocoders do fuzzy text matching, not exact lookups. Searching "Shree Mangueshi Temple" once returned a real place 23km away in the wrong direction — confidently, with no error, just the wrong answer.

**✅ Solution:** Every geocode result's returned address text (`display_name`) is checked for actual word overlap with the place name being searched. Zero overlap → the match is rejected as low-confidence and falls back to an honest city-center pin instead of a confidently wrong one.

```javascript
function nameOverlapsResult(placeName, displayName) {
  const placeWords = normalizeWords(placeName);
  const resultWords = new Set(normalizeWords(displayName));
  return placeWords.some((w) => resultWords.has(w));
}
```

---

### 3. Destination-center resolution had to be structured, not free-text

**❌ Problem:** A trip to "Goa" once resolved its reference point to a random hamlet also named "Goa" — in Himachal Pradesh, 1,500km away. A trip to "Kurnool" resolved to the *district* boundary centroid instead of the city itself.

**✅ Solution:** Structured `city=` queries instead of free text, plus picking the highest-`importance` result among several candidates instead of blindly trusting the first one returned.

```javascript
function pickMostImportant(results) {
  return results.reduce((best, r) =>
    parseFloat(r.importance || 0) > parseFloat(best.importance || 0) ? r : best
  );
}
```

---

### 4. A global rate limiter, because retries can silently reintroduce the exact bug they're fixing

**❌ Problem:** Adding a smarter retry strategy (try with area, then without) meant each activity could fire up to 4 geocoding requests. With activities processed in small concurrent batches, that briefly burst past LocationIQ's free-tier rate limit — and nearly everything started silently falling back to the city center again, undoing earlier fixes without any code being "wrong" in isolation.

**✅ Solution:** One shared queue that every LocationIQ call passes through, regardless of retries or batch concurrency, spacing real network calls at a safe fixed interval:

```javascript
let locationIqQueue = Promise.resolve();
function withLocationIqRateLimit(fn) {
  const run = locationIqQueue.then(() => fn());
  locationIqQueue = run.catch(() => {}).then(() => sleep(550));
  return run;
}
```

---

### 5. Multi-Model Fallback Chain

**❌ Problem:** Single model fails when rate-limited → entire app goes down.

**✅ Solution:** Auto-cascading through a chain of Groq-hosted models — if one is rate-limited or errors, the next picks up automatically, with no downtime.

---

### 6. LLM Output Safety (JSON parsing)

**❌ Problem:** LLMs can return markdown fences, conversational preambles, or malformed JSON.

**✅ Solution:** Layered defense — an explicit system prompt instruction, Groq's native `json_object` response mode, server-side markdown-fence stripping, and a shape check (`Array.isArray(parsed.itinerary)`) before the result is ever trusted.

---

### 7. Client-Side Smart Replanning

**❌ Problem:** Re-calling the AI for every small tweak to a day's plan is slow and wastes API calls.

**✅ Solution:** A client-side optimizer that reshuffles activities by time, budget, or energy constraints using metadata already in the response — zero extra API calls.

<br />

---

<br />

## 🧭 Known Limitations

Being upfront about what's still imperfect, rather than hiding it:

- **Small, generically-named local businesses** (a specific small restaurant or guest house) can occasionally still geocode to the wrong branch/town if a same-named place exists elsewhere in LocationIQ's data and the address text technically overlaps. Major landmarks, well-known hotels, and well-known restaurants are consistently accurate; small/obscure spots are the remaining soft edge.
- This is a genuine free-tier data coverage ceiling, not a logic bug — the only stronger fix would be a paid API with real business listing data (e.g. Google Places), which isn't part of this project's budget.

<br />

---

<br />

## 📊 v1 → v2.1 Changelog

| | v1 (Python) | v2.0 (Node.js) | v2.1 (Verified pipeline) ✨ |
|---|---|---|---|
| **Backend** | Python + Flask + Gunicorn | Node.js + Express | Node.js + Express |
| **AI Model** | Google Gemini Pro | Groq (single model) | Groq multi-model fallback chain |
| **Geocoding** | ❌ None | Nominatim (unverified) | **LocationIQ + word-overlap validation + rate limiting** |
| **Images** | ❌ None | Wikipedia / random stock | **Pexels, category-matched, cached per category** |
| **Coordinate trust** | — | Trusted LLM output | **LLM output always discarded, always re-verified** |
| **Map tiles** | — | Raw OSM tile server (rate-limited in production) | **CartoDB production-safe tiles** |
| **Concurrency safety** | ❌ | Unbounded parallel requests | **Global rate-limited queue** |
| **Replanning** | ❌ Not available | ✅ Time / Budget / Energy | ✅ Time / Budget / Energy |
| **Deployment** | Vercel + Railway (2 services) | Vercel only (serverless) | Vercel only (serverless) |

<br />

---

<br />

## 🚀 Deployment

The project is pre-configured for **Vercel**:

1. Push code to GitHub
2. Import repo in [Vercel Dashboard](https://vercel.com/dashboard)
3. Add `GROQ_API_KEY`, `LOCATIONIQ_KEY`, and `PEXELS_API_KEY` in Environment Variables (Production scope)
4. Deploy ✅

The root `package.json` handles everything:
```json
{
  "build": "cd client && npm install && npm run build",
  "start": "node server/index.js"
}
```

<br />

---

<br />

## 📬 Contact

<div align="center">

**Built by [Siva Charan KG](https://www.linkedin.com/in/siva-charan-kg-72a900284)**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/siva-charan-kg-72a900284)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Siva2583)
[![Demo](https://img.shields.io/badge/🎬_Demo_Video-FF0000?style=for-the-badge)](https://www.linkedin.com/posts/siva-charan-kg-72a900284_traveltech-generativeai-llm-ugcPost-7425072513896017920-r3tk)

<br />

**If Voyager helped you, drop a ⭐ — it means a lot!**

<br />

<a href="https://voyager-node-f-inal-fefq.vercel.app/">
  <img src="https://img.shields.io/badge/🚀_TRY_VOYAGER_NOW-F59E0B?style=for-the-badge" alt="Try Voyager" height="35" />
</a>

</div>
