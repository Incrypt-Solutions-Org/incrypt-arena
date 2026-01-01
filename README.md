# Incrypt Arena - Incrypt Solutions

A gamified, interactive leaderboard dashboard for the Incrypt Solutions tech team.

![Cyberpunk Theme](https://img.shields.io/badge/theme-cyberpunk-00d4ff)
![React](https://img.shields.io/badge/react-19.x-61dafb)
![TypeScript](https://img.shields.io/badge/typescript-5.x-3178c6)
![Supabase](https://img.shields.io/badge/database-supabase-3fcf8e)

## Features

- 🏆 **Real-time Leaderboard** - Live rankings with Gold/Silver/Bronze medals
- 🪣 **El Kooz Badge** - Special "bucket" icon for last place
- 📅 **Attendance Tracking** - Wednesday check-ins with Early Bird bonus
- 🎮 **Activity Points** - Trivia, Escape Room, FIFA Cup, Padel, Strategy Games
- 📚 **Course Tracking** - Points based on course hours and completion
- ✍️ **Blog Rewards** - LinkedIn blog publication bonuses
- 🎤 **Presentation System** - Solo/pair presentations with peer evaluations
- 🔒 **Admin Panel** - Protected dashboard for point management

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set Up Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run the contents of `supabase/schema.sql`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5. Run Tests

```bash
npm run test
# or run once
npm run test:run
```

## Project Structure

```
├── src/
│   ├── components/       # UI components
│   │   ├── Header.tsx
│   │   ├── RankBadge.tsx
│   │   ├── LeaderboardCard.tsx
│   │   └── admin/        # Admin components
│   ├── pages/            # Page components
│   │   ├── Leaderboard.tsx
│   │   ├── Rules.tsx
│   │   ├── AdminLogin.tsx
│   │   └── AdminDashboard.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useLeaderboard.ts
│   │   └── useAuth.ts
│   ├── lib/              # Utilities
│   │   └── supabase.ts
│   └── types/            # TypeScript types
├── supabase/
│   └── schema.sql        # Database schema
├── public/
│   └── incrypt-logo.jpg  # Company logo
└── netlify.toml          # Deployment config
```

## Scoring System

| Category | Points |
|----------|--------|
| Attendance | +10 |
| Early Bird (before 11:30 AM) | +1 |
| First Solo Presentation | +30 |
| First Pair Presentation | +20 |
| First Blog | +30 |
| Subsequent Blogs | +20 |
| Courses | (Hours × Completion%) × 4 |
| Activity Top Performer | +20 |
| Trip | +30 |
| Penalty (per 5 absences) | -1 |

## Demo Admin Login

For development without Supabase:
- **Email:** admin@incrypt.com
- **Password:** gameofcode2026

## Deployment

### Netlify

1. Push to GitHub
2. Connect repository to Netlify
3. Build settings are auto-configured via `netlify.toml`
4. Set environment variables in Netlify dashboard

## Tech Stack

- **Frontend:** React + Vite + TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Testing:** Vitest + Testing Library

## License

© 2025 Incrypt Solutions
