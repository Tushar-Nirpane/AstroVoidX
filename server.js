import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const SERPER_API_KEY = process.env.SERPER_API_KEY;
const PIXAZO_API_KEY = process.env.PIXAZO_API_KEY;

// In-memory cache for search results
const cache = {};
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

app.post('/api/generate-image', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!PIXAZO_API_KEY) {
    return res.status(500).json({ error: 'Pixazo API Key is missing.' });
  }

  try {
    const response = await fetch('https://gateway.pixazo.ai/flux-1-schnell/v1/getData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Ocp-Apim-Subscription-Key': PIXAZO_API_KEY
      },
      body: JSON.stringify({
        prompt: prompt,
        num_steps: 4,
        height: 1024,
        width: 1024
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Pixazo API Error:', data);
      throw new Error(data.message || 'Failed to generate image with Pixazo');
    }

    if (data.output) {
      res.json({ imageUrl: data.output });
    } else {
      console.error('Pixazo Unexpected Response:', data);
      throw new Error('Pixazo API did not return an image URL.');
    }
  } catch (error) {
    console.error('Image Generation API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/search', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  // Check cache
  const cached = cache[query];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`Cache hit for query: "${query}"`);
    return res.json(cached.data);
  }

  console.log(`Fetching from Serper API for query: "${query}"`);
  
  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        num: 5 // Rate limiting: keep num small to save credits/data
      })
    });

    if (!response.ok) {
      throw new Error(`Serper API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Save to cache
    cache[query] = {
      timestamp: Date.now(),
      data
    };

    res.json(data);
  } catch (error) {
    console.error('Search API Error:', error);
    res.status(500).json({ error: 'Failed to perform search. Please try again later.' });
  }
app.post('/api/generate-ppt', async (req, res) => {
  const { prompt } = req.body;
  const CANVA_ACCESS_TOKEN = process.env.CANVA_ACCESS_TOKEN;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!CANVA_ACCESS_TOKEN || CANVA_ACCESS_TOKEN.includes('your_canva')) {
    return res.status(400).json({ 
      error: 'Canva Access Token is missing or invalid. Please update your .env file with a valid Canva Connect API token.' 
    });
  }

  try {
    // Note: This endpoint creates a generic presentation design.
    // In a production environment, you would use Brand Templates and the Autofill API.
    const response = await fetch('https://api.canva.com/rest/v1/designs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CANVA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        design_type: 'presentation',
        title: `AstroVoidX Generated: ${prompt.substring(0, 30)}`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Canva API Detail:', data);
      throw new Error(data.message || 'Canva API Error');
    }

    res.json({
      success: true,
      designId: data.design?.id,
      url: data.design?.url || `https://www.canva.com/design/${data.design?.id}/edit`,
      structure: [
        { title: "Introduction", content: `Context: ${prompt}` },
        { title: "Main Concept", content: "AI-driven architecture analysis" },
        { title: "Technical Details", content: "Generated via AstroVoidX Connect" },
        { title: "Next Steps", content: "Review and Export" }
      ]
    });
  } catch (error) {
    console.error('Canva PPT API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/analyze-data', async (req, res) => {
  const { data } = req.body;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!data) {
    return res.status(400).json({ error: 'Data to analyze is required' });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API Key is missing.' });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze the following data and provide a concise summary, key insights, and any notable trends or anomalies:\n\n${data}`
          }]
        }]
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', result);
      throw new Error(result.error?.message || 'Failed to analyze data with Gemini');
    }

    const summary = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (summary) {
      res.json({ summary });
    } else {
      throw new Error('Gemini API did not return a summary.');
    }
  } catch (error) {
    console.error('Data Analysis API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
