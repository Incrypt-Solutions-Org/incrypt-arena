/**
 * CheckInCard - Wednesday Check-In Component for My Achievements
 * Auto-uses logged-in user (no player selection needed)
 */
import { useState, useEffect } from 'react';
import { Calendar, Clock, Check, PartyPopper } from 'lucide-react';
import { db } from '../../lib/supabaseApi';
import { useAuth } from '../../hooks/useAuth';

interface CheckInCardProps {
  userId: string;
  onSuccess?: () => void;
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

export function CheckInCard({ userId, onSuccess }: CheckInCardProps) {
  const { session } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isEarlyBird, setIsEarlyBird] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const lastWednesday = getLastWednesday();
  const lastWednesdayStr = formatDate(lastWednesday);

  // Check if already checked in
  useEffect(() => {
    async function checkStatus() {
      if (!db.isConfigured()) return;

      const { data } = await db.select<{ id: string; is_early_bird: boolean }[]>('attendance', {
        columns: 'id,is_early_bird',
        filters: { 'player_id': `eq.${userId}`, 'check_in_date': `eq.${lastWednesdayStr}` },
        limit: 1,
      });

      if (data && data.length > 0) {
        setIsCheckedIn(true);
        setIsEarlyBird(data[0].is_early_bird);
      }
    }

    checkStatus();
  }, [userId, lastWednesdayStr]);

  const handleCheckIn = async () => {
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      if (db.isConfigured()) {
        // Get active cycle
        const { data: cycles } = await db.select<{ id: string }[]>('cycles', {
          columns: 'id',
          filters: { 'is_active': 'eq.true' },
          limit: 1,
        });

        if (!cycles || cycles.length === 0) throw new Error('No active cycle found');
        const cycle = cycles[0];

        const { error } = await db.insert('attendance', {
          player_id: userId,
          cycle_id: cycle.id,
          check_in_date: lastWednesdayStr,
          check_in_time: new Date().toTimeString().split(' ')[0],
          is_early_bird: isEarlyBird,
          points: 1,
        }, { authToken: session?.access_token });

        if (error) throw new Error(error.message);

        setIsCheckedIn(true);
        setSuccessMessage(isEarlyBird ? '🎉 Early bird check-in recorded! (+1 point + bonus)' : '✅ Check-in recorded! (+1 point)');
        if (onSuccess) onSuccess();
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
          {formatDate(new Date()) === lastWednesdayStr && (
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
