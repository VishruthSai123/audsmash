import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;
const SERPER_API_KEY = process.env.VITE_SERPER_API_KEY;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AudSmash API is running' });
});

// YouTube search endpoint
app.post('/api/search/youtube', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (!SERPER_API_KEY) {
      return res.status(500).json({ error: 'Serper API key not configured' });
    }

    // Call Serper API
    const response = await axios.post(
      'https://google.serper.dev/videos',
      {
        q: `${query} site:youtube.com`,
        num: 20
      },
      {
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const videos = response.data.videos || [];
    
    // Transform the results
    const results = videos.map((video) => {
      const videoId = extractVideoId(video.link);
      
      return {
        videoId,
        title: video.title,
        thumbnail: video.imageUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        channelName: video.channel || 'Unknown',
        description: video.snippet || ''
      };
    }).filter(v => v.videoId);

    res.json({ results });
  } catch (error) {
    console.error('YouTube search error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to search YouTube',
      details: error.message 
    });
  }
});

// Extract YouTube video ID from various URL formats
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return '';
}

app.listen(PORT, () => {
  console.log(`🚀 AudSmash API running on http://localhost:${PORT}`);
  console.log(`📝 Serper API key configured: ${!!SERPER_API_KEY}`);
});
