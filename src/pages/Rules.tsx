/**
 * Rules Page Component
 * Displays scoring rules and point system information
 */
import { motion } from 'framer-motion';
import { BookOpen, Trophy, Calendar, GraduationCap, PenTool, Presentation, Lightbulb, AlertTriangle } from 'lucide-react';
import { POINTS } from '../types';

/**
 * Scoring categories with their rules
 */
const SCORING_RULES = [
  {
    category: 'Attendance',
    icon: Calendar,
    color: 'text-green-400',
    items: [
      { label: 'Wednesday Check-in', points: POINTS.ATTENDANCE, description: 'Every Wednesday attendance' },
      { label: 'Early Bird Bonus', points: POINTS.EARLY_BIRD, description: 'Arrive before 11:30 AM' },
      { label: 'Askora\'s Streak Bonus', points: POINTS.ASKORA_STREAK, description: '2 consecutive Wednesdays' },
      { label: 'Attendance Champion', points: POINTS.ATTENDANCE_CHAMPION, description: 'Highest attendance (end of cycle)' },
    ],
  },
  {
    category: 'Presentations',
    icon: Presentation,
    color: 'text-purple-400',
    items: [
      { label: '1st Solo Presentation', points: POINTS.FIRST_SOLO_PRESENTATION, description: 'Your first individual presentation' },
      { label: '2nd Solo Presentation', points: POINTS.SECOND_SOLO_PRESENTATION, description: 'Your second individual presentation' },
      { label: '1st Pair Presentation', points: POINTS.FIRST_PAIR_PRESENTATION, description: 'First presentation with a partner' },
      { label: '2nd Pair Presentation', points: POINTS.SECOND_PAIR_PRESENTATION, description: 'Second presentation with a partner' },
      { label: 'Best Presentation Award', points: POINTS.BEST_PRESENTATION, description: 'Highest peer evaluation score' },
    ],
  },
  {
    category: 'Blogs',
    icon: PenTool,
    color: 'text-blue-400',
    items: [
      { label: 'First Blog Post', points: POINTS.FIRST_BLOG, description: 'First LinkedIn blog publication' },
      { label: 'Subsequent Blogs', points: POINTS.SUBSEQUENT_BLOG, description: 'Each additional blog post' },
    ],
  },
  {
    category: 'Courses',
    icon: GraduationCap,
    color: 'text-yellow-400',
    items: [
      { label: 'Course Completion', points: null, description: 'Points = (Hours × Completion%) × 4' },
    ],
    note: 'Minimum 60% completion required',
  },
  {
    category: 'Activities',
    icon: Trophy,
    color: 'text-orange-400',
    items: [
      { label: 'Activity Attendance', points: POINTS.ACTIVITY_ATTENDANCE, description: 'Just by attending any activity' },
      { label: 'Top Performer', points: POINTS.ACTIVITY_TOP_PERFORMER, description: 'Win any team activity' },
      { label: 'Trip Participation', points: POINTS.TRIP, description: 'Seasonal team trip' },
    ],
    note: 'One-time Double Points mode available per activity',
  },
  {
    category: 'Innovation',
    icon: Lightbulb,
    color: 'text-cyan-400',
    items: [
      { label: 'Ideas & Tools', points: null, description: `${POINTS.IDEA_MIN}-${POINTS.IDEA_MAX} points based on team vote` },
    ],
    note: 'Requires 3 testers and team vote approval',
  },
  {
    category: 'Penalties',
    icon: AlertTriangle,
    color: 'text-red-400',
    items: [
      { label: 'Absences', points: POINTS.PENALTY_PER_5_ABSENCES, description: 'Per every 5 absences' },
      { label: 'Vacation Compliance', points: POINTS.PENALTY_VACATION_DAY, description: 'Per day without Deel submission' },
    ],
  },
];

export function RulesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <BookOpen className="w-8 h-8 text-neon-blue" />
        <h1 className="font-display text-3xl font-bold neon-text">
          Scoring Rules
        </h1>
      </motion.div>

      {/* Intro */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-gray-300 mb-8 max-w-2xl"
      >
        Earn points through various activities throughout each six-month cycle.
        The player with the most points wins amazing prizes. The last place gets
        the infamous <span className="text-danger">El Kooz 🪣</span> title!
      </motion.p>

      {/* Rules Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SCORING_RULES.map((rule, index) => (
          <motion.div
            key={rule.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="cyber-card p-6"
          >
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-4">
              <rule.icon className={`w-6 h-6 ${rule.color}`} />
              <h2 className="font-display text-xl font-semibold text-white">
                {rule.category}
              </h2>
            </div>

            {/* Rules List */}
            <ul className="space-y-3">
              {rule.items.map((item) => (
                <li
                  key={item.label}
                  className="flex justify-between items-start gap-2"
                >
                  <div>
                    <span className="text-gray-200 font-medium">
                      {item.label}
                    </span>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                  <span
                    className={`
                      font-display font-bold text-sm whitespace-nowrap
                      ${item.points && item.points < 0 ? 'text-danger' : 'text-neon-blue'}
                    `}
                  >
                    {item.points !== null
                      ? `${item.points > 0 ? '+' : ''}${item.points}`
                      : 'Variable'}
                  </span>
                </li>
              ))}
            </ul>

            {/* Note if present */}
            {rule.note && (
              <p className="mt-4 text-xs text-gray-500 italic border-t border-gray-700 pt-3">
                {rule.note}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Bottom note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 p-4 cyber-card text-center text-sm text-gray-400"
      >
        Competition runs in 6-month cycles (e.g., January – June).
        Points reset at the start of each new cycle.
        {' '}<a href="/rewards" className="text-neon-blue hover:underline">View Rewards →</a>
      </motion.div>
    </div>
  );
}
