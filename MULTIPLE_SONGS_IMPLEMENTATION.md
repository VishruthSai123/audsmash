# Multiple Active Songs Implementation ✅

## Changes Implemented

Based on your selections (1.B, 2.C, 3.C), I've implemented:

### 1. ✅ Multiple Active Songs (Max 5 per User)
**What Changed:**
- Users can now have **up to 5 active songs** simultaneously
- All 5 songs appear on the Listen page
- All 5 songs accumulate votes independently

**How It Works:**
```
User adds Song A → Active: [A]
User adds Song B → Active: [A, B]
User adds Song C → Active: [A, B, C]
User adds Song D → Active: [A, B, C, D]
User adds Song E → Active: [A, B, C, D, E]
User adds Song F → Active: [B, C, D, E, F]  (A auto-deactivated)
```

### 2. ✅ Weekly Competition Maintained
**What Stayed:**
- Leaderboard still resets **every Monday**
- Uses `week_year` format (e.g., "2025-W46")
- Competition is **weekly**, not all-time
- Fresh start each week for fair competition

**How It Works:**
```
Week 1 (2025-W46): User gets 50 votes → Leaderboard shows 50
Week 2 (2025-W47): User gets 30 votes → Leaderboard shows 30 (not 80!)
Week 3 (2025-W48): User gets 20 votes → Leaderboard shows 20
```

### 3. ✅ Auto-Deactivation of Oldest
**What Changed:**
- When user tries to add **6th song**, oldest song is automatically deactivated
- No manual management needed
- Oldest determined by `created_at` timestamp
- Deactivated songs move to "Past Entries" on profile

## Database Changes

### Modified Trigger Function
**Before:**
```sql
-- Only allowed 1 active song
ensure_one_active_song()
  → Deactivated ALL other songs
```

**After:**
```sql
-- Allows up to 5 active songs
ensure_max_active_songs()
  → Counts active songs
  → If count >= 5, deactivates oldest
  → Otherwise, allows new song
```

### Migration Script Created
**File:** `database/migration_multiple_songs.sql`

**To Apply:**
1. Go to Supabase SQL Editor
2. Copy contents of `migration_multiple_songs.sql`
3. Execute the SQL
4. Done! (Safe to run, no data loss)

## Frontend Changes

### Upload Page
**Before:**
```typescript
// Deactivated ALL existing songs
if (existingSongs) {
  await supabase.update({ is_active: false })
}
```

**After:**
```typescript
// Counts active songs
// Tracks oldest song for logging
// Database trigger handles deactivation
const activeCount = activeSongs?.length || 0;
// Shows: "Song added! (3/5 slots used)"
```

### Profile Page
**Before:**
```typescript
// Loaded only 1 active song
.maybeSingle()
```

**After:**
```typescript
// Loads ALL active songs (up to 5)
.order('created_at', { ascending: false })
// Shows most recent as "Current Song"
// Others could be displayed separately
```

### Listen Page
**No Changes Needed!**
- Already loads all songs where `is_active = true`
- Will automatically show all 5 user songs
- Vote system works per song (unchanged)

## User Experience Flow

### Adding Songs
1. User searches for video → Selects video
2. Clicks "Add Song" → System checks active count
3. If < 5: Song added directly ✅
4. If = 5: Oldest deactivated, new song added ✅
5. Message shows: "Song added! (X/5 slots used)"

### Voting System
- Users can vote for **each song independently**
- If User A has 3 active songs, you can vote for all 3
- Each song tracks its own vote count
- Leaderboard counts votes across ALL user's active songs

### Weekly Reset
- Every Monday at midnight
- `getCurrentWeekYear()` returns new week (e.g., W47)
- All queries filter by new week
- Previous week's votes are hidden (but preserved in DB)
- Everyone starts fresh competition

## Vote Counting Logic

### Per User Leaderboard Score
```typescript
// User has 3 active songs
Song A: 20 votes
Song B: 15 votes  
Song C: 10 votes
-----------------
User Total: 45 votes (on leaderboard)
```

### Weekly Competition
```
Week 46: User has 50 total votes
  → Monday arrives → Week 47 starts
Week 47: User has 0 votes (fresh start)
  → User must get new votes this week
```

## Benefits of This System

### ✅ Advantages
1. **More Content:** Listen page has more variety (up to 5x songs)
2. **User Choice:** Users can showcase multiple favorites
3. **Natural Rotation:** Oldest songs phase out automatically
4. **Fair Competition:** Weekly reset keeps it competitive
5. **Easy Management:** No manual deactivation needed

### ⚠️ Considerations
1. **Listen Page Volume:** Could have 100+ songs if 20+ active users
2. **Vote Splitting:** User's votes spread across 5 songs (dilution)
3. **Strategy:** Users might game system by adding 5 similar songs

## Testing Checklist

Before deploying, test:

- [ ] Run migration SQL in Supabase SQL Editor
- [ ] Add 1st song → Should work, show (1/5 slots)
- [ ] Add 2nd song → Both active, show (2/5 slots)
- [ ] Add 5th song → All active, show (5/5 slots)
- [ ] Add 6th song → Oldest deactivated, new added, show (5/5 slots)
- [ ] Check Listen page → All active songs visible
- [ ] Vote on multiple songs from same user → Works independently
- [ ] Check Profile → Current Song + Past Entries sections
- [ ] Check Leaderboard → Total votes = sum of all active songs
- [ ] Wait for Monday → New week, votes reset to 0

## Migration Steps

### 1. Update Database (Required!)
```sql
-- In Supabase SQL Editor, run:
database/migration_multiple_songs.sql
```

### 2. Deploy Code
```bash
npm run build
# Deploy to Vercel
```

### 3. Verify
- Check Listen page loads correctly
- Try adding songs (should allow up to 5)
- Verify voting works on all songs

## Rollback Plan

If you need to revert:

```sql
-- Revert to 1 song per user
DROP TRIGGER ensure_max_active_songs_trigger ON public.songs;
DROP FUNCTION ensure_max_active_songs();

-- Restore old function
CREATE OR REPLACE FUNCTION ensure_one_active_song()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = TRUE THEN
    UPDATE public.songs
    SET is_active = FALSE
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_active = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_one_active_song_trigger
  BEFORE INSERT OR UPDATE ON public.songs
  FOR EACH ROW EXECUTE FUNCTION ensure_one_active_song();
```

## Future Enhancements (Optional)

### Could Add Later:
1. **Song Management UI** - Let users manually deactivate songs
2. **Featured Song** - Mark 1 of 5 as "featured" for profile highlight
3. **Slot Purchase** - Allow users to buy more than 5 slots
4. **Category Limits** - Max 1 song per category per user
5. **Time Limits** - Songs auto-deactivate after 4 weeks
6. **All-Time Leaderboard** - Separate tab for lifetime total votes

## Summary

✅ **Multiple Songs:** Users can have 5 active songs
✅ **Weekly Competition:** Leaderboard resets every Monday  
✅ **Auto-Management:** Oldest song removed when limit reached
✅ **Database Migration:** Ready to apply (`migration_multiple_songs.sql`)
✅ **Code Updated:** Upload & Profile pages modified
✅ **Build Successful:** Ready to deploy

**Next Step:** Run the migration SQL in Supabase, then deploy! 🚀
