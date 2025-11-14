import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaMedal, FaMusic } from 'react-icons/fa';
import { supabase, getCurrentWeekYear } from '../lib/supabase';
import type { LeaderboardEntry } from '../types';
import Avatar from '../components/Avatar';
import Loader from '../components/Loader';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const weekYear = getCurrentWeekYear();

  useEffect(() => {
    loadLeaderboard();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('leaderboard_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votes' }, 
        () => loadLeaderboard()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [weekYear]);

  const loadLeaderboard = async () => {
    try {
      // Get all profiles with their vote counts for the week
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('total_weekly_votes', { ascending: false });

      if (profilesError) throw profilesError;

      // For each profile, get their current active song and actual vote count
      const leaderboardData = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Get vote count for this week
          const { data: songs } = await supabase
            .from('songs')
            .select('id')
            .eq('user_id', (profile as any).id)
            .eq('week_year', weekYear)
            .eq('is_active', true);

          let totalVotes = 0;
          if (songs && songs.length > 0) {
            const { count } = await supabase
              .from('votes')
              .select('*', { count: 'exact', head: true })
              .eq('song_id', (songs[0] as any).id)
              .eq('week_year', weekYear);
            
            totalVotes = count || 0;
          }

          // Get current active song
          const { data: currentSong } = await supabase
            .from('songs')
            .select('*')
            .eq('user_id', (profile as any).id)
            .eq('is_active', true)
            .eq('week_year', weekYear)
            .maybeSingle();

          return {
            profile,
            total_votes: totalVotes,
            current_song: currentSong || undefined
          };
        })
      );

      // Sort by total votes and filter out users with 0 votes
      const sortedLeaderboard = leaderboardData
        .filter(entry => entry.total_votes > 0)
        .sort((a, b) => b.total_votes - a.total_votes);

      setLeaderboard(sortedLeaderboard);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <FaTrophy className="trophy gold" />;
      case 2:
        return <FaMedal className="medal silver" />;
      case 3:
        return <FaMedal className="medal bronze" />;
      default:
        return <span className="rank-number">#{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="leaderboard-page">
        <div className="loading-spinner">
          <Loader />
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <div className="header-title">
          <FaTrophy className="header-icon" />
          <h1>Weekly Leaderboard</h1>
        </div>
        <div className="header-info">
          <span className="week-badge">Week {weekYear}</span>
          <span className="prize-badge">🏆 Cash Prize 🏆</span>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="empty-state">
          <h2>No Entries Yet</h2>
          <p>Be the first to compete this week!</p>
          <button 
            className="primary-button"
            onClick={() => navigate('/search')}
          >
            Add Your Song
          </button>
        </div>
      ) : (
        <div className="leaderboard-list">
          {leaderboard.map((entry, index) => {
            const rank = index + 1;
            const isTopThree = rank <= 3;

            return (
              <div 
                key={entry.profile.id} 
                className={`leaderboard-item ${isTopThree ? 'top-three' : ''} ${rank === 1 ? 'winner' : ''}`}
                onClick={() => navigate(`/profile/${entry.profile.id}`)}
              >
                <div className="rank-section">
                  {getMedalIcon(rank)}
                </div>

                <div className="user-section">
                  <Avatar
                    src={entry.profile.avatar_url}
                    alt={entry.profile.username}
                    className="user-avatar"
                  />
                  <div className="user-info">
                    <h3 className="username">{entry.profile.username}</h3>
                    {entry.current_song && (
                      <p className="song-title">
                        <FaMusic /> {entry.current_song.title}
                      </p>
                    )}
                  </div>
                </div>

                <div className="votes-section">
                  <span className="vote-count">{entry.total_votes}</span>
                  <span className="vote-label">votes</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {leaderboard.length > 0 && (
        <div className="leaderboard-footer">
          <p>Competition resets every Monday</p>
          <p>Vote for your favorite songs to help them climb the ranks!</p>
        </div>
      )}
    </div>
  );
}
