const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Fetch Wikipedia image (same as original main.py)
async function fetchWikipediaImage(placeName) {
  try {
    const cleanQuery = placeName.split('(')[0].trim();
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(cleanQuery)}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=800`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'VoyagerAI/1.0' }
    });
    const data = await response.json();
    const pages = data?.query?.pages;
    if (pages) {
      for (const key of Object.keys(pages)) {
        if (pages[key]?.thumbnail?.source) {
          return pages[key].thumbnail.source;
        }
      }
    }
  } catch (e) { /* ignore */ }
  return null;
}

// Geocode using Nominatim (same purpose as geopy in original)
async function geocodePlace(placeName, locationContext) {
  try {
    const cleanQuery = placeName.split('(')[0].trim();
    const query = `${cleanQuery}, ${locationContext}`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'VoyagerAI/1.0' }
    });
    const data = await response.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (e) { /* ignore */ }
  return [0.0, 0.0];
}

// Enrich activity with image and coords (same as fetch_activity_details in main.py)
async function fetchActivityDetails(activity, locationContext) {
  const placeName = activity.place;
  if (!placeName) return activity;

  // Get image
  let imageUrl = await fetchWikipediaImage(placeName);
  if (!imageUrl) {
    const cleanQuery = placeName.split('(')[0].trim();
    imageUrl = `https://loremflickr.com/800/600/${cleanQuery.replace(/ /g, ',')},travel/all`;
  }
  activity.image = imageUrl;

  // Get coords
  if (!activity.coords || (activity.coords[0] === 0 && activity.coords[1] === 0)) {
    activity.coords = await geocodePlace(placeName, locationContext);
  }

  return activity;
}

// Generate itinerary endpoint (same as /generate in main.py, but using Groq instead of Gemini)
app.post('/api/generate', async (req, res) => {
  try {
    const { location, days, people = 1, budget_tier = 'Medium', total_budget = 'Flexible' } = req.body;

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    }

    // Same prompt as original main.py
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

    // Model chain (same concept as MODEL_CHAIN in main.py)
    const MODEL_CHAIN = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'];

    let tripData = null;

    for (const modelName of MODEL_CHAIN) {
      try {
        console.log(`[${modelName}] Trying...`);
        
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: 'system', content: 'You are a travel planning AI. Respond with ONLY valid JSON. No markdown, no code fences.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.1,
            max_tokens: 8000,
            response_format: { type: 'json_object' }
          })
        });

        console.log(`[${modelName}] Status: ${groqRes.status}`);

        if (groqRes.status === 429) continue;
        if (!groqRes.ok) continue;

        const result = await groqRes.json();
        const content = result.choices?.[0]?.message?.content;
        if (!content) continue;

        let cleanContent = content.trim();
        if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
        }

        tripData = JSON.parse(cleanContent);
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

    // Enrich activities with images and coords (parallel, like concurrent.futures in main.py)
    const enrichPromises = [];
    for (const day of tripData.itinerary) {
      for (const activity of day.activities) {
        enrichPromises.push(fetchActivityDetails(activity, location));
      }
    }
    await Promise.allSettled(enrichPromises);

    res.json(tripData);
  } catch (e) {
    console.error('Generate error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Voyager server running on port ${PORT}`);
  });
}

module.exports = app;