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
      // OPTIMIZATION: Get all data in fewer queries
      const weekYear = getCurrentWeekYear();

      // Query 1: Get all active songs for this week with their vote counts
      const { data: songsData } = await supabase
        .from('songs')
        .select('id, user_id, title, week_year')
        .eq('is_active', true)
        .eq('week_year', weekYear);

      if (!songsData || songsData.length === 0) {
        setLeaderboard([]);
        setLoading(false);
        return;
      }

      // Query 2: Get all votes for these songs in one query
      const songIds = songsData.map((s: any) => s.id);
      const { data: votesData } = await supabase
        .from('votes')
        .select('song_id')
        .in('song_id', songIds)
        .eq('week_year', weekYear);

      // Count votes per song
      const voteCounts: Record<string, number> = {};
      (votesData || []).forEach((vote: any) => {
        voteCounts[vote.song_id] = (voteCounts[vote.song_id] || 0) + 1;
      });

      // Map songs to users
      const userVotes: Record<string, { votes: number; song: any }> = {};
      songsData.forEach((song: any) => {
        const voteCount = voteCounts[song.id] || 0;
        if (voteCount > 0) {
          userVotes[song.user_id] = {
            votes: voteCount,
            song: song
          };
        }
      });

      // Query 3: Get profiles for users with votes
      const userIds = Object.keys(userVotes);
      if (userIds.length === 0) {
        setLeaderboard([]);
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      // Combine data
      const leaderboardData = (profiles || [])
        .map((profile: any) => ({
          profile,
          total_votes: userVotes[profile.id]?.votes || 0,
          current_song: userVotes[profile.id]?.song
        }))
        .filter(entry => entry.total_votes > 0)
        .sort((a, b) => b.total_votes - a.total_votes);

      setLeaderboard(leaderboardData);
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
