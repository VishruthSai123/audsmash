# AudSmash AI Coding Agent Instructions

## Project Overview
**AudSmash** is a weekly music competition web app where users add YouTube songs, vote on favorites, and compete on leaderboards. Built with React 19 + TypeScript + Vite for frontend, Supabase for backend, and optional Express API for search.

### Core Architecture
- **Frontend**: React SPA with React Router v7 navigation
- **Auth**: Supabase email/password + Google OAuth with automatic profile creation
- **Database**: Supabase PostgreSQL with Row Level Security (RLS) policies
- **Search**: Serper API for YouTube videos (direct frontend or Express backend proxy)
- **Real-time**: Supabase postgres_changes subscriptions for live updates

## Critical Data Patterns

### Week-Year Format
The app tracks competitions by week: `YYYY-Www` format (e.g., `2025-W46`). This is calculated in `supabase.ts`:
```typescript
getCurrentWeekYear(): string => `${year}-W${week.toString().padStart(2, '0')}`
```
**Important**: Use this helper consistently when querying songs, votes, or leaderboard data.

### Key Database Constraints
- **Songs**: One `is_active` song per user per week (enforced at DB level)
- **Votes**: Unique constraint `(song_id, voter_id, week_year)` - prevents duplicate votes
- **Song Changes**: Unique `(user_id, change_date)` - limits daily song swaps to one per user
- **Profiles**: Created automatically on first auth or signup with username + avatar

### Profile Avatar Logic (AuthContext)
- Google OAuth: Auto-uses Google avatar on first login
- Email signup: Uses Dicebear avatar with username seed
- **Pattern**: Check `avatar_url?.includes('dicebear.com')` to detect if avatar is default

## Component Architecture

### Page Structure (`src/pages/`)
- **Auth.tsx**: Sign-up/sign-in with email/Google (public)
- **Leaderboard.tsx**: Top users ranked by weekly votes (public, auto-updates)
- **Listen.tsx**: Browse/vote on songs with embedded YouTube players (public)
- **Upload.tsx**: Add/change weekly song with custom start time (protected)
- **Search.tsx**: Query YouTube videos via Serper (protected)
- **Profile.tsx**: User stats, vote history, song history (public, dynamic by userId)

### Navigation Pattern
- Routes defined in `App.tsx` with `ProtectedRoute` wrapper
- Protected routes check auth state via `useAuth()` hook
- Redirects unauthenticated users to `/auth`
- Loading state renders `<Loader />` component

### Real-time Subscriptions Pattern
Used in `Listen.tsx`:
```typescript
const subscription = supabase
  .channel('songs_changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'songs' }, () => {
    loadSongs(); // Refetch on any change
  })
  .subscribe();
// Cleanup: subscription.unsubscribe() in return
```

## Service Patterns

### YouTube Search (`src/services/youtube.service.ts`)
Two-tier fallback architecture:
1. **Try backend API first** (`POST ${API_URL}/api/search/youtube`) - 3 second timeout
2. **Fallback to direct Serper** if backend unavailable or `VITE_SERPER_API_KEY` set

Extract video IDs from URLs using regex patterns - handles YouTube URLs, youtu.be, and bare IDs.

### Supabase Client (`src/lib/supabase.ts`)
Configured with:
- PKCE auth flow for security
- Auto token refresh enabled
- Session persistence
- Environment variable validation on init

## Common Development Workflows

### Run Development
```bash
npm run dev                    # Frontend at http://localhost:5173
cd api && npm run dev          # Backend at http://localhost:3001
```

### Build & Deploy
```bash
npm run build                  # TypeScript + Vite build to dist/
npm run lint                   # ESLint check
```
Deploys to Vercel: Set `VITE_*` environment variables in Vercel dashboard.

