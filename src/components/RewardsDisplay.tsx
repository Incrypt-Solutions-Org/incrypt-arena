/**
 * RewardsDisplay Component
 * Shows the prizes and rewards for competition winners
 */
import { motion } from 'framer-motion';
import { Trophy, Gift, Award, Crown, Star } from 'lucide-react';

/**
 * Reward tiers configuration
 */
const REWARDS = [
  {
    place: 1,
    title: 'Champion',
    icon: Crown,
    color: 'text-gold',
    bgColor: 'bg-gold/10',
    borderColor: 'border-gold',
    prizes: [
      'Trophy + Certificate',
      'Premium tech gadget',
      '3 extra vacation days',
      'Hall of Fame recognition',
    ],
  },
  {
    place: 2,
    title: 'Runner Up',
    icon: Award,
    color: 'text-silver',
    bgColor: 'bg-silver/10',
    borderColor: 'border-silver',
    prizes: [
      'Silver medal + Certificate',
      'Tech accessory of choice',
      '2 extra vacation days',
    ],
  },
  {
    place: 3,
    title: 'Third Place',
    icon: Star,
    color: 'text-bronze',
    bgColor: 'bg-bronze/10',
    borderColor: 'border-bronze',
    prizes: [
      'Bronze medal + Certificate',
      'Gift card',
      '1 extra vacation day',
    ],
  },
];

/**
 * "El Kooz" penalty for last place
 */
const EL_KOOZ = {
  title: 'El Kooz 🪣',
  description: 'The last place player gets the infamous "El Kooz" (bucket) badge and must wear it with... honor?',
  consequences: [
    'El Kooz badge on profile',
    'Coffee duty for a week',
    'Must bring breakfast for the team',
  ],
};

export function RewardsDisplay() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/20 mb-4">
          <Trophy className="w-8 h-8 text-gold" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white mb-2">
          Competition Rewards
        </h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Compete hard, win big! Here's what's at stake each cycle.
        </p>
      </motion.div>

      {/* Winner Tiers */}
      <div className="grid gap-6 md:grid-cols-3">
        {REWARDS.map((reward, index) => (
          <motion.div
            key={reward.place}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`cyber-card p-6 ${reward.borderColor} border-2`}
          >
            {/* Header */}
            <div className={`flex items-center gap-3 mb-4 ${reward.color}`}>
              <div className={`p-3 rounded-full ${reward.bgColor}`}>
                <reward.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm text-gray-400">#{reward.place}</div>
                <h3 className="font-display text-lg font-bold">{reward.title}</h3>
              </div>
            </div>

            {/* Prizes */}
            <ul className="space-y-2">
              {reward.prizes.map((prize, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300">
                  <Gift className={`w-4 h-4 mt-1 flex-shrink-0 ${reward.color}`} />
                  <span className="text-sm">{prize}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* El Kooz Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="cyber-card p-6 border-danger border-2 bg-danger/5"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-shrink-0 text-center md:text-left">
            <span className="text-6xl">🪣</span>
          </div>
          <div className="flex-1">
            <h3 className="font-display text-xl font-bold text-danger mb-2">
              {EL_KOOZ.title}
            </h3>
            <p className="text-gray-400 text-sm mb-3">
              {EL_KOOZ.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {EL_KOOZ.consequences.map((consequence, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-danger/20 text-danger text-xs rounded-full"
                >
                  {consequence}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
