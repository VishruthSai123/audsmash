-- ============================================
-- AudSmash Database Schema - FIXED VERSION
-- Run this to fix all RLS and policy issues
-- ============================================

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Songs are viewable by everyone" ON public.songs;
DROP POLICY IF EXISTS "Users can insert their own songs" ON public.songs;
DROP POLICY IF EXISTS "Users can update their own songs" ON public.songs;
DROP POLICY IF EXISTS "Users can delete their own songs" ON public.songs;
DROP POLICY IF EXISTS "Votes are viewable by everyone" ON public.votes;
DROP POLICY IF EXISTS "Users can insert their own votes" ON public.votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON public.votes;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Users can insert their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can view their own song changes" ON public.song_changes;
DROP POLICY IF EXISTS "Users can insert their own song changes" ON public.song_changes;

-- ============================================
-- FIXED PROFILES POLICIES
-- ============================================

-- Allow anyone to view profiles
CREATE POLICY "profiles_select_policy" 
  ON public.profiles FOR SELECT 
  TO authenticated, anon
  USING (true);

-- Allow authenticated users to insert ANY profile (needed for signup)
CREATE POLICY "profiles_insert_policy" 
  ON public.profiles FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Allow users to update their own profile
CREATE POLICY "profiles_update_policy" 
  ON public.profiles FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- FIXED SONGS POLICIES
-- ============================================

-- Allow anyone to view songs
CREATE POLICY "songs_select_policy" 
  ON public.songs FOR SELECT 
  TO authenticated, anon
  USING (true);

-- Allow authenticated users to insert their own songs
CREATE POLICY "songs_insert_policy" 
  ON public.songs FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own songs
CREATE POLICY "songs_update_policy" 
  ON public.songs FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own songs
CREATE POLICY "songs_delete_policy" 
  ON public.songs FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- FIXED VOTES POLICIES
-- ============================================

-- Allow anyone to view votes
CREATE POLICY "votes_select_policy" 
  ON public.votes FOR SELECT 
  TO authenticated, anon
  USING (true);

-- Allow authenticated users to insert their own votes
CREATE POLICY "votes_insert_policy" 
  ON public.votes FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = voter_id);

-- Allow users to delete their own votes
CREATE POLICY "votes_delete_policy" 
  ON public.votes FOR DELETE 
  TO authenticated
  USING (auth.uid() = voter_id);

-- ============================================
-- FIXED COMMENTS POLICIES
-- ============================================

-- Allow anyone to view comments
CREATE POLICY "comments_select_policy" 
  ON public.comments FOR SELECT 
  TO authenticated, anon
  USING (true);

-- Allow authenticated users to insert their own comments
CREATE POLICY "comments_insert_policy" 
  ON public.comments FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own comments
CREATE POLICY "comments_update_policy" 
  ON public.comments FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "comments_delete_policy" 
  ON public.comments FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- FIXED SONG_CHANGES POLICIES
-- ============================================

-- Allow users to view their own song changes
CREATE POLICY "song_changes_select_policy" 
  ON public.song_changes FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own song changes
CREATE POLICY "song_changes_insert_policy" 
  ON public.song_changes FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- VERIFY POLICIES ARE APPLIED
-- ============================================

-- Run this query to verify all policies exist:
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';
