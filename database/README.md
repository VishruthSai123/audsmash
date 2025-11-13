# Database Setup Instructions

## Steps to set up your Supabase database:

1. **Create a Supabase project** at https://supabase.com

2. **Run the SQL schema**:
   - Go to your Supabase Dashboard
   - Navigate to SQL Editor
   - Copy the contents of `schema.sql`
   - Paste and execute it

3. **Get your credentials**:
   - Go to Project Settings → API
   - Copy your `Project URL` (VITE_SUPABASE_URL)
   - Copy your `anon public` key (VITE_SUPABASE_ANON_KEY)

4. **Add credentials to your app**:
   - Create a `.env` file in the root directory
   - Add your Supabase credentials (see `.env.example`)

5. **Enable Email Auth** (Optional):
   - Go to Authentication → Providers
   - Enable Email provider
   - Configure email templates as needed

## Database Schema Overview

### Tables:
- **profiles**: User profiles extending Supabase auth
- **songs**: YouTube songs added by users
- **votes**: Voting system (one vote per user per song per week)
- **comments**: Comments on songs
- **song_changes**: Tracks daily song changes (limit 1 per day)

### Key Features:
- Row Level Security (RLS) enabled on all tables
- Automatic timestamp updates
- Weekly vote counting
- One active song per user enforcement
- Daily song change limit tracking

### Week Format:
Weeks are tracked using ISO week-year format: `YYYY-Www`
Example: `2025-W46` represents week 46 of 2025
