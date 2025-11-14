-- Migration: Allow Multiple Active Songs Per User (Max 5)
-- This migration updates the system to allow users to have up to 5 active songs
-- Oldest song is auto-deactivated when adding a 6th song

-- Step 1: Drop the old trigger and function
DROP TRIGGER IF EXISTS ensure_one_active_song_trigger ON public.songs;
DROP FUNCTION IF EXISTS ensure_one_active_song();

-- Step 2: Create new function for max 5 active songs
CREATE OR REPLACE FUNCTION ensure_max_active_songs()
RETURNS TRIGGER AS $$
DECLARE
  active_count INTEGER;
  oldest_song_id UUID;
BEGIN
  IF NEW.is_active = TRUE THEN
    -- Count current active songs for this user
    SELECT COUNT(*) INTO active_count
    FROM public.songs
    WHERE user_id = NEW.user_id AND is_active = TRUE AND id != NEW.id;

    -- If user already has 5 active songs, deactivate the oldest one
    IF active_count >= 5 THEN
      SELECT id INTO oldest_song_id
      FROM public.songs
      WHERE user_id = NEW.user_id AND is_active = TRUE AND id != NEW.id
      ORDER BY created_at ASC
      LIMIT 1;

      UPDATE public.songs
      SET is_active = FALSE
      WHERE id = oldest_song_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create new trigger
CREATE TRIGGER ensure_max_active_songs_trigger
  BEFORE INSERT OR UPDATE ON public.songs
  FOR EACH ROW EXECUTE FUNCTION ensure_max_active_songs();

-- Migration complete!
-- Users can now have up to 5 active songs
-- Oldest song automatically deactivates when limit is reached
