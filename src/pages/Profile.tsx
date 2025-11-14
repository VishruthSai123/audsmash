import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTrophy, FaMusic, FaHistory, FaEdit, FaCamera } from 'react-icons/fa';
import YouTube from 'react-youtube';
import { supabase, getCurrentWeekYear } from '../lib/supabase';
import type { Profile as ProfileType, Song } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Avatar from '../components/Avatar';
import AvatarGallery from '../components/AvatarGallery';
import Loader from '../components/Loader';

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [pastSongs, setPastSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState('');
  const [showAvatarGallery, setShowAvatarGallery] = useState(false);

  const isOwnProfile = user && userId === user.id;

  useEffect(() => {
    const profileId = userId || user?.id;
    if (profileId) {
      loadProfile(profileId);
    } else {
      navigate('/');
    }
  }, [userId, user]);

  const loadProfile = async (profileId: string) => {
    try {
      const weekYear = getCurrentWeekYear();

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData as any);
      setUsername((profileData as any).username);

      // Load ALL current active songs for this week
      const { data: currentSongsData } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', profileId)
        .eq('is_active', true)
        .eq('week_year', weekYear)
        .order('created_at', { ascending: false });

      if (currentSongsData && currentSongsData.length > 0) {
        // Get vote counts for all active songs
        const songsWithVotes = await Promise.all(
          currentSongsData.map(async (song: any) => {
            const { count } = await supabase
              .from('votes')
              .select('*', { count: 'exact', head: true })
              .eq('song_id', song.id);

            return {
              ...song,
              vote_count: count || 0
            };
          })
        );

        // Set the most recent song as current, store others separately
        setCurrentSong(songsWithVotes[0]);
        // You can add state for other active songs if needed
      }

      // Load past songs (inactive songs or from previous weeks)
      const { data: pastSongsData } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', profileId)
        .or(`is_active.eq.false,week_year.neq.${weekYear}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (pastSongsData) {
        // Get vote counts for past songs
        const songsWithVotes = await Promise.all(
          pastSongsData.map(async (song) => {
            const { count } = await supabase
              .from('votes')
              .select('*', { count: 'exact', head: true })
              .eq('song_id', (song as any).id);

            return {
              ...(song as any),
              vote_count: count || 0
            };
          })
        );

        setPastSongs(songsWithVotes);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user || !username.trim()) return;

    try {
      // Optimistic update
      if (profile) {
        setProfile({ ...profile, username: username.trim() });
      }

      const { error } = await (supabase as any)
        .from('profiles')
        .update({ username: username.trim() })
        .eq('id', user.id);

      if (error) throw error;

      setEditMode(false);
      console.log('Username updated successfully');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      alert(err.message || 'Failed to update profile');
      // Reload on error
      loadProfile(user.id);
    }
  };

  const handleUpdateAvatar = async (avatarUrl: string) => {
    if (!user) return;

    try {
      // Optimistic update - update UI immediately
      if (profile) {
        setProfile({ ...profile, avatar_url: avatarUrl });
      }

      // Update in database
      const { error } = await (supabase as any)
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (error) throw error;

      console.log('Avatar updated successfully');
      // Don't reload - we already updated the UI optimistically
    } catch (err: any) {
      console.error('Error updating avatar:', err);
      alert(err.message || 'Failed to update avatar');
      // Reload on error to get correct state
      loadProfile(user.id);
    }
  };

  const youtubeOpts = {
    height: '180',
    width: '100%',
    playerVars: {
      autoplay: 0,
    },
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-spinner">
          <Loader />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="empty-state">
          <h2>Profile Not Found</h2>
          <button onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-section">
          <Avatar
            src={profile.avatar_url}
            alt={profile.username}
            className="profile-avatar-large"
            size={120}
          />
          {isOwnProfile && (
            <button 
              className="edit-avatar-button"
              onClick={() => setShowAvatarGallery(true)}
              title="Change Avatar"
            >
              <FaCamera />
            </button>
          )}
        </div>

        <div className="profile-info">
          {editMode ? (
            <div className="edit-username">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="username-input"
              />
              <div className="edit-actions">
                <button onClick={handleUpdateProfile} className="save-button">
                  Save
                </button>
                <button onClick={() => setEditMode(false)} className="cancel-button">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="username-display">
              <h1>{profile.username}</h1>
              {isOwnProfile && (
                <button onClick={() => setEditMode(true)} className="edit-button">
                  <FaEdit />
                </button>
              )}
            </div>
          )}

          <div className="profile-stats">
            <div className="stat">
              <FaTrophy className="stat-icon" />
              <div>
                <span className="stat-value">{profile.total_weekly_votes}</span>
                <span className="stat-label">Weekly Votes</span>
              </div>
            </div>
            <div className="stat">
              <FaMusic className="stat-icon" />
              <div>
                <span className="stat-value">{pastSongs.length + (currentSong ? 1 : 0)}</span>
                <span className="stat-label">Total Songs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Song Section */}
      {currentSong && (
        <div className="current-song-section">
          <h2><FaMusic /> Current Song</h2>
          <div className="song-card featured">
            <h3>{currentSong.title}</h3>
            <p className="channel">{currentSong.channel_name}</p>
            <div className="category-badge">{currentSong.category}</div>
            
            <div className="youtube-player">
              <YouTube
                videoId={currentSong.video_id}
                opts={{
                  ...youtubeOpts,
                  playerVars: {
                    ...youtubeOpts.playerVars,
                    start: currentSong.start_time
                  }
                }}
              />
            </div>

            <div className="song-stats">
              <span className="votes">❤️ {currentSong.vote_count} votes</span>
              <span className="date">
                Added {new Date(currentSong.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Past Songs Section */}
      {pastSongs.length > 0 && (
        <div className="past-songs-section">
          <h2><FaHistory /> Past Entries</h2>
          <div className="past-songs-grid">
            {pastSongs.map((song) => (
              <div key={song.id} className="past-song-card">
                <img 
                  src={song.thumbnail}
                  alt={song.title}
                  className="song-thumbnail"
                />
                <div className="song-details">
                  <h4>{song.title}</h4>
                  <p className="channel">{song.channel_name}</p>
                  <div className="song-meta">
                    <span className="category">{song.category}</span>
                    <span className="votes">❤️ {song.vote_count}</span>
                  </div>
                  <span className="week">Week {song.week_year}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isOwnProfile && !currentSong && (
        <div className="no-current-song">
          <p>You haven't added a song this week yet!</p>
          <button 
            className="primary-button"
            onClick={() => navigate('/search')}
          >
            Add Your First Song
          </button>
        </div>
      )}

      {/* Avatar Gallery Modal */}
      {showAvatarGallery && isOwnProfile && (
        <AvatarGallery
          currentAvatar={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.username)}`}
          username={profile.username}
          onSelect={handleUpdateAvatar}
          onClose={() => setShowAvatarGallery(false)}
        />
      )}
    </div>
  );
}
