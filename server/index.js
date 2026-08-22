const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'Voyager API running' });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function haversineDistanceKm([lat1, lon1], [lat2, lon2]) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function buildViewbox([lat, lon], spanKm = 40) {
  const latSpan = spanKm / 111;
  const lonSpan = spanKm / (111 * Math.cos((lat * Math.PI) / 180) || 1);
  const lonMin = lon - lonSpan;
  const lonMax = lon + lonSpan;
  const latMin = lat - latSpan;
  const latMax = lat + latSpan;
  return `${lonMin},${latMax},${lonMax},${latMin}`;
}

const LOCATIONIQ_KEY = process.env.LOCATIONIQ_KEY;

async function geocodeDestinationCenter(locationContext) {
  if (!LOCATIONIQ_KEY) return null;
  try {
    const url = `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(locationContext)}&format=json&limit=1`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) return null;

    const data = await response.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (e) {
    console.log('[geocodeDestinationCenter] failed:', e.message);
  }
  return null;
}

async function geocodePlace(placeName, locationContext, destinationCenter) {
  if (!LOCATIONIQ_KEY) return null;
  try {
    const cleanQuery = placeName.split('(')[0].trim();
    const query = `${cleanQuery}, ${locationContext}`;

    let url = `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(query)}&format=json&limit=1`;

    if (destinationCenter) {
      const viewbox = buildViewbox(destinationCenter);
      url += `&viewbox=${viewbox}&bounded=1`;
    }

    let response = await fetchWithTimeout(url);
    let data = response.ok ? await response.json() : null;

    if ((!data || data.length === 0) && destinationCenter) {
      const unboundedUrl = `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(query)}&format=json&limit=1`;
      response = await fetchWithTimeout(unboundedUrl);
      data = response.ok ? await response.json() : null;
    }

    if (data && data.length > 0) {
      const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];

      if (destinationCenter) {
        const distanceKm = haversineDistanceKm(coords, destinationCenter);
        if (distanceKm > 100) {
          return null;
        }
      }

      return coords;
    }
  } catch (e) {
    console.log('[geocodePlace] failed for', placeName, ':', e.message);
  }

  return null;
}

const PEXELS_KEY = process.env.PEXELS_API_KEY;

const CATEGORY_KEYWORDS = [
  { match: /hotel|resort|stay|inn|lodge/i, query: 'hotel room interior' },
  { match: /restaurant|cafe|dhaba|biryani|kitchen|eatery/i, query: 'indian restaurant food' },
  { match: /temple|mandir|shrine/i, query: 'hindu temple architecture' },
  { match: /fort|palace|mahal/i, query: 'indian palace architecture' },
  { match: /beach|coast/i, query: 'india beach coastline' },
  { match: /museum|gallery/i, query: 'museum interior exhibit' },
  { match: /market|bazaar/i, query: 'indian street market' },
  { match: /park|garden/i, query: 'india public garden' }
];

function guessCategoryQuery(placeName, desc) {
  const haystack = `${placeName} ${desc || ''}`;
  for (const entry of CATEGORY_KEYWORDS) {
    if (entry.match.test(haystack)) return entry.query;
  }
  return 'india travel destination';
}

async function fetchPexelsImage(query) {
  if (!PEXELS_KEY) return null;
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
    const response = await fetchWithTimeout(url, {
      headers: { Authorization: PEXELS_KEY }
    });

    if (!response.ok) return null;

    const data = await response.json();
    const photo = data?.photos?.[0];
    return photo?.src?.large || photo?.src?.medium || null;
  } catch (e) {
    console.log('[fetchPexelsImage] failed for', query, ':', e.message);
  }
  return null;
}

async function fetchActivityImage(activity) {
  const categoryQuery = guessCategoryQuery(activity.place, activity.desc);
  const image = await fetchPexelsImage(categoryQuery);
  return image || 'https://images.pexels.com/photos/1051073/pexels-photo-1051073.jpeg';
}

async function fetchActivityDetails(activity, locationContext, destinationCenter) {
  const placeName = activity.place;

  if (!placeName) return activity;

  activity.image = await fetchActivityImage(activity);

  const coords = activity.coords;

  const validCoords =
    Array.isArray(coords) &&
    coords.length === 2 &&
    coords.every((n) => typeof n === 'number' && Number.isFinite(n)) &&
    !(coords[0] === 0 && coords[1] === 0);

  if (!validCoords) {
    const geocoded = await geocodePlace(placeName, locationContext, destinationCenter);
    activity.coords = geocoded || destinationCenter || null;
  }

  return activity;
}

