-- Migration: Exclude admins from leaderboard view
-- Run this in Supabase SQL Editor

CREATE OR REPLACE VIEW leaderboard WITH (security_invoker = true) AS
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
  WHERE COALESCE(p.is_admin, false) = false
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
FROM player_points;
