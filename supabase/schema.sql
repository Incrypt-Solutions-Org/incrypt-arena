-- ============================================
-- INCRYPT SOLUTIONS "INCRYPT ARENA" DATABASE SCHEMA
-- ============================================
-- Run this in your Supabase SQL Editor to set up the database
-- NOTE: First drop existing tables if re-running
-- ============================================

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PLAYERS TABLE (Competitors only)
-- Team members participating in the competition
-- Separate from Supabase Auth users (admins)
-- ============================================
DROP TABLE IF EXISTS penalties CASCADE;
DROP TABLE IF EXISTS top_performer_awards CASCADE;
DROP TABLE IF EXISTS ideas CASCADE;
DROP TABLE IF EXISTS activity_participations CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS peer_evaluations CASCADE;
DROP TABLE IF EXISTS presentations CASCADE;
DROP TABLE IF EXISTS blogs CASCADE;
DROP TABLE IF EXISTS books_library CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS cycles CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP VIEW IF EXISTS leaderboard CASCADE;

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  far_away BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert all 8 team members as players
INSERT INTO players (name, email) VALUES
  ('Hisa', 'hisa@incrypt.com'),
  ('Haytham', 'haytham@incrypt.com'),
  ('Nagar', 'nagar@incrypt.com'),
  ('Hassan', 'hassan@incrypt.com'),
  ('Hesham', 'hesham@incrypt.com'),
  ('Askora', 'askora@incrypt.com'),
  ('Ghallab', 'ghallab@incrypt.com'),
  ('Fahim', 'fahim@incrypt.com')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- CYCLES TABLE
-- Six-month competition periods
-- ============================================
CREATE TABLE cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the first cycle (January - June 2026)
INSERT INTO cycles (name, start_date, end_date, is_active) VALUES
  ('January - June 2026', '2026-01-01', '2026-06-30', true);

-- ============================================
-- ATTENDANCE TABLE
-- Wednesday check-ins with early bird bonus
-- ============================================
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES cycles(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  check_in_time TIME NOT NULL,
  is_early_bird BOOLEAN DEFAULT false,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(player_id, check_in_date)
);

-- ============================================
-- COURSES TABLE
-- ============================================
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES cycles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  course_url TEXT,
  total_hours DECIMAL(5,2) NOT NULL,
  completion_percent INTEGER NOT NULL CHECK (completion_percent >= 0 AND completion_percent <= 100),
  points INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN completion_percent >= 60 THEN FLOOR((total_hours * completion_percent / 100) * 4)
      ELSE 0 
    END
  ) STORED,
  notes_link TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- BLOGS TABLE
-- ============================================
CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES cycles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL UNIQUE,
  is_first BOOLEAN DEFAULT false,
  points INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- BOOKS TABLE
-- Points per 10 pages read
-- ============================================
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES cycles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  category VARCHAR(50) CHECK (category IN ('software', 'management', 'business', 'soft_skills')),
  total_pages INTEGER NOT NULL,
  pages_read INTEGER DEFAULT 0,
  notes_link TEXT,
  summary_notes TEXT,
  points INTEGER GENERATED ALWAYS AS (FLOOR(pages_read / 10)) STORED,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- BOOKS LIBRARY TABLE
-- Master catalog of available books
-- ============================================
CREATE TABLE books_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  category VARCHAR(100),
  points_per_10_pages INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- IDEAS TABLE
-- Employee ideas and innovations
-- ============================================
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES cycles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  points INTEGER NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TOP PERFORMER AWARDS TABLE
-- Custom points awarded by admin
-- ============================================
CREATE TABLE top_performer_awards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES cycles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================
-- PRESENTATIONS TABLE
-- ============================================
CREATE TABLE presentations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  second_presenter_id UUID REFERENCES players(id) ON DELETE SET NULL,
  cycle_id UUID REFERENCES cycles(id) ON DELETE CASCADE,
  topic VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  slides_url TEXT,
  youtube_url TEXT,
  eval_link TEXT,
  is_solo BOOLEAN DEFAULT true,
  presentation_order INTEGER DEFAULT 1,
  points INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PEER EVALUATIONS TABLE
-- ============================================
CREATE TABLE peer_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  presentation_id UUID REFERENCES presentations(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES players(id) ON DELETE CASCADE,
  usefulness INTEGER CHECK (usefulness >= 1 AND usefulness <= 10),
  entertainment INTEGER CHECK (entertainment >= 1 AND entertainment <= 10),
  effort INTEGER CHECK (effort >= 1 AND effort <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(presentation_id, evaluator_id)
);

-- ============================================
-- ACTIVITIES TABLE
-- ============================================
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id UUID REFERENCES cycles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  activity_type VARCHAR(50) CHECK (activity_type IN ('padel', 'trivia_game', 'escape_room', 'fifa_cup', 'strategy_game', 'trip_bowling')),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ACTIVITY PARTICIPATIONS TABLE
-- ============================================
CREATE TABLE activity_participations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  is_top_performer BOOLEAN DEFAULT false,
  double_points_used BOOLEAN DEFAULT false,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(activity_id, player_id)
);

