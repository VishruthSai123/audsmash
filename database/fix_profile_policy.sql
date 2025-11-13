-- ============================================
-- EMERGENCY FIX FOR PROFILE CREATION
-- Run this if you're still getting 401 errors
-- ============================================

-- First, disable RLS temporarily to clean up
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing profile policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create super permissive policies for authenticated users
CREATE POLICY "profiles_select_all" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "profiles_insert_all" 
  ON public.profiles FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "profiles_update_own" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" 
  ON public.profiles FOR DELETE 
  USING (auth.uid() = id);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';
