<div align="center">

<img src="https://readme-typing-svg.herokuapp.com?font=Poppins&weight=800&size=45&pause=1000&color=38BDF8&center=true&vCenter=true&width=500&height=70&lines=🌍+VOYAGER+v2.0" alt="Voyager" />

### ⚡ AI-Powered Travel Planner

> **"Stop planning your trips with 50 open tabs."**

[![🚀 Live App](https://img.shields.io/badge/🚀_Live_App-Try_Voyager-F59E0B?style=for-the-badge&logoColor=white)](https://voyager-node-f-inal-fefq.vercel.app/)
[![GitHub](https://img.shields.io/badge/Source_Code-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Siva2583/Voyager-Node-FInal)
[![Demo Video](https://img.shields.io/badge/Demo_Video-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/posts/siva-charan-kg-72a900284_traveltech-generativeai-llm-ugcPost-7425072513896017920-r3tk)

<br />

`React 18` · `Vite` · `Node.js` · `Express` · `Groq AI` · `LLaMA 3.3 70B` · `Leaflet.js` · `Tailwind CSS v4`

<br />

<a href="https://voyager-node-f-inal-fefq.vercel.app/">
  <img src="https://img.shields.io/badge/▶_PLAN_YOUR_TRIP_NOW-FF4444?style=for-the-badge&logoColor=white" alt="Try Now" height="40" />
</a>

</div>

<br />

---

<br />

## 📖 About

Voyager is a **full-stack AI application** that generates personalized, day-by-day travel itineraries. Unlike generic AI wrappers, Voyager combines **intelligent model orchestration** with **real-world data enrichment** to produce trip plans that are:

- 📍 **Geographically accurate** — every activity is geocoded via OpenStreetMap & plotted on an interactive map  
- 💰 **Financially realistic** — costs are per-person × group size, no LLM math hallucinations  
- 🖼️ **Visually enriched** — Wikipedia images fetched for every location automatically  
- ⚡ **Blazing fast** — Groq's custom LPU chips deliver **~1-3 second** AI inference  

> **v2.0** — Complete rewrite from Python/Flask + Gemini → **Node.js/Express + Groq LLaMA 3.3 70B**

<br />

---

<br />

## ✨ Features

<table>
<tr>
<td width="50%">

### 🧠 Multi-Model Fallback Chain
Cascades through **LLaMA 3.3 70B → LLaMA 3.1 8B → Mixtral 8x7B** automatically. Rate-limited? The next model picks up — zero downtime.

### 💸 Strict Budget Enforcement
Every cost is calculated **per-person × group size**. Custom algorithm prevents the AI from producing unrealistic budgets.

### 🗺️ Interactive Leaflet Maps
Activities geocoded via OpenStreetMap Nominatim. Click a card → map **flies** to that location with smooth animation.

</td>
<td width="50%">

### ⚡ Concurrent Data Enrichment
`Promise.allSettled()` fires all Wikipedia image + geocoding requests **in parallel** — ~60% faster than sequential.

### 🔄 Smart Replan Engine
Reshuffle any day by **Time, Budget, or Energy** constraints. Client-side optimizer — **no extra API call** needed.

### 📄 One-Click PDF Export
Print-ready itinerary with all details, costs, and local insider tips — ready to share or take offline.

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
LLaMA 3.3 70B<br/>
Mixtral 8x7B<br/>
Wikipedia API<br/>
OpenStreetMap

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
│   ├── index.js                   # API routes + AI chain + enrichment
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

<br />

---

<br />

## 🔐 Environment Variables

| Variable | File | Description |
|----------|------|-------------|
| `GROQ_API_KEY` | `server/.env` | Groq Cloud API key ([get one free](https://console.groq.com)) |
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
          "desc": "Pro-tip: Visit before 9 AM to avoid crowds.",
          "cost": 0,
          "duration": 90,
          "priority": "high",
          "energy": "low",
          "coords": [15.5553, 73.7514],
          "image": "https://upload.wikimedia.org/..."
        }
      ]
    }
  ]
}
```

<br />

---

<br />

## 🧠 Engineering Deep Dive

### 1. Multi-Model Fallback Chain

**❌ Problem:** Single model fails when rate-limited → entire app goes down.

**✅ Solution:** Auto-cascading through 3 models:

```javascript
const MODEL_CHAIN = [
  'llama-3.3-70b-versatile',    // Primary — best quality
  'llama-3.1-8b-instant',       // Fallback — fast & light
  'mixtral-8x7b-32768'          // Last resort — reliable
];

for (const modelName of MODEL_CHAIN) {
  const res = await fetch(GROQ_URL, { body: JSON.stringify({ model: modelName, ... }) });
  if (res.status === 429) continue;   // Rate-limited → try next
  if (!res.ok) continue;              // Error → try next
  tripData = JSON.parse(result);
  break;                              // ✅ Success!
}
```

---

### 2. Parallel Data Enrichment

**❌ Problem:** Sequential Wikipedia + geocoding = **8-12 second** wait.

**✅ Solution:** `Promise.allSettled()` for **concurrent** enrichment (~60% faster):

```javascript
const enrichPromises = [];

for (const day of tripData.itinerary) {
  for (const activity of day.activities) {
    enrichPromises.push(
      fetchActivityDetails(activity, location)  // Wikipedia img + geocode
    );
  }
}

await Promise.allSettled(enrichPromises);  // 🚀 All fire at once
```

---

### 3. LLM Hallucination Control

**❌ Problem:** LLMs return markdown, conversational text, or broken JSON.

**✅ Solution:** Triple-layer defense:

```javascript
// Layer 1: System prompt
{ role: 'system', content: 'Respond with ONLY valid JSON. No markdown, no code fences.' }

// Layer 2: Groq native JSON mode
response_format: { type: 'json_object' }

// Layer 3: Server-side regex cleanup (just in case)
let clean = content.trim();
if (clean.startsWith('```')) {
  clean = clean.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
}
tripData = JSON.parse(clean);  // ✅ Safe parse
```

---

### 4. Client-Side Smart Replanning

**❌ Problem:** Re-calling AI for every tweak is slow & expensive.

**✅ Solution:** Client-side optimizer using activity metadata — **zero API calls**:

```javascript
// Example: Replan by time constraint
if (replanOption === 'time') {
  let timeSpent = 0;
  const TIME_LIMIT = 360; // 6 hours

  // Keep high-priority activities first
  dayActivities.sort((a, b) => priority[b.priority] - priority[a.priority]);
  
  dayActivities.forEach(activity => {
    if (timeSpent + activity.duration <= TIME_LIMIT) {
      activity.status = 'kept';
      timeSpent += activity.duration;
    } else {
      activity.status = 'removed';
      activity.reason = 'Not enough time';
    }
  });
}
```

<br />

---

<br />

## 📊 v1 → v2 Changelog

| | v1 (Python) | v2 (Node.js) ✨ |
|---|---|---|
| **Backend** | Python + Flask + Gunicorn | Node.js + Express |
| **AI Model** | Google Gemini Pro | Groq LLaMA 3.3 70B |
| **Fallback** | ❌ Single model | ✅ 3-model auto-cascade |
| **Concurrency** | `ThreadPoolExecutor` | `Promise.allSettled()` |
| **JSON Safety** | System prompt only | Prompt + `json_object` + regex |
| **Replanning** | ❌ Not available | ✅ Time / Budget / Energy |
| **Inference** | ~5-8 seconds | **~1-3 seconds** (Groq LPU) |
| **Deployment** | Vercel + Railway (2 services) | Vercel only (serverless) |
| **Styling** | CSS3 inline | Tailwind CSS v4 |

<br />

---

<br />

## 🚀 Deployment

The project is pre-configured for **Vercel**:

1. Push code to GitHub  
2. Import repo in [Vercel Dashboard](https://vercel.com/dashboard)  
3. Add `GROQ_API_KEY` in Environment Variables  
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