-- ============================================
-- IDEAS TABLE
-- ============================================
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES cycles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  idea_type VARCHAR(20) CHECK (idea_type IN ('idea', 'tool')),
  testers_count INTEGER DEFAULT 0,
  votes INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PENALTIES TABLE
-- ============================================
CREATE TABLE penalties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES cycles(id) ON DELETE CASCADE,
  reason VARCHAR(50) CHECK (reason IN ('absences', 'vacation_compliance', 'other')),
  points INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- LEADERBOARD VIEW
-- Aggregated points for quick leaderboard queries
-- ============================================
CREATE OR REPLACE VIEW leaderboard AS
WITH player_points AS (
  SELECT 
    p.id as player_id,
    p.name as player_name,
    p.avatar_url,
    
    -- Attendance points (including early bird bonus and far_away multiplier)
    COALESCE((
      SELECT SUM((points + CASE WHEN is_early_bird THEN 1 ELSE 0 END) * CASE WHEN p.far_away THEN 2 ELSE 1 END)
      FROM attendance a 
      WHERE a.player_id = p.id
    ), 0) as attendance_points,
    
    -- Activity points
    COALESCE((
      SELECT SUM(points)
      FROM activity_participations ap 
      WHERE ap.player_id = p.id
    ), 0) as activity_points,
    
    -- Course points
    COALESCE((
      SELECT SUM(points)
      FROM courses c 
      WHERE c.player_id = p.id AND c.verified = true
    ), 0) as course_points,
    
    -- Blog points
    COALESCE((
      SELECT SUM(points)
      FROM blogs b 
      WHERE b.player_id = p.id
    ), 0) as blog_points,
    
    -- Presentation points
    COALESCE((
      SELECT SUM(points)
      FROM presentations pr 
      WHERE pr.player_id = p.id
    ), 0) as presentation_points,
    
    -- Idea points
    COALESCE((
      SELECT SUM(points)
      FROM ideas i 
      WHERE i.player_id = p.id AND i.verified = true
    ), 0) as idea_points,
    
    -- Book points (1 point per 10 pages)
    COALESCE((
      SELECT SUM(points)
      FROM books bk 
      WHERE bk.player_id = p.id AND bk.verified = true
    ), 0) as book_points,
    
    -- Top performer awards
    COALESCE((
      SELECT SUM(points)
      FROM top_performer_awards tpa 
      WHERE tpa.player_id = p.id
    ), 0) as top_performer_points,
    
    -- Penalty points (negative)
    COALESCE((
      SELECT SUM(points)
      FROM penalties pen 
      WHERE pen.player_id = p.id
    ), 0) as penalty_points
    
  FROM players p
)
SELECT 
  player_id,
  player_name,
  avatar_url,
  attendance_points,
  activity_points,
  course_points,
  blog_points,
  book_points,
  presentation_points,
  idea_points,
  top_performer_points,
  penalty_points,
  (attendance_points + activity_points + course_points + blog_points + book_points +
   presentation_points + idea_points + top_performer_points + penalty_points) as total_points,
  RANK() OVER (ORDER BY 
    (attendance_points + activity_points + course_points + blog_points + book_points +
     presentation_points + idea_points + top_performer_points + penalty_points) DESC
  ) as rank
FROM player_points
ORDER BY total_points DESC;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE top_performer_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalties ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view the leaderboard)
CREATE POLICY "Public read players" ON players FOR SELECT USING (true);
CREATE POLICY "Public read cycles" ON cycles FOR SELECT USING (true);
CREATE POLICY "Public read attendance" ON attendance FOR SELECT USING (true);
CREATE POLICY "Public read courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Public read blogs" ON blogs FOR SELECT USING (true);
CREATE POLICY "Public read presentations" ON presentations FOR SELECT USING (true);
CREATE POLICY "Public read peer_evaluations" ON peer_evaluations FOR SELECT USING (true);
CREATE POLICY "Public read activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Public read activity_participations" ON activity_participations FOR SELECT USING (true);
CREATE POLICY "Public read ideas" ON ideas FOR SELECT USING (true);
CREATE POLICY "Public read penalties" ON penalties FOR SELECT USING (true);

-- Authenticated users (admins) can write
-- Note: Admins are managed via Supabase Auth, not in this players table
CREATE POLICY "Auth write attendance" ON attendance FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update attendance" ON attendance FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete attendance" ON attendance FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth write courses" ON courses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update courses" ON courses FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete courses" ON courses FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth write blogs" ON blogs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update blogs" ON blogs FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete blogs" ON blogs FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth write presentations" ON presentations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update presentations" ON presentations FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete presentations" ON presentations FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth write penalties" ON penalties FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update penalties" ON penalties FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete penalties" ON penalties FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth write activities" ON activities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth write activity_participations" ON activity_participations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth write ideas" ON ideas FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
