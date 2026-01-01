/**
 * ActivityForm Component
 * Form for logging activity attendance and awarding points
 * Includes Double Points feature (one-time per player per cycle)
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Star, Send, Zap } from 'lucide-react';
import type { LeaderboardEntry } from '../../types';
import { ACTIVITIES, POINTS } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface ActivityFormProps {
  players: LeaderboardEntry[];
}

export function ActivityForm({ players }: ActivityFormProps) {
  const [selectedActivity, setSelectedActivity] = useState('');
  const [attendees, setAttendees] = useState<Set<string>>(new Set());
  const [topPerformer, setTopPerformer] = useState<string>('');
  const [doublePointsPlayer, setDoublePointsPlayer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const toggleAttendee = (playerId: string) => {
    const newSet = new Set(attendees);
    if (newSet.has(playerId)) {
      newSet.delete(playerId);
      // Clear top performer and double points if they're removed
      if (topPerformer === playerId) {
        setTopPerformer('');
      }
      if (doublePointsPlayer === playerId) {
        setDoublePointsPlayer('');
      }
    } else {
      newSet.add(playerId);
    }
    setAttendees(newSet);
  };

  const toggleDoublePoints = (playerId: string) => {
    setDoublePointsPlayer(doublePointsPlayer === playerId ? '' : playerId);
  };

  const calculatePlayerPoints = (playerId: string): number => {
    let points = POINTS.ACTIVITY_ATTENDANCE;
    if (playerId === topPerformer) {
      points += POINTS.ACTIVITY_TOP_PERFORMER;
    }
    if (playerId === doublePointsPlayer) {
      points *= 2; // Double the total points
    }
    return points;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity || attendees.size === 0) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      if (isSupabaseConfigured()) {
        // Get active cycle
        const { data: cycle } = await supabase
          .from('cycles')
          .select('id')
          .eq('is_active', true)
          .single();

        if (!cycle) throw new Error('No active cycle');

        // Check if doublePointsPlayer has already used double points this cycle
        if (doublePointsPlayer) {
          const { data: existingDouble } = await supabase
            .from('activity_participations')
            .select('id')
            .eq('player_id', doublePointsPlayer)
            .eq('double_points_used', true)
            .limit(1);

          if (existingDouble && existingDouble.length > 0) {
            setMessage(`❌ ${players.find(p => p.player_id === doublePointsPlayer)?.player_name} already used Double Points this cycle!`);
            setIsSubmitting(false);
            return;
          }
        }

        // Create activity record
        const { data: activity, error: activityError } = await supabase
          .from('activities')
          .insert({
            cycle_id: cycle.id,
            name: ACTIVITIES.find(a => a.id === selectedActivity)?.name || selectedActivity,
            activity_type: selectedActivity,
            date: new Date().toISOString().split('T')[0],
          })
          .select()
          .single();

        if (activityError) throw activityError;

        // Create participation records
        const participations = Array.from(attendees).map(playerId => ({
          activity_id: activity.id,
          player_id: playerId,
          is_top_performer: playerId === topPerformer,
          double_points_used: playerId === doublePointsPlayer,
          points: calculatePlayerPoints(playerId),
        }));

        const { error: participationError } = await supabase
          .from('activity_participations')
          .insert(participations);

        if (participationError) throw participationError;
      }

      const activityName = ACTIVITIES.find(a => a.id === selectedActivity)?.name;
      const totalPoints = Array.from(attendees).reduce((sum, id) => sum + calculatePlayerPoints(id), 0);
      const doublePointsMsg = doublePointsPlayer 
        ? ` (${players.find(p => p.player_id === doublePointsPlayer)?.player_name} used 2×!)` 
        : '';
      setMessage(`✓ ${activityName} logged! ${attendees.size} attendees, +${totalPoints} total points${doublePointsMsg}`);
      
      // Reset form
      setSelectedActivity('');
      setAttendees(new Set());
      setTopPerformer('');
      setDoublePointsPlayer('');
    } catch (err) {
      console.error('Failed to log activity:', err);
      setMessage('❌ Failed to log activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Header */}
      <div className="cyber-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold" />
              Activity Points
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              +{POINTS.ACTIVITY_ATTENDANCE} pts attendance • +{POINTS.ACTIVITY_TOP_PERFORMER} top performer • ⚡ 2× one-time bonus
            </p>
          </div>
        </div>
      </div>

      {/* Activity Selection */}
      <div className="cyber-card p-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Select Activity
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ACTIVITIES.map((activity) => (
            <button
              key={activity.id}
              type="button"
              onClick={() => setSelectedActivity(activity.id)}
              className={`
                p-4 rounded-lg border text-left transition-all
                ${selectedActivity === activity.id
                  ? 'bg-neon-blue/20 border-neon-blue text-white'
                  : 'bg-cyber-darker border-gray-700 text-gray-400 hover:border-gray-500'
                }
              `}
            >
              <span className="text-2xl mb-2 block">{activity.emoji}</span>
              <span className="font-medium text-sm">{activity.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Player Selection */}
      {selectedActivity && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="cyber-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Select Attendees
            </label>
            <span className="text-neon-blue font-medium">
              {attendees.size} selected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {players.map((player) => {
              const isAttending = attendees.has(player.player_id);
              const isTop = topPerformer === player.player_id;
              const isDouble = doublePointsPlayer === player.player_id;
              const playerPoints = isAttending ? calculatePlayerPoints(player.player_id) : 0;

              return (
                <div key={player.player_id} className="relative">
                  <button
                    type="button"
                    onClick={() => toggleAttendee(player.player_id)}
                    className={`
                      w-full p-3 rounded-lg border text-center transition-all
                      ${isDouble 
                        ? 'bg-neon-purple/30 border-neon-purple text-neon-purple ring-2 ring-neon-purple/50'
                        : isAttending
                          ? 'bg-success/20 border-success text-success'
                          : 'bg-cyber-darker border-gray-700 text-gray-400 hover:border-gray-500'
                      }
                    `}
                  >
                    <span className="font-medium">{player.player_name}</span>
                    <div className="text-xs mt-1">
                      {isAttending ? (
                        <span className={isDouble ? 'text-neon-purple font-bold' : 'text-gray-500'}>
                          +{playerPoints} pts {isDouble && '⚡'}
                        </span>
                      ) : (
                        <span className="text-gray-500">+{POINTS.ACTIVITY_ATTENDANCE} pts</span>
                      )}
                    </div>
                  </button>

                  {/* Action buttons for attending players */}
                  {isAttending && (
                    <div className="absolute -top-2 -right-2 flex gap-1">
                      {/* Top Performer Toggle */}
                      <button
                        type="button"
                        onClick={() => setTopPerformer(isTop ? '' : player.player_id)}
                        className={`
                          p-1 rounded-full transition-all
                          ${isTop
                            ? 'bg-gold text-cyber-dark'
                            : 'bg-gray-700 text-gray-400 hover:bg-gold/50'
                          }
                        `}
                        title={isTop ? 'Remove top performer' : 'Set as top performer'}
                      >
                        <Star className="w-4 h-4" fill={isTop ? 'currentColor' : 'none'} />
                      </button>

                      {/* Double Points Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleDoublePoints(player.player_id)}
                        className={`
                          p-1 rounded-full transition-all
                          ${isDouble
                            ? 'bg-neon-purple text-white'
                            : 'bg-gray-700 text-gray-400 hover:bg-neon-purple/50'
                          }
                        `}
                        title={isDouble ? 'Remove double points' : 'Apply 2× points (one-time per cycle)'}
                      >
                        <Zap className="w-4 h-4" fill={isDouble ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Status Messages */}
          <div className="mt-4 space-y-2">
            {topPerformer && (
              <div className="p-3 bg-gold/10 rounded-lg border border-gold/30 text-center">
                <span className="text-gold font-medium">
                  ⭐ {players.find(p => p.player_id === topPerformer)?.player_name} is Top Performer (+{POINTS.ACTIVITY_TOP_PERFORMER} bonus)
                </span>
              </div>
            )}
            {doublePointsPlayer && (
              <div className="p-3 bg-neon-purple/10 rounded-lg border border-neon-purple/30 text-center">
                <span className="text-neon-purple font-medium">
                  ⚡ {players.find(p => p.player_id === doublePointsPlayer)?.player_name} using Double Points (2× multiplier)
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between">
        {message && (
          <span className={message.startsWith('✓') ? 'text-success' : 'text-danger'}>
            {message}
          </span>
        )}
        <div className="flex-1" />
        <button
          type="submit"
          disabled={!selectedActivity || attendees.size === 0 || isSubmitting}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>Log Activity</span>
        </button>
      </div>
    </motion.form>
  );
}
