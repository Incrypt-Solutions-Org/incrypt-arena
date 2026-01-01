/**
 * Rewards Page Component
 * Displays competition prizes and gift options
 */
import { motion } from 'framer-motion';
import { Trophy, Gift, Crown, Award, Star, Watch, Headphones, Camera, Sparkles } from 'lucide-react';

/**
 * Prize tiers with EGP amounts
 */
const PRIZE_TIERS = [
  {
    place: 1,
    title: 'Top Scorer',
    amount: '5,000',
    icon: Crown,
    color: 'text-gold',
    bgColor: 'bg-gold/10',
    borderColor: 'border-gold',
    gradient: 'from-gold/20 to-yellow-900/20',
  },
  {
    place: 2,
    title: '2nd Place',
    amount: '3,000',
    icon: Award,
    color: 'text-silver',
    bgColor: 'bg-silver/10',
    borderColor: 'border-silver',
    gradient: 'from-silver/20 to-gray-700/20',
  },
  {
    place: 3,
    title: '3rd Place',
    amount: '2,000',
    icon: Star,
    color: 'text-bronze',
    bgColor: 'bg-bronze/10',
    borderColor: 'border-bronze',
    gradient: 'from-bronze/20 to-orange-900/20',
  },
];

/**
 * Gift options available
 */
const GIFT_OPTIONS = [
  { name: 'Smartwatch', icon: Watch },
  { name: 'AirPods/Headphones', icon: Headphones },
  { name: 'Camera', icon: Camera },
  { name: 'Original Perfume', icon: Sparkles },
  { name: 'Monitor/Keyboards', icon: '🖥️' },
  { name: 'Sneakers', icon: '👟' },
];

export function RewardsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/20 mb-6">
          <Trophy className="w-10 h-10 text-gold" />
        </div>
        <h1 className="font-display text-4xl font-bold neon-text mb-4">
          Competition Rewards
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto text-lg">
          Compete hard, win big! Top performers get rewarded with amazing prizes.
        </p>
      </motion.div>

      {/* Prize Tiers */}
      <div className="grid gap-8 md:grid-cols-3 mb-16">
        {PRIZE_TIERS.map((tier, index) => (
          <motion.div
            key={tier.place}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className={`
              relative cyber-card p-8 ${tier.borderColor} border-2
              bg-gradient-to-b ${tier.gradient}
              hover:scale-105 transition-transform duration-300
            `}
          >
            {/* Place Badge */}
            <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full ${tier.bgColor} ${tier.borderColor} border`}>
              <span className={`font-display text-sm font-bold ${tier.color}`}>
                #{tier.place}
              </span>
            </div>

            {/* Icon */}
            <div className={`flex justify-center mb-6 mt-4`}>
              <div className={`p-4 rounded-full ${tier.bgColor}`}>
                <tier.icon className={`w-12 h-12 ${tier.color}`} />
              </div>
            </div>

            {/* Title */}
            <h2 className={`font-display text-2xl font-bold text-center ${tier.color} mb-4`}>
              {tier.title}
            </h2>

            {/* Amount */}
            <div className="text-center">
              <span className={`font-display text-5xl font-bold ${tier.color}`}>
                {tier.amount}
              </span>
              <span className="text-gray-400 text-lg ml-2">EGP</span>
            </div>

            <p className="text-center text-gray-500 text-sm mt-3">
              Up to {tier.amount} EGP reward
            </p>
          </motion.div>
        ))}
      </div>

      {/* Gift Options Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="cyber-card p-8"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon-blue/20 mb-4">
            <Gift className="w-8 h-8 text-neon-blue" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            Your Gift Can Be
          </h2>
          <p className="text-gray-400">
            Choose from these amazing options
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {GIFT_OPTIONS.map((gift, index) => (
            <motion.div
              key={gift.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="p-4 bg-cyber-darker rounded-xl border border-gray-700 hover:border-neon-blue 
                       hover:bg-neon-blue/5 transition-all duration-300 text-center group"
            >
              <div className="text-4xl mb-3">
                {typeof gift.icon === 'string' ? (
                  gift.icon
                ) : (
                  <gift.icon className="w-10 h-10 mx-auto text-gray-400 group-hover:text-neon-blue transition-colors" />
                )}
              </div>
              <span className="text-sm text-gray-300 font-medium">{gift.name}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* El Kooz Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 cyber-card p-6 border-danger border-2 bg-danger/5"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-shrink-0 text-center md:text-left">
            <span className="text-7xl">🪣</span>
          </div>
          <div className="flex-1">
            <h3 className="font-display text-2xl font-bold text-danger mb-2">
              El Kooz Award
            </h3>
            <p className="text-gray-400">
              Nobody wants to finish last! The "El Kooz" badge comes with some friendly team traditions.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
