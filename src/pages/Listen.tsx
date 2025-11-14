import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaComment, FaMusic, FaTrophy, FaFire } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import { supabase, getCurrentWeekYear } from '../lib/supabase';
import type { Song, Comment, Category, Profile } from '../types';
import { CATEGORIES } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Avatar from '../components/Avatar';
import Loader from '../components/Loader';

export default function Listen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [topToday, setTopToday] = useState<Song[]>([]);
  const [topProfiles, setTopProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    loadSongs();
    loadTopToday();
    loadTopProfiles();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('songs_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'songs' }, 
        () => {
          loadSongs();
          loadTopToday();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votes' }, 
        () => {
          loadSongs();
          loadTopToday();
          loadTopProfiles();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (selectedSong) {
      loadComments(selectedSong.id);
    }
  }, [selectedSong]);

  const loadSongs = async () => {
    try {
      const weekYear = getCurrentWeekYear();

      // Load all active songs for current week
      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('is_active', true)
        .eq('week_year', weekYear)
        .order('created_at', { ascending: false });

      if (songsError) throw songsError;

      // Load votes for each song
      const songsWithVotes = await Promise.all(
        (songsData || []).map(async (song) => {
          const { count } = await supabase
            .from('votes')
            .select('*', { count: 'exact', head: true })
            .eq('song_id', (song as any).id)
            .eq('week_year', weekYear);

          // Check if current user voted
          let userVoted = false;
          if (user) {
            const { data: voteData } = await supabase
              .from('votes')
              .select('*')
              .eq('song_id', (song as any).id)
              .eq('voter_id', user.id)
              .eq('week_year', weekYear)
              .maybeSingle();
            
            userVoted = !!voteData;
          }

          return {
            ...(song as any),
            vote_count: count || 0,
            user_voted: userVoted
          };
        })
      );

      setSongs(songsWithVotes);
      filterSongs(songsWithVotes, selectedCategory);
    } catch (err) {
      console.error('Error loading songs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTopToday = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekYear = getCurrentWeekYear();

      // Get votes from today
      const { data: votesData } = await supabase
        .from('votes')
        .select('song_id')
        .gte('created_at', today)
        .eq('week_year', weekYear);

      if (!votesData) return;

      // Count votes per song
      const songVoteCounts = votesData.reduce((acc: any, vote: any) => {
        acc[vote.song_id] = (acc[vote.song_id] || 0) + 1;
        return acc;
      }, {});

      // Get top 3 songs
      const topSongIds = Object.entries(songVoteCounts)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 3)
        .map(([songId]) => songId);

      if (topSongIds.length === 0) return;

      // Fetch song details
      const { data: songsData } = await supabase
        .from('songs')
        .select('*, profile:profiles(*)')
        .in('id', topSongIds);

      if (songsData) {
        const songsWithVotes = songsData.map((song: any) => ({
          ...song,
          vote_count: songVoteCounts[song.id]
        }));
        setTopToday(songsWithVotes);
      }
    } catch (err) {
      console.error('Error loading top today:', err);
    }
  };

  const loadTopProfiles = async () => {
    try {
      const weekYear = getCurrentWeekYear();

      // Get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;
      if (!profilesData) return;

      // Calculate current week votes for each profile
      const profilesWithVotes = await Promise.all(
        profilesData.map(async (profile: any) => {
          // Get all active songs by this user for current week
          const { data: userSongs } = await supabase
            .from('songs')
            .select('id')
            .eq('user_id', profile.id)
            .eq('is_active', true)
            .eq('week_year', weekYear) as { data: { id: string }[] | null };

          if (!userSongs || userSongs.length === 0) {
            return { ...profile, current_week_votes: 0 };
          }

          // Count total votes for all their songs this week
          let totalVotes = 0;
          for (const song of userSongs) {
            const { count } = await supabase
              .from('votes')
              .select('*', { count: 'exact', head: true })
              .eq('song_id', song.id)
              .eq('week_year', weekYear);
            
            totalVotes += count || 0;
          }

          return { ...profile, current_week_votes: totalVotes };
        })
      );

      // Sort by current week votes and take top 10
      const topProfiles = profilesWithVotes
        .sort((a, b) => b.current_week_votes - a.current_week_votes)
        .slice(0, 10);

      setTopProfiles(topProfiles);
    } catch (err) {
      console.error('Error loading top profiles:', err);
    }
  };

  const filterSongs = (allSongs: Song[], category: Category | 'All') => {
    if (category === 'All') {
      setFilteredSongs(allSongs);
    } else {
      setFilteredSongs(allSongs.filter(song => song.category === category));
    }
  };

  const handleCategoryChange = (category: Category | 'All') => {
    setSelectedCategory(category);
    filterSongs(songs, category);
  };

  const loadComments = async (songId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('song_id', songId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  const handleVote = async (song: Song) => {
    if (!user) {
      alert('Please sign in to vote');
      return;
    }

    const weekYear = getCurrentWeekYear();

    try {
      if (song.user_voted) {
        // Remove vote
        await supabase
          .from('votes')
          .delete()
          .eq('song_id', song.id)
          .eq('voter_id', user.id)
          .eq('week_year', weekYear);
      } else {
        // Add vote
        await supabase
          .from('votes')
          .insert({
            song_id: song.id,
            voter_id: user.id,
            week_year: weekYear
          } as any);
      }

      // Reload songs to update vote counts
      loadSongs();
    } catch (err: any) {
      console.error('Error voting:', err);
      if (err.code === '23505') {
        alert('You have already voted for this song');
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !selectedSong || !newComment.trim()) return;

    setCommentLoading(true);

    try {
      await supabase
        .from('comments')
        .insert({
          song_id: selectedSong.id,
          user_id: user.id,
          content: newComment.trim()
        } as any);

      setNewComment('');
      loadComments(selectedSong.id);
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const youtubeOpts = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 0,
    },
  };

  if (loading) {
    return (
      <div className="listen-page">
        <div className="loading-spinner">
          <Loader />
          <p>Loading songs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="listen-page">
      <div className="listen-header">
        <h1><FaMusic /> Listen & Vote</h1>
        <p>Discover amazing songs and vote for your favorites</p>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <button 
          className={`filter-btn ${selectedCategory === 'All' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('All')}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredSongs.length === 0 ? (
        <div className="empty-state">
          <h2>No Songs Yet</h2>
          <p>Be the first to add a song to this week's competition!</p>
        </div>
      ) : (
        <div className="songs-grid">
          {filteredSongs.map((song) => (
            <div key={song.id} className="song-card">
              <div className="song-header">
                <div className="song-user">
                  <Avatar 
                    src={song.profile?.avatar_url}
                    alt={song.profile?.username || 'User'}
                    className="user-avatar"
                  />
                  <span className="username">{song.profile?.username}</span>
                </div>
                <span className="category-badge">{song.category}</span>
              </div>

              <div className="song-content">
                <h3 className="song-title">{song.title}</h3>
                <p className="song-channel">{song.channel_name}</p>
                
                <div className="youtube-player">
                  <YouTube
                    videoId={song.video_id}
                    opts={{
                      ...youtubeOpts,
                      playerVars: {
                        ...youtubeOpts.playerVars,
                        start: song.start_time
                      }
                    }}
                  />
                </div>
              </div>

              <div className="song-actions">
                <button
                  className={`vote-button ${song.user_voted ? 'voted' : ''}`}
                  onClick={() => handleVote(song)}
                  disabled={!user}
                >
                  {song.user_voted ? <FaHeart /> : <FaRegHeart />}
                  <span>{song.vote_count}</span>
                </button>

                <button
                  className="comment-button"
                  onClick={() => setSelectedSong(song)}
                >
                  <FaComment /> Comments
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Horizontal Scroll Sections - Below Songs */}
      <div className="listen-bottom-sections">
        {/* Top Today */}
        {topToday.length > 0 && (
          <div className="top-section">
            <h3><FaFire /> Hot Today</h3>
            <div className="top-scroll">
              {topToday.map((song) => (
                <div key={song.id} className="top-card">
                  <img src={song.thumbnail} alt={song.title} />
                  <div className="top-card-content">
                    <h4>{song.title}</h4>
                    <p>{song.profile?.username}</p>
                    <span className="top-votes">🔥 {song.vote_count} today</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Profiles */}
        {topProfiles.length > 0 && (
          <div className="top-section">
            <h3><FaTrophy /> Top 10 Artists</h3>
            <div className="top-scroll">
              {topProfiles.map((profile, index) => (
                <div 
                  key={profile.id} 
                  className="profile-card"
                  onClick={() => navigate(`/profile/${profile.id}`)}
                >
                  <div className="profile-rank">#{index + 1}</div>
                  <Avatar src={profile.avatar_url} alt={profile.username} className="profile-card-avatar" />
                  <div className="profile-card-content">
                    <h4>{profile.username}</h4>
                    <span className="profile-votes">⭐ {(profile as any).current_week_votes || 0} votes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comments Modal */}
      {selectedSong && (
        <div className="modal-overlay" onClick={() => setSelectedSong(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Comments</h2>
              <button 
                className="close-button"
                onClick={() => setSelectedSong(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <h3 className="song-title-modal">{selectedSong.title}</h3>

              {user && (
                <form onSubmit={handleAddComment} className="comment-form">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="comment-input"
                    rows={3}
                  />
                  <button 
                    type="submit" 
                    className="submit-comment-button"
                    disabled={commentLoading || !newComment.trim()}
                  >
                    {commentLoading ? 'Posting...' : 'Post Comment'}
                  </button>
                </form>
              )}

              <div className="comments-list">
                {comments.length === 0 ? (
                  <p className="no-comments">No comments yet. Be the first!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="comment">
                      <div className="comment-header">
                        <Avatar
                          src={comment.profile?.avatar_url}
                          alt={comment.profile?.username || 'User'}
                          className="comment-avatar"
                        />
                        <span className="comment-username">
                          {comment.profile?.username}
                        </span>
                        <span className="comment-time">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="comment-content">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
