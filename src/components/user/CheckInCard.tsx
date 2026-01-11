/**
 * CheckInCard - Wednesday Check-In Component for My Achievements
 * Auto-uses logged-in user (no player selection needed)
 */
import { useState, useEffect } from 'react';
import { Calendar, Clock, Check, PartyPopper } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface CheckInCardProps {
  userId: string;
}

function getLastWednesday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysAgo = (dayOfWeek + 7 - 3) % 7;
  
  const lastWednesday = new Date(today);
  lastWednesday.setDate(today.getDate() - daysAgo);
  lastWednesday.setHours(0, 0, 0, 0);
  
  return lastWednesday;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function CheckInCard({ userId }: CheckInCardProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isEarlyBird, setIsEarlyBird] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const lastWednesday = getLastWednesday();
  const lastWednesdayStr = formatDate(lastWednesday);
  const isToday = formatDate(new Date()) === lastWednesdayStr;

  // Check if already checked in
  useEffect(() => {
    async function checkStatus() {
      if (!isSupabaseConfigured()) return;

      try {
        const { data } = await supabase
          .from('attendance')
          .select('id, is_early_bird')
          .eq('player_id', userId)
          .eq('check_in_date', lastWednesdayStr)
          .single();

        if (data) {
          setIsCheckedIn(true);
          setIsEarlyBird(data.is_early_bird);
        }
      } catch (err) {
        // Not checked in yet
      }
    }

    checkStatus();
  }, [userId, lastWednesdayStr]);

  const handleCheckIn = async () => {
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      if (isSupabaseConfigured()) {
        // Get active cycle
        const { data: cycle } = await supabase
          .from('cycles')
          .select('id')
          .eq('is_active', true)
          .single();

        if (!cycle) throw new Error('No active cycle found');

        const { error } = await supabase.from('attendance').insert({
          player_id: userId,
          cycle_id: cycle.id,
          check_in_date: lastWednesdayStr,
          check_in_time: new Date().toTimeString().split(' ')[0],
          is_early_bird: isEarlyBird,
          points: 1,
        });

        if (error) throw error;

        setIsCheckedIn(true);
        setSuccessMessage(isEarlyBird ? '🎉 Early bird check-in recorded! (+1 point + bonus)' : '✅ Check-in recorded! (+1 point)');
      }
    } catch (err) {
      console.error('Check-in error:', err);
      setSuccessMessage('❌ Failed to check in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cyber-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="w-6 h-6 text-neon-blue" />
        <h3 className="text-xl font-bold text-white">Wednesday Check-In</h3>
      </div>

      <div className="space-y-4">
        {/* Current Wednesday Info */}
        <div className="p-4 bg-cyber-darker rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Check-in for:</span>
            <span className="text-white font-medium">{formatDisplayDate(lastWednesday)}</span>
          </div>
          {isToday && (
            <div className="flex items-center gap-2 text-success text-sm">
              <Clock className="w-4 h-4" />
              <span>Today is Wednesday!</span>
            </div>
          )}
        </div>

        {/* Already Checked In */}
        {isCheckedIn ? (
          <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
            <div className="flex items-center gap-2 text-success mb-2">
              {isEarlyBird ? <PartyPopper className="w-5 h-5" /> : <Check className="w-5 h-5" />}
              <span className="font-medium">
                {isEarlyBird ? 'Early Bird Check-in Recorded!' : 'Checked In!'}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              You've already checked in for this Wednesday {isEarlyBird && '(before 11:30 AM)'}.
            </p>
          </div>
        ) : (
          <>
            {/* Early Bird Toggle */}
            <div className="flex items-center justify-between p-4 bg-cyber-darker rounded-lg border border-gray-700">
              <div>
                <label className="text-white font-medium">Early Bird (before 11:30 AM)</label>
                <p className="text-xs text-gray-500">Get bonus points for early arrival</p>
              </div>
              <input
                type="checkbox"
                checked={isEarlyBird}
                onChange={(e) => setIsEarlyBird(e.target.checked)}
                disabled={isSubmitting}
                className="w-5 h-5"
              />
            </div>

            {/* Check-In Button */}
            <button
              onClick={handleCheckIn}
              disabled={isSubmitting}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
                  <span>Checking in...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Check In for {formatDisplayDate(lastWednesday)}</span>
                </>
              )}
            </button>
          </>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="p-3 bg-neon-blue/10 border border-neon-blue/30 rounded-lg text-white text-sm text-center">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
}