### Environment Variables
- **Frontend** (Vite prefixed): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SERPER_API_KEY`, `VITE_API_URL`
- **Backend** (.env): Same keys (reuses frontend .env via `../`)

### Database Setup
```sql
-- Run in Supabase SQL Editor (database/schema.sql)
-- Creates tables, RLS policies, indexes, triggers
-- Policies enforce: users own their songs/changes, all see votes/comments
```

## Type System & Database

### Generated Types
Database types in `src/types/database.types.ts` auto-generated from Supabase schema. **Includes pragmatic `as any` casts** for Supabase quirks (profiles insertable without auth context).

### Frontend Types (`src/types/index.ts`)
- `Song`: Includes optional `profile`, `vote_count`, `user_voted` computed fields
- `Comment`: Includes optional `profile` for author info
- `LeaderboardEntry`: Groups profile + votes + current_song
- `CATEGORIES`: Fixed array of 11 music genres

### Supabase Type Casting
Pattern: `.eq('id', userId)` + `.maybeSingle()` for optional results. Cast directly: `as { data: Type | null }`.

## Authentication Flow

### Sign Up
1. Email/password registered with Supabase Auth
2. Profile auto-created with username + avatar URL
3. **Race condition handled**: Check existing profile before insert

### Sign In
- Email/password: Direct credential check
- Google OAuth: PKCE flow, redirects to `/auth/callback`

### OAuth Setup
- Google: Add Supabase project URL to "Authorized redirect URIs"
- Supabase: Add app URL to "Redirect URLs" in Auth settings

### Auth State Management
- `AuthContext` provides `user`, `session`, `loading`, auth methods
- 8-second loading timeout (prevents infinite waits on auth failure)
- `onAuthStateChange` listener updates state on token refresh

## Styling Conventions

### CSS Organization
- Global styles: `src/index.css` (CSS variables, reset)
- Component styles: `src/App.css` (layout, theme, gradients)
- **Pattern**: Gradient backgrounds, responsive flexbox, mobile-first
- Responsive breakpoints used for tablet/desktop layouts

### Icons & Images
- **react-icons**: Import from `'react-icons/fa'` for Font Awesome icons
- **Assets**: Images in `src/assets/` (e.g., `audsmash1.png` logo)
- **Avatars**: Dicebear API for generated avatars or user-provided URLs

## Error Handling

### Supabase RLS Errors
- Code `42501` = RLS policy violation (check auth context)
- Code `23505` = Unique constraint (ignore if race condition expected)

### Auth/Profile Errors
- `SIGNED_IN` event: Create profile if missing
- `USER_UPDATED`, `TOKEN_REFRESHED`: Skip profile creation (avoid race conditions)

### Search Errors
- Missing API key: Show user-facing error "Configure VITE_SERPER_API_KEY"
- Backend timeout: Auto-fallback to direct Serper call

## Performance Optimizations

### Vite Build Config
- Manual chunk splitting: `react-vendor`, `supabase`, `icons`, `youtube`
- 600KB chunk size warning limit
- Tree-shaking + minification enabled

### Database
- Indexes on: `user_id`, `week_year`, `is_active`, `(user_id, change_date)`
- Triggers auto-update vote counts in `songs` table
- Limit queries to current week to reduce dataset size

### Real-time Subscriptions
- Use `channel()` for selective subscriptions (avoid all-table listen)
- Unsubscribe in cleanup to prevent memory leaks
- Batch refetches on multiple events

## Deployment Checklist
- [ ] Set environment variables in hosting platform (Vercel/Netlify)
- [ ] Run `database/schema.sql` in Supabase SQL Editor
- [ ] Add deployment domain to Supabase OAuth/redirect URLs
- [ ] Verify `.env` is in `.gitignore` (never commit secrets)
- [ ] Test with production Supabase keys before deploying
- See `PRE_DEPLOY_CHECKLIST.md` and `DEPLOYMENT.md` for detailed steps

## Code Patterns to Follow

### Loading States
- Use `<Loader />` component for spinners
- Show loading screen with message for full-page auth wait
- Set timeouts on async operations to unblock UI

### Form Submissions
- Prevent default with `e.preventDefault()`
- Validate input before sending to Supabase
- Show error/success messages via state
- Disable submit button during loading

### Date Handling
- Always use ISO format for dates: `.split('T')[0]` for YYYY-MM-DD
- Week calculation uses ISO week numbering (Monday start)
- Store times with timezone via `TIMESTAMP WITH TIME ZONE` in DB

### Component Composition
- Extract reusable components to `src/components/` (Avatar, Loader, ErrorBoundary)
- Use context for global state (auth) + React hooks for component state
- Pass types explicitly: `interface Props { children: React.ReactNode }`

## File Structure Reference
```
src/
├── components/       # Reusable UI (TopBar, BottomNav, Avatar, Loader, ErrorBoundary)
├── contexts/        # AuthContext for global auth state
├── lib/             # supabase.ts client + helpers
├── pages/           # Route-mapped pages with business logic
├── services/        # youtube.service.ts for external APIs
├── types/           # database.types.ts (Supabase) + index.ts (app types)
├── assets/          # Images, logos
├── App.tsx          # Router + ProtectedRoute wrapper
├── main.tsx         # React root mount
├── App.css          # Global + component styles
└── index.css        # Global CSS variables + reset
```

## External Dependencies
- **@supabase/supabase-js**: Database + auth
- **react-router-dom v7**: Client-side routing
- **react-youtube**: YouTube player embedding
- **axios**: HTTP client (YouTube search)
- **react-icons**: Icon library
- **react-query**: *Not actively used, consider deprecating*

## Known Quirks & Workarounds

1. **Profile Creation Race Condition**: Check if profile exists before inserting to avoid duplicate key errors
2. **Google Avatar Fallback**: Only update avatar from Google on first OAuth login if dicebear default detected
3. **Song Active Constraint**: DB enforces one active song per user; verify `is_active` logic before updates
4. **Auth Loading Timeout**: 8-second timeout prevents infinite loading if Supabase unreachable
5. **Backend Fallback**: YouTube search tries backend first, falls back to direct Serper if timeout
