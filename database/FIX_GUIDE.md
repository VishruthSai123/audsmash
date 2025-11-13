# 🔧 Database Fix Guide

## Problem Summary
Your app is getting 401/406 errors due to Row Level Security (RLS) policy issues.

## Quick Fix Steps

### Step 1: Run the Fix SQL

1. Go to your Supabase Dashboard
2. Open **SQL Editor**
3. Copy and paste **ALL** content from `database/fix_policies.sql`
4. Click **Run**

This will:
- Remove old broken policies
- Add new working policies
- Fix authentication issues

### Step 2: Verify Tables Exist

Run this query to check tables:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- profiles
- songs
- votes
- comments
- song_changes

### Step 3: If Tables Don't Exist

Run the complete schema from `database/schema.sql` first, then run `fix_policies.sql`

### Step 4: Verify Policies

Run this to check policies are applied:

```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

You should see policies for all 5 tables.

### Step 5: Test Authentication

1. Restart your dev server: `npm run dev`
2. Try to sign up with a new account
3. Check Supabase Dashboard → Authentication → Users
4. Check Database → Table Editor → profiles

## Common Issues

### Issue: "new row violates row-level security policy"
**Fix**: Run `fix_policies.sql` - the INSERT policy was too restrictive

### Issue: "406 Not Acceptable"
**Fix**: This happens when RLS blocks the query. The fix_policies.sql allows authenticated and anon users.

### Issue: "Cannot coerce result to single JSON object"
**Fix**: Profile doesn't exist. Sign up again after running fix_policies.sql

### Issue: "violates foreign key constraint songs_user_id_fkey"
**Fix**: Profile wasn't created. Run fix_policies.sql and sign up again.

## Manual Profile Creation (If Needed)

If you already have a user but no profile:

1. Get your user ID from Supabase Dashboard → Authentication → Users
2. Run this SQL (replace YOUR_USER_ID):

```sql
INSERT INTO public.profiles (id, username, avatar_url, total_weekly_votes)
VALUES (
  'YOUR_USER_ID',
  'your_username',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=your_username',
  0
);
```

## Clean Slate (Nuclear Option)

If nothing works, start fresh:

```sql
-- Delete all data and policies
DROP TABLE IF EXISTS public.song_changes CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.votes CASCADE;
DROP TABLE IF EXISTS public.songs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS get_current_week_year() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_weekly_votes() CASCADE;
DROP FUNCTION IF EXISTS ensure_one_active_song() CASCADE;
```

Then run `database/schema.sql` completely, followed by `database/fix_policies.sql`.

## Verification Checklist

✅ Tables exist (5 tables)  
✅ RLS is enabled on all tables  
✅ Policies exist (3+ per table)  
✅ Can sign up without errors  
✅ Profile appears in profiles table  
✅ Can add songs  
✅ Can vote and comment  

---

**Still having issues?** Make sure:
1. Your `.env` has correct Supabase URL and key
2. You're using the **anon/public** key (not the service_role key)
3. Your Supabase project is active (not paused)
