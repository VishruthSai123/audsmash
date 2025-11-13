import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus } from 'react-icons/fa';
import { searchYouTube } from '../services/youtube.service';
import type { YouTubeSearchResult } from '../types';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YouTubeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const searchResults = await searchYouTube(query);
      setResults(searchResults);
      
      if (searchResults.length === 0) {
        setError('No results found. Try a different search term.');
      }
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSong = (video: YouTubeSearchResult) => {
    // Navigate to upload page with video data
    navigate('/upload', { state: { video } });
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Search YouTube</h1>
        <p>Find your favorite songs to add to the competition</p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for songs, artists, or keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <button 
          type="submit" 
          className="search-button"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="search-results">
        {results.map((video) => (
          <div key={video.videoId} className="video-card">
            <img 
              src={video.thumbnail} 
              alt={video.title}
              className="video-thumbnail"
            />
            <div className="video-info">
              <h3 className="video-title">{video.title}</h3>
              <p className="video-channel">{video.channelName}</p>
              {video.description && (
                <p className="video-description">
                  {video.description.substring(0, 100)}...
                </p>
              )}
            </div>
            <button 
              className="add-button"
              onClick={() => handleAddSong(video)}
            >
              <FaPlus /> Add
            </button>
          </div>
        ))}
      </div>

      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Searching YouTube...</p>
        </div>
      )}
    </div>
  );
}
