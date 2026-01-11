-- INCRYPT ARENA: Database Migration for Authentication
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Add Authentication Columns
-- ============================================
ALTER TABLE players 
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_players_auth_id ON players(auth_id);

-- ============================================
-- STEP 2: Update RLS Policies (Optional)
-- ============================================
-- Allow authenticated users to read their own player data
CREATE POLICY IF NOT EXISTS "Users can read own player data"
  ON players FOR SELECT
  USING (auth.uid() = auth_id);

-- ============================================
-- HOW TO USE THIS SYSTEM
-- ============================================

-- TO CREATE AN ADMIN USER:
-- 1. First, create account via /signup page
-- 2. Then run this SQL (replace email):
--    UPDATE players SET is_admin = true WHERE email = 'admin@incrypt.com';
-- 3. Logout and login again to see admin navigation

-- TO CREATE A PLAYER USER:
-- 1. Just use /signup page
-- 2. Account automatically created as player (is_admin = false)

-- ADMIN VS PLAYER DIFFERENTIATION:
-- - is_admin = TRUE  → Shows: Admin Dashboard, Leaderboard, Rules
-- - is_admin = FALSE → Shows: Leaderboard, My Achievements, Team, Check-In, Rules, Rewards

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'players' 
  AND column_name IN ('is_admin', 'auth_id');

-- View all users and their roles
SELECT email, name, is_admin, auth_id 
FROM players 
ORDER BY is_admin DESC, name;
