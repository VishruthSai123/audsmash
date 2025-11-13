import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSave, FaClock } from 'react-icons/fa';
import YouTube from 'react-youtube';
import { supabase, getCurrentWeekYear } from '../lib/supabase';
import type { YouTubeSearchResult, Category } from '../types';
import { CATEGORIES } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function Upload() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const videoFromSearch = location.state?.video as YouTubeSearchResult | undefined;

  const [video] = useState<YouTubeSearchResult | null>(videoFromSearch || null);
  const [category, setCategory] = useState<Category>('Hip Hop');
  const [startTime, setStartTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [canChangeToday, setCanChangeToday] = useState(true);
  const [playerInstance, setPlayerInstance] = useState<any>(null);

  useEffect(() => {
    if (user) {
      checkDailyChangeLimit();
    }
  }, [user]);

  const checkDailyChangeLimit = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('song_changes')
        .select('*')
        .eq('user_id', user.id)
        .eq('change_date', today)
        .maybeSingle();

      if (error) {
        console.error('Error checking change limit:', error);
      }

      setCanChangeToday(!data); // Can change if no record exists for today
    } catch (err) {
      console.error('Error checking daily limit:', err);
    }
  };

  const handlePlayerReady = (event: any) => {
    setPlayerInstance(event.target);
  };

  const captureCurrentTime = () => {
    if (playerInstance) {
      const currentTime = Math.floor(playerInstance.getCurrentTime());
      setStartTime(currentTime);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('Please sign in to add songs');
      return;
    }

    if (!video) {
      setError('Please select a video from search');
      return;
    }

    if (!canChangeToday) {
      setError('You can only change your song once per day. Try again tomorrow!');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const weekYear = getCurrentWeekYear();

      // Check if user already has an active song
      const { data: existingSongs } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      // Deactivate existing active song
      if (existingSongs) {
        await (supabase as any)
          .from('songs')
          .update({ is_active: false })
          .eq('id', (existingSongs as any).id);
      }

      // Insert new song
      const { data: newSong, error: insertError } = await supabase
        .from('songs')
        .insert({
          user_id: user.id,
          video_id: video.videoId,
          title: video.title,
          thumbnail: video.thumbnail,
          channel_name: video.channelName,
          category,
          start_time: startTime,
          is_active: true,
          week_year: weekYear
        } as any)
        .select()
        .single();

      if (insertError) throw insertError;

      // Record the song change
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('song_changes')
        .insert({
          user_id: user.id,
          old_song_id: (existingSongs as any)?.id || null,
          new_song_id: (newSong as any).id,
          change_date: today
        } as any);

      setSuccess('Song added successfully! 🎵');
      setTimeout(() => {
        navigate('/listen');
      }, 1500);
    } catch (err: any) {
      console.error('Error adding song:', err);
      setError(err.message || 'Failed to add song. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!videoFromSearch) {
    return (
      <div className="upload-page">
        <div className="empty-state">
          <h2>No Video Selected</h2>
          <p>Please search for a video first</p>
          <button 
            className="primary-button"
            onClick={() => navigate('/search')}
          >
            Go to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-page">
      <div className="upload-header">
        <h1>Add Your Song</h1>
        <p>Complete the details for your weekly competition entry</p>
      </div>

      <div className="info-notice">
        <div className="notice-icon">ℹ️</div>
        <div className="notice-content">
          <h3>Important Information</h3>
          <ul>
            <li>You can change your song <strong>once per day</strong></li>
            <li>Your <strong>total votes will be calculated combined</strong> throughout the week</li>
            <li>All your songs this week contribute to your final score!</li>
          </ul>
        </div>
      </div>

      {!canChangeToday && (
        <div className="warning-message">
          ⚠️ You've already changed your song today. You can change it again tomorrow!
        </div>
      )}

      <div className="upload-content">
        <div className="video-preview">
          <div className="video-details">
            <h3>{video?.title}</h3>
            <p>{video?.channelName}</p>
          </div>
          <div className="youtube-player-preview">
            <YouTube
              videoId={video?.videoId}
              opts={{
                width: '100%',
                height: '100%',
                playerVars: {
                  autoplay: 0,
                  start: startTime
                }
              }}
              onReady={handlePlayerReady}
            />
          </div>
          <button 
            type="button" 
            className="capture-time-button"
            onClick={captureCurrentTime}
            disabled={!playerInstance}
          >
            <FaClock /> Capture Current Time
          </button>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="form-select"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="startTime">
              <FaClock /> Start Time (seconds)
            </label>
            <input
              type="number"
              id="startTime"
              min="0"
              value={startTime}
              onChange={(e) => setStartTime(parseInt(e.target.value) || 0)}
              className="form-input"
              placeholder="0"
            />
            <small>Set where the song should start playing (best part)</small>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button
            type="submit"
            className="submit-button"
            disabled={loading || !canChangeToday}
          >
            <FaSave /> {loading ? 'Adding...' : 'Add Song'}
          </button>
        </form>
      </div>
    </div>
  );
}
