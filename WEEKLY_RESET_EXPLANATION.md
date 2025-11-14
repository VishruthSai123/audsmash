# Weekly Reset & Song Management - Current Implementation

## ⚠️ IMPORTANT: Current System Issues

### Current Behavior (Has Problems)

#### 1. Weekly Leaderboard Reset
**How it works NOW:**
- Uses `week_year` field (e.g., "2025-W46") to track weeks
- When a new week starts (Monday), `getCurrentWeekYear()` returns a new week value
- Queries filter by current `week_year`, so old weeks' data is **hidden** but **NOT deleted**
- `total_weekly_votes` in profiles table is recalculated based on current week only

**Problem:** 
- ✅ Leaderboard automatically shows only current week's votes
- ❌ BUT users lose ALL their votes each week (starts from 0)
- ❌ No cumulative voting history across weeks

#### 2. Song Changes
**How it works NOW:**
```typescript
// When user adds a new song:
1. Sets old song to is_active = false
2. Adds new song with is_active = true
3. Both songs remain in database
4. Only is_active = true songs show in Listen page
```

**Problem:**
- ✅ Old songs are preserved in database
- ❌ User can only have ONE active song at a time
- ❌ Replaces the current song instead of adding to collection
- ❌ Old song is hidden from Listen page but visible in Profile history

### What You're Asking For

#### 1. Cumulative Voting System
**You want:**
- Users keep accumulating votes across weeks
- Old votes from previous weeks are preserved
- New week = fresh votes ADDED to existing total
- Leaderboard shows total votes ever, not just this week

**Example:**
- Week 1: User gets 50 votes → Total: 50
- Week 2: User gets 30 votes → Total: 80 (50 + 30)
- Week 3: User gets 20 votes → Total: 100 (80 + 20)

#### 2. Multiple Active Songs Per User
**You want:**
- Users can have multiple songs active at once
- Adding new song doesn't deactivate old songs
- All active songs appear in Listen page
- Users build a collection of songs over time

**Example:**
- Week 1: User adds Song A → Active songs: [A]
- Week 2: User adds Song B → Active songs: [A, B]
- Week 3: User adds Song C → Active songs: [A, B, C]

## 🔧 Changes Needed

### Option A: Cumulative Votes (Easier)
**Keep:** Current song replacement behavior (1 active song per user)
**Change:** Make votes cumulative across weeks

**Implementation:**
1. Remove `week_year` filter from vote counting
2. Change leaderboard to show total votes across ALL weeks
3. Keep `week_year` in votes table for history tracking only
4. Update `total_weekly_votes` to `total_votes` (rename for clarity)

**Pros:**
- Simple to implement
- Clear competition model
- Easy to understand

**Cons:**
- Users still can only have 1 active song at a time
- Need to replace song to change it

### Option B: Multiple Active Songs (Complex)
**Keep:** Week-based tracking
**Change:** Allow multiple active songs per user

**Implementation:**
1. Remove `ensure_one_active_song` trigger
2. Allow users to have unlimited active songs
3. Votes distribute across all their songs
4. Leaderboard counts votes for ALL user's active songs

**Pros:**
- Users can showcase multiple songs
- Build a playlist over time

**Cons:**
- More complex to manage
- Could have 100s of songs in Listen page
- Vote splitting across songs

### Option C: Hybrid Approach (Recommended)
**Combine both:** Cumulative votes + Limited active songs

**Implementation:**
1. Remove `week_year` filter from leaderboard (cumulative votes)
2. Allow 3-5 active songs per user (modify trigger)
3. Users can add new songs without replacing old ones
4. Old songs auto-deactivate after X weeks or vote threshold

**Pros:**
- Best of both worlds
- Keeps Listen page manageable
- Natural rotation of songs

**Cons:**
- Most complex to implement
- Need UI for managing multiple songs

## 📋 Current Database Schema Review

```sql
-- Songs table
is_active BOOLEAN DEFAULT TRUE  -- Only 1 can be true per user (via trigger)
week_year TEXT NOT NULL         -- Used to filter by week

-- Votes table  
week_year TEXT NOT NULL         -- Tracks which week vote was cast
UNIQUE(song_id, voter_id, week_year)  -- One vote per song per user per week

-- Trigger
ensure_one_active_song()        -- Forces only 1 active song per user
```

## 🎯 Recommended Solution

Based on your requirements, I recommend **Option C (Hybrid)**:

### Step 1: Make Votes Cumulative
- Leaderboard shows total votes across all time
- Remove week filter from leaderboard queries
- Keep `week_year` for analytics/history

### Step 2: Allow Multiple Active Songs
- Modify trigger to allow 3 active songs per user
- Add "Song Slots" UI showing which slots are filled
- Oldest song auto-deactivates when adding 4th song

### Step 3: Add Song Management UI
- Profile page shows all active songs
- User can manually deactivate songs
- Add "Featured Song" concept for main display

## Current System Summary

### ✅ What Works Well:
1. Vote uniqueness (can't vote twice)
2. Song history preserved
3. Weekly tracking for analytics
4. Database integrity maintained

### ⚠️ What Needs Clarification:
1. **Vote Reset Behavior**: Currently votes reset weekly (hidden via filter)
2. **Song Replacement**: Currently replaces active song instead of adding
3. **Leaderboard Logic**: Shows only current week's competition

### 🔄 Migration Path

If you want to implement cumulative + multiple songs:

1. **Phase 1: Make votes cumulative** (Low risk)
   - Update leaderboard queries
   - Test with existing data
   - Deploy

2. **Phase 2: Allow multiple songs** (Medium risk)
   - Modify database trigger
   - Update UI to show multiple songs
   - Add song management interface
   - Deploy

3. **Phase 3: Polish** (Low risk)
   - Add slot limits
   - Add featured song selection
   - Add auto-deactivation rules

## Questions to Answer

Before implementing changes, decide:

1. **Vote Accumulation:**
   - [ ] Keep weekly reset (fresh competition each week)
   - [ ] Make cumulative (all-time leaderboard)
   - [ ] Hybrid (show both weekly + all-time boards)

2. **Active Song Limit:**
   - [ ] Keep 1 song per user (current)
   - [ ] Allow unlimited songs
   - [ ] Allow 3-5 songs per user (recommended)

3. **Song Management:**
   - [ ] Auto-replace oldest when limit reached
   - [ ] Let user manually choose which to deactivate
   - [ ] Time-based auto-deactivation (e.g., 4 weeks)

4. **Leaderboard Display:**
   - [ ] Weekly competition only
   - [ ] All-time leaderboard only  
   - [ ] Both (tabs for Weekly / All-Time)

Let me know your preferences and I'll implement the changes!
