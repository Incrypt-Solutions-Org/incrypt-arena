/**
 * Player Type Definition
 * Represents a team member in the Incrypt Arena competition
 * Note: Admins are managed via Supabase Auth, not in this table
 */
export interface Player {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Competition Cycle
 * Represents a six-month competition period
 */
export interface Cycle {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Attendance Record
 * Tracks Wednesday check-ins with early bird bonus
 */
export interface Attendance {
  id: string;
  player_id: string;
  cycle_id: string;
  check_in_date: string;
  check_in_time: string;
  is_early_bird: boolean;
  points: number;
  created_at: string;
}

/**
 * Course Submission
 */
export interface Course {
  id: string;
  player_id: string;
  cycle_id: string;
  name: string;
  url: string;
  hours: number;
  completion_percentage: number;
  points: number;
  notes?: string;
  verified: boolean;
  created_at: string;
}

/**
 * Blog Entry
 */
export interface Blog {
  id: string;
  player_id: string;
  cycle_id: string;
  title: string;
  url: string;
  is_first: boolean;
  points: number;
  created_at: string;
}

/**
 * Presentation Record
 */
export interface Presentation {
  id: string;
  player_id: string;
  cycle_id: string;
  topic: string;
  slides_url?: string;
  recording_url?: string;
  is_solo: boolean;
  presentation_order: number;
  points: number;
  date: string;
  created_at: string;
}

/**
 * Peer Evaluation for Presentations
 */
export interface PeerEvaluation {
  id: string;
  presentation_id: string;
  evaluator_id: string;
  usefulness: number;
  entertainment: number;
  effort: number;
  created_at: string;
}

/**
 * Activity
 */
export interface Activity {
  id: string;
  cycle_id: string;
  name: string;
  activity_type: 'trivia' | 'escape_room' | 'fifa_cup' | 'padel' | 'strategy_games' | 'trip';
  date: string;
  created_at: string;
}

/**
 * Activity Participation Record
 */
export interface ActivityParticipation {
  id: string;
  activity_id: string;
  player_id: string;
  is_top_performer: boolean;
  double_points_used: boolean;
  points: number;
  created_at: string;
}

/**
 * Innovation Idea/Tool Submission
 */
export interface Idea {
  id: string;
  player_id: string;
  cycle_id: string;
  title: string;
  description: string;
  idea_type: 'idea' | 'tool';
  testers_count: number;
  votes: number;
  points: number;
  verified: boolean;
  created_at: string;
}

/**
 * Penalty Record
 */
export interface Penalty {
  id: string;
  player_id: string;
  cycle_id: string;
  reason: 'absences' | 'vacation_compliance' | 'other';
  points: number;
  description?: string;
  created_at: string;
}

/**
 * Leaderboard Entry
 * Aggregated view of player points across all categories
 */
export interface LeaderboardEntry {
  player_id: string;
  player_name: string;
  avatar_url?: string;
  rank: number;
  total_points: number;
  attendance_points: number;
  activity_points: number;
  course_points: number;
  blog_points: number;
  book_points: number;
  presentation_points: number;
  idea_points: number;
  penalty_points: number;
  is_last_place: boolean;
}

/**
 * Point Calculation Constants
 */
export const POINTS = {
  ATTENDANCE: 1,
  EARLY_BIRD: 1,
  ASKORA_STREAK: 1,
  ATTENDANCE_CHAMPION: 10,
  
  FIRST_SOLO_PRESENTATION: 30,
  SECOND_SOLO_PRESENTATION: 20,
  FIRST_PAIR_PRESENTATION: 20,
  SECOND_PAIR_PRESENTATION: 15,
  BEST_PRESENTATION: 20,
  
  FIRST_BLOG: 30,
  SUBSEQUENT_BLOG: 20,
  
  ACTIVITY_TOP_PERFORMER: 20,
  ACTIVITY_ATTENDANCE: 10,
  TRIP: 30,
  
  IDEA_MIN: 5,
  IDEA_MAX: 30,
  
  PENALTY_PER_5_ABSENCES: -1,
  PENALTY_VACATION_DAY: -1,
} as const;

/**
 * Official Activities List
 */
export const ACTIVITIES = [
  { id: 'padel', name: 'Padel', emoji: '🎾' },
  { id: 'trivia_game', name: 'Trivia Game', emoji: '🧠' },
  { id: 'escape_room', name: 'Escape Room', emoji: '🔐' },
  { id: 'fifa_cup', name: 'FIFA Cup', emoji: '⚽' },
  { id: 'strategy_game', name: 'Strategy Game', emoji: '♟️' },
  { id: 'trip_bowling', name: 'Trip/Bowling', emoji: '🎳' },
] as const;
