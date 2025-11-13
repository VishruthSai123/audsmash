// Application types
export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  total_weekly_votes: number;
  created_at: string;
  updated_at: string;
}

export interface Song {
  id: string;
  user_id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  channel_name: string | null;
  category: string;
  start_time: number;
  is_active: boolean;
  week_year: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  vote_count?: number;
  user_voted?: boolean;
}

export interface Vote {
  id: string;
  song_id: string;
  voter_id: string;
  week_year: string;
  created_at: string;
}

export interface Comment {
  id: string;
  song_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  thumbnail: string;
  channelName: string;
  description?: string;
}

export interface LeaderboardEntry {
  profile: Profile;
  total_votes: number;
  current_song?: Song;
}

export const CATEGORIES = [
  'Hip Hop',
  'Rock',
  'Pop',
  'Electronic',
  'R&B',
  'Country',
  'Jazz',
  'Classical',
  'Reggae',
  'Metal',
  'Other'
] as const;

export type Category = typeof CATEGORIES[number];