async function enrichActivitiesSequentially(activities, locationContext, destinationCenter) {
  const results = [];
  for (const activity of activities) {
    try {
      results.push(await fetchActivityDetails(activity, locationContext, destinationCenter));
    } catch (e) {
      console.log('[enrichActivitiesSequentially] activity failed, keeping original:', e.message);
      results.push(activity);
    }
    await sleep(600);
  }
  return results;
}

app.post('/api/generate', async (req, res) => {
  try {
    const {
      location,
      days,
      people = 1,
      budget_tier = 'Medium',
      total_budget = 'Flexible'
    } = req.body;

    if (!location || !days) {
      return res.status(400).json({ error: 'location and days are required' });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    }

    const prompt = `
Act as a professional local travel consultant in ${location}. 
Create a COMPLETE ${days}-day "everything included" itinerary for ${people} people.
Budget: ${budget_tier} (${total_budget} INR).

STRICT REALISM RULES:
1. INCLUDE EVERYTHING: Every day MUST include:
   - A specific verified Hotel/Resort for 'Check-in & Rest'.
   - Specific local Restaurants for 'Breakfast', 'Lunch', and 'Dinner'.
   - 2-3 Sightseeing activities.
2. NEIGHBORHOOD LOCK: Group the hotel, restaurants, and activities in the same area each day to avoid traffic.
3. REAL PLACES ONLY: Use real, verified establishments in ${location}.
4. COST ACCURACY: 'cost' must be a realistic estimate PER PERSON (e.g., Special Entry Darshan is 300 INR).
5. LOCAL TIPS: In each 'desc', include a pro-tip like 'Book 3 months early' or 'Order the Ghee Roast'.

JSON SCHEMA:
{
    "trip_name": "Authentic Journey: ${location}",
    "total_budget": "Total for ${people} travelers",
    "itinerary": [
        {
            "day": 1,
            "activities": [
                { 
                    "id": "unique_id",
                    "time": "08:00 AM", 
                    "place": "Verified Name", 
                    "desc": "Local insight + Insider Tip.", 
                    "cost": 0, 
                    "duration": 60,
                    "priority": "high",
                    "energy": "low",
                    "coords": [0.0, 0.0]
                }
            ]
        }
    ]
}`;

    const MODEL_CHAIN = [
      'openai/gpt-oss-120b',
      'qwen/qwen3.6-27b',
      'openai/gpt-oss-20b'
    ];

    let tripData = null;

    for (const modelName of MODEL_CHAIN) {
      try {
        console.log(`[${modelName}] Trying...`);

        const groqRes = await fetchWithTimeout(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                {
                  role: 'system',
                  content:
                    'You are a travel planning AI. Respond with ONLY valid JSON. No markdown, no code fences.'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.1,
              max_completion_tokens: 5500,
              response_format: { type: 'json_object' }
            })
          },
          20000
        );

        console.log(`[${modelName}] Status: ${groqRes.status}`);

        if (groqRes.status === 429) continue;

        if (!groqRes.ok) {
          const errorText = await groqRes.text();
          console.log(`[${modelName}] Error response:`, errorText);
          continue;
        }

        const result = await groqRes.json();
        const content = result.choices?.[0]?.message?.content;

        if (!content) continue;

        let cleanContent = content.trim();

        if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent
            .replace(/^```(?:json)?\s*\n?/, '')
            .replace(/\n?```\s*$/, '');
        }

        const parsed = JSON.parse(cleanContent);

        if (!parsed || !Array.isArray(parsed.itinerary) || parsed.itinerary.length === 0) {
          console.log(`[${modelName}] Parsed JSON but itinerary shape was invalid, skipping`);
          continue;
        }

        tripData = parsed;
        console.log(`[${modelName}] Success!`);
        break;
      } catch (ex) {
        console.log(`[${modelName}] Error: ${ex.message}`);
        continue;
      }
    }

    if (!tripData) {
      return res.status(500).json({ error: 'Service busy. Try again.' });
    }

    const destinationCenter = await geocodeDestinationCenter(location);

    for (const day of tripData.itinerary) {
      if (!Array.isArray(day.activities)) {
        day.activities = [];
        continue;
      }
      day.activities = await enrichActivitiesSequentially(
        day.activities,
        location,
        destinationCenter
      );
    }

    res.json(tripData);
  } catch (e) {
    console.error('Generate error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal server error' });
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Voyager server running on port ${PORT}`);
  });
}

module.exports = app;
