import axios from 'axios';
import type { YouTubeSearchResult } from '../types';

const SERPER_API_KEY = import.meta.env.VITE_SERPER_API_KEY;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const searchYouTube = async (query: string): Promise<YouTubeSearchResult[]> => {
  try {
    // Try backend API first with short timeout
    const response = await axios.post(`${API_URL}/api/search/youtube`, {
      query
    }, {
      timeout: 3000 // 3 second timeout
    });

    return response.data.results || [];
  } catch (error) {
    // Fallback: Direct Serper call if backend not available
    if (SERPER_API_KEY) {
      console.log('Backend unavailable, using direct Serper API');
      return await searchYouTubeDirectly(query);
    }
    
    console.error('YouTube search error:', error);
    throw new Error('Unable to search YouTube. Please configure VITE_SERPER_API_KEY or start the backend server.');
  }
};

// Direct Serper API call (fallback or if no backend)
const searchYouTubeDirectly = async (query: string): Promise<YouTubeSearchResult[]> => {
  try {
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
    
    return videos.map((video: any) => {
      // Extract video ID from link
      const videoId = extractVideoId(video.link);
      
      return {
        videoId,
        title: video.title,
        thumbnail: video.imageUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        channelName: video.channel || 'Unknown',
        description: video.snippet || ''
      };
    }).filter((v: YouTubeSearchResult) => v.videoId);
  } catch (error) {
    console.error('Direct Serper search error:', error);
    throw error;
  }
};

// Extract YouTube video ID from various URL formats
const extractVideoId = (url: string): string => {
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
};
