# 🎵 AudSmash

A modern music competition web app where users search YouTube songs, add them to weekly competitions, vote on favorites, and compete for cash prizes!

## ✨ Features

- **🔍 YouTube Search**: Search and discover music directly from YouTube via Serper API
- **🎵 Weekly Competition**: Add your favorite song (can change once per day)
- **❤️ Voting System**: Vote for your favorite songs (one vote per song per user per week)
- **💬 Comments**: Discuss songs with the community
- **🏆 Leaderboard**: See top users ranked by weekly votes with cash prizes
- **👤 User Profiles**: Track votes, current songs, and song history
- **🎬 Embedded YouTube Player**: Listen without leaving the app (starts at custom time)
- **📱 Responsive Design**: Beautiful gradient UI on all devices
- **⚡ Real-time Updates**: Live vote counts and leaderboard updates

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL + Auth + Real-time subscriptions)
- **Search API**: Serper API (Google search for YouTube videos)
- **YouTube**: React-YouTube embedded player
- **Icons**: React Icons (Font Awesome)
- **Styling**: Modern CSS with gradients, animations, and responsive design

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase Database

1. **Create account** at https://supabase.com
2. **Create new project**
3. Go to **SQL Editor** in dashboard
4. **Copy all contents** from `database/schema.sql`
5. **Paste and execute** the SQL

This creates:
- All tables (profiles, songs, votes, comments, song_changes)
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for auto-updates
- Helper functions

### 3. Configure Environment Variables

Edit `.env` file in root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SERPER_API_KEY=your_serper_key_here
```

**Where to get credentials:**
- **Supabase**: Project Settings → API → Copy Project URL and anon/public key
- **Serper API**: Sign up at https://serper.dev (free trial available)

### 4. Run Development Server

```bash
npm run dev
```

Frontend runs at: **http://localhost:5173**

### 5. (Optional) Run Backend API

For Serper search via backend (recommended for production):

```bash
cd api
npm install
npm run dev
```

Backend API runs at: **http://localhost:3001**

## 📱 How to Use

### Getting Started

1. **Sign Up**: Create account with email and choose username
2. **Search**: Use search tab to find YouTube songs
3. **Add Song**: 
   - Click "Add" on any video
   - Choose a category (Hip Hop, Rock, Pop, etc.)
   - Set start time in seconds (where song should begin)
   - Submit to enter competition

### Daily Flow

- **Browse** songs in Listen tab
- **Vote** for favorites (heart button)
- **Comment** on songs
- **Check** leaderboard for rankings
- **Update** your song (once per day max)

### Rules

- ✅ Add one song per week to competition
- ✅ Change song once per day
- ✅ Vote once per song per week
- ✅ Unlimited comments
- 🏆 Top user each week wins cash prize!

## 🗂️ Project Structure

```
audsmash/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── BottomNav.tsx    # Bottom navigation bar
│   │   └── TopBar.tsx       # Top header bar
│   ├── contexts/            # React Context providers
│   │   └── AuthContext.tsx  # Authentication context
│   ├── pages/               # Main page components
│   │   ├── Auth.tsx        # Sign in/Sign up
│   │   ├── Leaderboard.tsx # Weekly rankings
│   │   ├── Listen.tsx      # Browse and vote
│   │   ├── Profile.tsx     # User profiles
│   │   ├── Search.tsx      # YouTube search
│   │   └── Upload.tsx      # Add song form
│   ├── services/            # External API services
│   │   └── youtube.service.ts
│   ├── lib/                 # Utilities and config
│   │   └── supabase.ts     # Supabase client
│   ├── types/               # TypeScript type definitions
│   │   ├── database.types.ts
│   │   └── index.ts
│   ├── App.tsx             # Main app with routing
│   ├── App.css             # Main styles
│   ├── index.css           # Global styles
│   └── main.tsx            # App entry point
├── api/                     # Optional Express backend
│   ├── server.js           # Search API endpoint
│   ├── package.json
│   └── README.md
├── database/                # Database schemas
│   ├── schema.sql          # Full database schema
│   └── README.md           # Database documentation
├── .env                     # Environment variables (YOU ADD THIS)
├── .env.example             # Example env file
├── package.json
└── vite.config.ts
```

## 🎨 Key Features Explained

### 1. Search Tab
- Real-time YouTube video search
- Shows thumbnails, titles, channels
- One-click "Add" button
- Powered by Serper API

### 2. Upload/Add Tab
- Select from 11 music categories
- Set custom start time for best part
- Daily change limit enforced
- Automatic week tracking

### 3. Listen Screen
- Grid of all active songs
- Embedded YouTube players
- Real-time vote counting
- Comments modal
- One vote per user per song

### 4. Leaderboard
- Weekly rankings by votes
- Trophy/medals for top 3
- Shows user's current song
- Auto-resets Monday
- Prize display

### 5. Profile Page
- User statistics
- Current active song
- Past entries history
- Edit username
- View all past votes

## 🔐 Security & Privacy

- **Row Level Security (RLS)** on all Supabase tables
- **Authentication** via Supabase Auth (email/password)
- **API keys** secured in environment variables
- **User data** isolated per profile
- **Vote integrity** enforced at database level

## 🚢 Deployment

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Build for Production

```bash
npm run build
```

This creates optimized files in `dist/` folder with code splitting.

### Deploy to Vercel (Recommended)

**Option 1: Via Dashboard**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure:
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SERPER_API_KEY`
5. Deploy!

