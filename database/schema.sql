-- AudSmash Database Schema
-- Run these SQL commands in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  total_weekly_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Songs table
CREATE TABLE IF NOT EXISTS public.songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  channel_name TEXT,
  category TEXT NOT NULL,
  start_time INTEGER DEFAULT 0, -- in seconds
  is_active BOOLEAN DEFAULT TRUE, -- current song for the user
  week_year TEXT NOT NULL, -- format: "2025-W46" for tracking weekly competitions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_year TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(song_id, voter_id, week_year) -- One vote per song per user per week
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Song changes tracking (for daily limit)
CREATE TABLE IF NOT EXISTS public.song_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  old_song_id UUID REFERENCES public.songs(id) ON DELETE SET NULL,
  new_song_id UUID REFERENCES public.songs(id) ON DELETE SET NULL,
  change_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, change_date) -- One change per day
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_songs_user_id ON public.songs(user_id);
CREATE INDEX IF NOT EXISTS idx_songs_week_year ON public.songs(week_year);
CREATE INDEX IF NOT EXISTS idx_songs_active ON public.songs(is_active);
CREATE INDEX IF NOT EXISTS idx_votes_song_id ON public.votes(song_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_id ON public.votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_votes_week_year ON public.votes(week_year);
CREATE INDEX IF NOT EXISTS idx_comments_song_id ON public.comments(song_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_song_changes_user_date ON public.song_changes(user_id, change_date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_changes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Songs policies
CREATE POLICY "Songs are viewable by everyone" 
  ON public.songs FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own songs" 
  ON public.songs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own songs" 
  ON public.songs FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own songs" 
  ON public.songs FOR DELETE 
  USING (auth.uid() = user_id);

-- Votes policies
CREATE POLICY "Votes are viewable by everyone" 
  ON public.votes FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own votes" 
  ON public.votes FOR INSERT 
  WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Users can delete their own votes" 
  ON public.votes FOR DELETE 
  USING (auth.uid() = voter_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" 
  ON public.comments FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own comments" 
  ON public.comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
  ON public.comments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
  ON public.comments FOR DELETE 
  USING (auth.uid() = user_id);

-- Song changes policies
CREATE POLICY "Users can view their own song changes" 
  ON public.song_changes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own song changes" 
  ON public.song_changes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Function to get current week_year
CREATE OR REPLACE FUNCTION get_current_week_year()
RETURNS TEXT AS $$
BEGIN
  RETURN TO_CHAR(CURRENT_DATE, 'IYYY-IW');
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_songs_updated_at 
  BEFORE UPDATE ON public.songs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at 
  BEFORE UPDATE ON public.comments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update total weekly votes
CREATE OR REPLACE FUNCTION update_weekly_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment vote count for the song owner
    UPDATE public.profiles
    SET total_weekly_votes = (
      SELECT COUNT(DISTINCT v.id)
      FROM public.votes v
      JOIN public.songs s ON v.song_id = s.id
      WHERE s.user_id = (
        SELECT user_id FROM public.songs WHERE id = NEW.song_id
      )
      AND v.week_year = NEW.week_year
    )
    WHERE id = (SELECT user_id FROM public.songs WHERE id = NEW.song_id);
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement vote count for the song owner
    UPDATE public.profiles
    SET total_weekly_votes = (
      SELECT COUNT(DISTINCT v.id)
      FROM public.votes v
      JOIN public.songs s ON v.song_id = s.id
      WHERE s.user_id = (
        SELECT user_id FROM public.songs WHERE id = OLD.song_id
      )
      AND v.week_year = OLD.week_year
    )
    WHERE id = (SELECT user_id FROM public.songs WHERE id = OLD.song_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vote counting
CREATE TRIGGER update_weekly_votes_trigger
  AFTER INSERT OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION update_weekly_votes();

-- Function to ensure only one active song per user
CREATE OR REPLACE FUNCTION ensure_one_active_song()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = TRUE THEN
    -- Deactivate all other songs for this user
    UPDATE public.songs
    SET is_active = FALSE
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_active = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for active song management
CREATE TRIGGER ensure_one_active_song_trigger
  BEFORE INSERT OR UPDATE ON public.songs
  FOR EACH ROW EXECUTE FUNCTION ensure_one_active_song();
