# 🚀 Quick Start Guide - AudSmash

## Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] Supabase account created
- [ ] Serper API key obtained

## 5-Minute Setup

### Step 1: Database (2 min)
1. Go to https://supabase.com
2. Create new project
3. Open SQL Editor
4. Copy/paste ALL content from `database/schema.sql`
5. Click "Run"

### Step 2: Environment Variables (1 min)
Edit `.env` file:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SERPER_API_KEY=xxxxxxxxxxxxx
```

**Get these:**
- Supabase: Project Settings → API
- Serper: https://serper.dev (free trial)

### Step 3: Install & Run (2 min)
```bash
npm install
npm run dev
```

Open http://localhost:5173 🎉

## First Use

1. Click **Sign Up**
2. Enter email, password, username
3. (Check email for verification if required)
4. Go to **Search** tab
5. Search for a song
6. Click **Add**
7. Choose category & start time
8. Click **Add Song**
9. Go to **Listen** tab
10. Vote and comment! 🎵

## Optional: Backend API

For production (keeps API keys secure):

```bash
cd api
npm install
npm run dev
```

Runs at http://localhost:3001

## Deployment Quick Steps

### Build
```bash
npm run build
```

### Deploy Frontend
- Upload `dist/` folder to Vercel/Netlify
- Add environment variables
- Done!

### Deploy Backend (Optional)
- Push `api/` folder to Railway/Render
- Add `VITE_SERPER_API_KEY` env var
- Update `VITE_API_URL` in frontend `.env`

## Common Issues

### Can't connect to Supabase
✅ Check `.env` has correct URL and key  
✅ Verify project is active in Supabase dashboard

### YouTube search not working
✅ Check Serper API key is valid  
✅ Check API quota at serper.dev  
✅ Try starting backend API

### Build fails
✅ Run `npm install` again  
✅ Check Node version is 18+  
✅ Delete `node_modules` and reinstall

## Project Status

✅ All features implemented  
✅ Build successful  
✅ Ready for development  
🚀 Ready to deploy  

## Need Help?

See `README.md` for detailed documentation.

---

**You're all set! Happy competing! 🎵🏆**
