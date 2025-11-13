# Google Authentication Setup Guide for AudSmash

## ✅ Code Implementation Complete

The following has been implemented:
- Google OAuth sign-in button on Auth page
- Automatic profile creation for Google users
- Proper routing after authentication
- No localhost errors - uses dynamic URLs

## 🚀 Quick Setup Checklist

**CRITICAL: Follow these steps IN ORDER**

1. ✅ Get Google OAuth credentials from Google Cloud Console
2. ✅ Add Supabase callback URL to Google Console: 
   ```
   https://dyhmsvbdupnpweccfpld.supabase.co/auth/v1/callback
   ```
3. ✅ **FIRST** - In Supabase Dashboard > Authentication > URL Configuration:
   - Set **Site URL** to: `http://localhost:5173`
   - Click **Add URL** under "Redirect URLs" and add: `http://localhost:5173`
   - Save changes

4. ✅ **THEN** - In Supabase Dashboard > Authentication > Providers > Google:
   - Enable Google
   - Paste your Google Client ID
   - Paste your Google Client Secret
   - Save

5. ✅ Test by clicking "Continue with Google" button

**Your Supabase Project Reference:** `dyhmsvbdupnpweccfpld`

**IMPORTANT:** Make sure you add `http://localhost:5173` (WITHOUT the `/**`) to the Redirect URLs list in Supabase.

## 🔧 Supabase Configuration Steps

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Name it "AudSmash"

### Step 2: Configure Authorized Redirect URIs in Google

**IMPORTANT:** You only need to add the Supabase callback URL, NOT your app URLs.

Add this URI to your Google OAuth client:

**Supabase Auth Callback (REQUIRED):**
```
https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
```

To find your Supabase project reference:
- Go to your Supabase dashboard
- Project Settings > API
- Copy the "Project URL" - the part between `https://` and `.supabase.co`

Example: If your URL is `https://dyhmsvbdupnpweccfpld.supabase.co`, then add:
```
https://dyhmsvbdupnpweccfpld.supabase.co/auth/v1/callback
```

**That's it!** Don't add localhost or your domain URLs here - only the Supabase callback.

### Step 3: Copy Google Credentials

From the Google Cloud Console, copy:
- **Client ID** (looks like: 123456789-abc123.apps.googleusercontent.com)
- **Client Secret** (looks like: GOCSPX-abc123...)

### Step 4: Configure Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Google** in the list
4. Enable Google provider
5. Paste your Google **Client ID**
6. Paste your Google **Client Secret**
7. Click **Save**

### Step 5: Update Site URL in Supabase (DO THIS FIRST!)

⚠️ **THIS IS THE MOST CRITICAL STEP** - Do this BEFORE enabling Google provider!

1. Go to **Authentication** > **URL Configuration**

2. Set **Site URL** to:
   ```
   http://localhost:5173
   ```
   (No trailing slash!)

3. Under **Redirect URLs**, click **Add URL** and add:
   ```
   http://localhost:5173
   ```
   (Exactly as shown - no wildcards, no trailing slash)

4. Click **Save**

5. Wait a few seconds for changes to propagate

**For Production Later:**
- Site URL: `https://your-domain.com`
- Redirect URL: `https://your-domain.com`

### Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Go to `/auth` page
3. Click "Continue with Google"
4. You should be redirected to Google sign-in
5. After signing in, you'll be redirected back to your app at `/auth/callback`
6. Then automatically redirected to `/` (home page)

## 🔍 Troubleshooting

### Error: "400 Bad Request" when clicking Google sign-in
**This means Supabase doesn't recognize your redirect URL!**

Fix:
1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Make sure **Site URL** is set to: `http://localhost:5173` (no trailing slash)
3. Under **Redirect URLs**, click **"Add URL"** and add: `http://localhost:5173`
4. Remove any entries with wildcards (`**`) or different formats
5. Click **Save** and wait 10 seconds
6. Try again

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in Google Cloud Console EXACTLY matches: `https://dyhmsvbdupnpweccfpld.supabase.co/auth/v1/callback`
- Replace `dyhmsvbdupnpweccfpld` with your actual project reference

### Error: "Invalid redirect URL"
- The redirect URL must be added to BOTH:
  1. Google Cloud Console (Supabase callback URL)
  2. Supabase URL Configuration (your app URL)

### Profile not created
- Check the RLS policies are set up correctly (run `fix_profile_policy.sql`)
- Profile will be auto-created on first Google sign-in

### Stuck on callback page
- Check browser console for errors
- Verify the callback route is properly configured in App.tsx
- Clear browser cache and cookies

## 📝 Production Deployment

When deploying to production:

1. Update Google Cloud Console with production redirect URIs
2. Update Supabase Site URL to production domain
3. Add production redirect URLs to Supabase whitelist
4. No code changes needed - the app uses `window.location.origin` automatically

## 🎉 Features Included

- ✅ Google OAuth sign-in button
- ✅ Automatic profile creation with Google avatar
- ✅ Username from Google account name
- ✅ Proper error handling
- ✅ Loading states
- ✅ Mobile responsive design
- ✅ Works with localhost and production URLs
- ✅ No hardcoded URLs - fully dynamic

## 📋 URLs Summary

**In Google Cloud Console (Authorized redirect URIs):**
```
https://dyhmsvbdupnpweccfpld.supabase.co/auth/v1/callback
```

**In Supabase > Authentication > URL Configuration:**
- **Site URL:** `http://localhost:5173`
- **Redirect URLs:** `http://localhost:5173` (click "Add URL" to add it)

**Key Points:**
- NO trailing slashes
- NO wildcards (`**`) in Redirect URLs
- Site URL and Redirect URL should match for development
- Must configure URLs BEFORE enabling Google provider