**Option 2: Via CLI**
```bash
npm i -g vercel
vercel login
vercel
```

**Post-Deployment:**
- Add your Vercel URL to Supabase redirect URLs
- Update Google OAuth authorized URIs (if using)
- See `DEPLOYMENT.md` for complete guide

### Deploy to Other Platforms

- **Netlify**: Connect GitHub, set build command to `npm run build` and publish dir to `dist`
- **Cloudflare Pages**: Connect repo, framework preset **Vite**, build command `npm run build`
- **GitHub Pages**: Use GitHub Actions with Vite build
- **Railway/Render**: Node.js deployment with build command

**Important**: All platforms require environment variables to be set!

### Configuration Files

- `vercel.json`: SPA routing and cache optimization
- `vite.config.ts`: Code splitting and build optimization
- `.env.production.example`: Template for production variables

See `PRE_DEPLOY_CHECKLIST.md` before deploying!

## 📊 Database Schema Overview

### Tables

- **profiles**: User data (username, avatar, total_weekly_votes)
- **songs**: YouTube songs with metadata
- **votes**: Vote records (unique constraint per user/song/week)
- **comments**: User comments on songs
- **song_changes**: Daily change tracking

### Key Features

- Auto-increment vote counts via triggers
- Only one active song per user enforced
- Weekly format: `YYYY-Www` (e.g., `2025-W46`)
- Automatic timestamp updates

See `database/schema.sql` for complete schema.

## 🐛 Troubleshooting

### Build Errors

```bash
npm run build
```

Check console output for specific TypeScript errors.

### Supabase Connection Issues

- Verify `.env` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check Supabase project status in dashboard
- Ensure SQL schema was run completely
- Check browser console for error messages

### YouTube Videos Not Playing

- Verify `VITE_SERPER_API_KEY` is valid
- Check Serper API quota at serper.dev
- Ensure backend API is running (if using)
- Check browser console for errors

### Authentication Issues

- Enable Email Auth in Supabase: Authentication → Providers → Email
- Check email confirmation settings
- Verify user created in Supabase dashboard

## 📝 Development Notes

### Type Safety

The app uses TypeScript throughout. Database types are in `src/types/database.types.ts`. Some `as any` casts are used to work around Supabase generated type issues - in production, generate types from your actual schema.

### Real-time Updates

The app uses Supabase real-time subscriptions for live updates on:
- Vote counts
- New songs
- Leaderboard changes

### API Structure

Search can work two ways:
1. **Direct** (frontend calls Serper directly)
2. **Backend** (frontend → Express API → Serper)

Option 2 is recommended for production to hide API keys.

## 🔄 Future Enhancements

Possible features to add:
- [ ] Categories filtering
- [ ] Song recommendations
- [ ] User followers/following
- [ ] Playlist creation
- [ ] Share to social media
- [ ] Email notifications
- [ ] Mobile apps (React Native)
- [ ] Advanced search filters
- [ ] Song of the month awards

## 📄 License

MIT License - Free to use and modify!

## 🙏 Credits

- **Supabase** for backend infrastructure
- **Serper** for YouTube search API
- **YouTube** for video embedding
- **React** ecosystem for amazing tools

## 🤝 Contributing

Contributions welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Built with ❤️ by music lovers, for music lovers**

Ready to compete? 🎵🏆 Set up your database, add your API keys, and start AudSmash!
