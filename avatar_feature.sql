-- Avatar Feature SQL
-- This feature uses the existing avatar_url column in profiles table
-- No schema changes needed!

-- The profiles table already has:
-- - avatar_url (text): Stores the user's avatar URL

-- Users can:
-- 1. View a gallery of avatar options (generated via dicebear API)
-- 2. Select a new avatar from the gallery
-- 3. Update their profile with the new avatar URL

-- The avatar_url column accepts any valid URL, including:
-- - Dicebear avatar URLs (https://api.dicebear.com/7.x/...)
-- - Google profile pictures (from OAuth)
-- - Any other avatar service URLs

-- Example update query (handled by the app):
-- UPDATE profiles 
-- SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=username'
-- WHERE id = 'user-id';

-- No additional SQL commands needed!
-- The existing profiles table structure supports this feature.
