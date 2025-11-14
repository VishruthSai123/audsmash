# AudSmash - Vercel Deployment Guide

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/audsmash)

## Manual Deployment Steps

### 1. Prerequisites
- Vercel account (free at vercel.com)
- Git repository pushed to GitHub/GitLab/Bitbucket
- Supabase project set up

### 2. Environment Variables
Set these in Vercel Dashboard → Settings → Environment Variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SERPER_API_KEY=your_serper_api_key
```

### 3. Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### 4. Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Add environment variables (see step 2)
5. Click "Deploy"

### 5. Post-Deployment Configuration

#### Update Supabase Redirect URLs
Add your Vercel domain to Supabase:
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add to **Redirect URLs**:
   ```
   https://your-app.vercel.app/
   https://your-app.vercel.app/auth/callback
   ```

#### Update Google OAuth (if using)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
5. Add to **Authorized JavaScript origins**:
   ```
   https://your-app.vercel.app
   ```

### 6. Custom Domain (Optional)
1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update Supabase and Google OAuth URLs with custom domain

## Configuration Files

### vercel.json
- Handles SPA routing (all routes → index.html)
- Sets cache headers for static assets
- Optimizes performance

### Environment Variables Required
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_SERPER_API_KEY`: Serper API key for YouTube search

## Troubleshooting

### Routes Return 404
- Check `vercel.json` rewrites configuration
- Ensure build output is in `dist` folder
- Verify output directory setting in Vercel

### OAuth Not Working
- Verify redirect URLs in Supabase match Vercel domain
- Check Google OAuth authorized redirect URIs
- Ensure environment variables are set correctly

### Build Fails
- Check Node.js version (should be 18.x or higher)
- Verify all dependencies are in package.json
- Check build logs for specific errors

### Assets Not Loading
- Ensure assets use relative paths
- Check public folder structure
- Verify Vite configuration

## Performance Optimization

The deployment is pre-configured with:
- ✅ Static asset caching (1 year)
- ✅ SPA routing optimization
- ✅ Tree-shaking and code splitting
- ✅ Production build minification

## Monitoring

Monitor your deployment:
- **Analytics**: Vercel Dashboard → Analytics
- **Logs**: Vercel Dashboard → Deployments → View Logs
- **Performance**: Vercel Dashboard → Speed Insights

## Automatic Deployments

Once connected to Git:
- **Production**: Push to `main` branch
- **Preview**: Push to any other branch or pull request

Each push triggers automatic deployment!
