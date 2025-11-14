# 🚀 Pre-Deployment Checklist

Complete this checklist before deploying to Vercel:

## ✅ Code Preparation

- [ ] All features tested locally
- [ ] Build succeeds without errors: `npm run build`
- [ ] No console errors in production build
- [ ] All routes working with React Router
- [ ] Mobile responsive design verified

## ✅ Environment Variables

- [ ] `.env` file exists locally (not committed)
- [ ] All required variables documented in `.env.example`
- [ ] Environment variables ready for Vercel:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_SERPER_API_KEY`

## ✅ Supabase Configuration

- [ ] Database tables created (see `database/schema.sql`)
- [ ] RLS policies enabled and tested
- [ ] Auth providers configured (Email, Google OAuth)
- [ ] Storage buckets created (if needed)
- [ ] Redirect URLs ready to add production domain

## ✅ File Structure

- [ ] `vercel.json` exists with routing config
- [ ] `public/` folder contains assets (audsmash1.png)
- [ ] `index.html` updated with proper meta tags
- [ ] `.gitignore` excludes `.env` and `.vercel`

## ✅ Git Repository

- [ ] All changes committed
- [ ] Repository pushed to GitHub/GitLab/Bitbucket
- [ ] `.env` file NOT committed
- [ ] Build artifacts (`dist/`) not committed

## ✅ Vercel Setup

- [ ] Vercel account created
- [ ] Repository connected to Vercel
- [ ] Build settings configured:
  - Framework: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Environment variables added in Vercel dashboard

## ✅ Post-Deployment Tasks

After first deployment:

- [ ] Note your Vercel production URL: `https://your-app.vercel.app`
- [ ] Add Vercel URL to Supabase redirect URLs
- [ ] Update Google OAuth authorized URIs (if using)
- [ ] Test all features on production URL
- [ ] Verify Google sign-in works
- [ ] Check all routes are accessible
- [ ] Test on mobile device

## ✅ Performance & SEO

- [ ] Page title and meta description set
- [ ] Favicon configured (`audsmash1.png`)
- [ ] Theme color meta tag added
- [ ] Assets optimized (images compressed)
- [ ] Cache headers configured in `vercel.json`

## 📋 Quick Deploy Commands

```bash
# Test build locally
npm run build
npm run preview

# Deploy via Vercel CLI
vercel
```

## 🔗 Important Links to Update

After deployment, update these in your systems:

1. **Supabase Dashboard** → Authentication → URL Configuration
   - Add: `https://your-app.vercel.app/`
   - Add: `https://your-app.vercel.app/auth/callback`

2. **Google Cloud Console** (if using OAuth)
   - Authorized JavaScript origins: `https://your-app.vercel.app`
   - Authorized redirect URIs: `https://PROJECT_REF.supabase.co/auth/v1/callback`

## ✨ You're Ready to Deploy!

Once all boxes are checked, proceed with deployment via:
- Vercel Dashboard: Import Git repository
- Vercel CLI: Run `vercel` command

See `DEPLOYMENT.md` for detailed deployment instructions.
