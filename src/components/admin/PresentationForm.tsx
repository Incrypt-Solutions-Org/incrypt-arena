/**
 * PresentationForm Component
 * Form for logging presentations with presenter selection and URLs
 * 
 * Point Logic:
 * - 1st Solo: 30 pts (player's first ever presentation, done alone)
 * - 1st Pair: 20 pts (player's first ever presentation, with partner)
 * - 2nd+ Solo: 20 pts (player has presented before, doing solo)
 * - 2nd+ Pair: 15 pts (player has presented before, with partner)
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Presentation, Send, Link as LinkIcon, Calendar as CalendarIcon, Info } from 'lucide-react';
import type { LeaderboardEntry } from '../../types';
import { POINTS } from '../../types';
import { db } from '../../lib/supabaseApi';
import { useAuth } from '../../hooks/useAuth';

interface PresentationFormProps {
  players: LeaderboardEntry[];
  onSuccess?: () => void;
}

interface PlayerPresentationCount {
  [playerId: string]: number;
}

export function PresentationForm({ players, onSuccess }: PresentationFormProps) {
  const { session } = useAuth();
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [firstPresenter, setFirstPresenter] = useState('');
  const [secondPresenter, setSecondPresenter] = useState('');
  const [slidesUrl, setSlidesUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [evalLink, setEvalLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // Separate counts for solo and pair presentations
  const [soloCounts, setSoloCounts] = useState<PlayerPresentationCount>({});
  const [pairCounts, setPairCounts] = useState<PlayerPresentationCount>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);

  // Load presentation counts (separate for solo and pair) on mount
  useEffect(() => {
    async function loadPresentationCounts() {
      if (!db.isConfigured()) {
        setIsLoadingCounts(false);
        return;
      }

      try {
        // Get presentations with is_solo flag
        const { data } = await db.select<{ player_id: string; is_solo: boolean }[]>('presentations', {
          columns: 'player_id,is_solo',
        });

        if (data) {
          const soloMap: PlayerPresentationCount = {};
          const pairMap: PlayerPresentationCount = {};
          
          data.forEach(p => {
            if (p.is_solo) {
              soloMap[p.player_id] = (soloMap[p.player_id] || 0) + 1;
            } else {
              pairMap[p.player_id] = (pairMap[p.player_id] || 0) + 1;
            }
          });
          
          setSoloCounts(soloMap);
          setPairCounts(pairMap);
        }
      } catch (err) {
        console.error('Failed to load presentation counts:', err);
      } finally {
        setIsLoadingCounts(false);
      }
    }

    loadPresentationCounts();
  }, []);

  const isSolo = !secondPresenter;
  
  // Calculate points based on whether this is the player's first SOLO or first PAIR presentation
  // (tracked separately - a player's 1st solo still gets 30 pts even if they've done pairs before)
  const getPointsForPlayer = (playerId: string) => {
    if (isSolo) {
      const soloCount = soloCounts[playerId] || 0;
      return soloCount === 0 ? POINTS.FIRST_SOLO_PRESENTATION : POINTS.SECOND_SOLO_PRESENTATION;
    } else {
      const pairCount = pairCounts[playerId] || 0;
      return pairCount === 0 ? POINTS.FIRST_PAIR_PRESENTATION : POINTS.SECOND_PAIR_PRESENTATION;
    }
  };

  const firstPresenterPoints = firstPresenter ? getPointsForPlayer(firstPresenter) : 0;
  const secondPresenterPoints = secondPresenter ? getPointsForPlayer(secondPresenter) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !date || !firstPresenter) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      if (db.isConfigured()) {
        const { data: cycles } = await db.select<{ id: string }[]>('cycles', { columns: 'id', filters: { 'is_active': 'eq.true' }, limit: 1 });
        if (!cycles || cycles.length === 0) throw new Error('No active cycle');
        const cycle = cycles[0];

        const { error: firstError } = await db.insert('presentations', {
          player_id: firstPresenter,
          second_presenter_id: secondPresenter || null,
          cycle_id: cycle.id,
          topic,
          date,
          slides_url: slidesUrl || null,
          youtube_url: youtubeUrl || null,
          eval_link: evalLink || null,
          is_solo: isSolo,
          presentation_order: 1,
          points: firstPresenterPoints,
        }, { authToken: session?.access_token });

        if (firstError) throw new Error(firstError.message);

        if (secondPresenter) {
          const { error: secondError } = await db.insert('presentations', {
            player_id: secondPresenter,
            second_presenter_id: firstPresenter,
            cycle_id: cycle.id,
            topic,
            date,
            slides_url: slidesUrl || null,
            youtube_url: youtubeUrl || null,
            eval_link: evalLink || null,
            is_solo: false,
            presentation_order: 2,
            points: secondPresenterPoints,
          }, { authToken: session?.access_token });

          if (secondError) throw new Error(secondError.message);
        }

        // Update local counts (solo or pair based on presentation type)
        if (isSolo) {
          setSoloCounts((prev: PlayerPresentationCount) => ({
            ...prev,
            [firstPresenter]: (prev[firstPresenter] || 0) + 1,
          }));
        } else {
          setPairCounts((prev: PlayerPresentationCount) => ({
            ...prev,
            [firstPresenter]: (prev[firstPresenter] || 0) + 1,
            [secondPresenter]: (prev[secondPresenter] || 0) + 1,
          }));
        }
      }

      const firstName = players.find(p => p.player_id === firstPresenter)?.player_name;
      const secondName = secondPresenter ? players.find(p => p.player_id === secondPresenter)?.player_name : null;
      const presenters = secondName ? `${firstName} & ${secondName}` : firstName;
      setMessage(`✓ "${topic}" logged for ${presenters}!`);
      setTopic('');
      setDate('');
      setFirstPresenter('');
      setSecondPresenter('');
      setSlidesUrl('');
      setYoutubeUrl('');
      setEvalLink('');
      onSuccess?.();
    } catch (err) {
      console.error('Failed to log presentation:', err);
      setMessage('❌ Failed to log presentation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableSecondPresenters = players.filter(p => p.player_id !== firstPresenter);

  // Helper to get presentation status text (shows both solo and pair history)
  const getPresentationStatus = (playerId: string) => {
    const solo = soloCounts[playerId] || 0;
    const pair = pairCounts[playerId] || 0;
    if (solo === 0 && pair === 0) return 'new';
    const parts = [];
    if (solo > 0) parts.push(`${solo} solo`);
    if (pair > 0) parts.push(`${pair} pair`);
    return parts.join(', ');
  };

  return (
    <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-6">
      <div className="cyber-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-white flex items-center gap-2"><Presentation className="w-5 h-5 text-neon-blue" />Log Presentation</h2>
            <p className="text-sm text-gray-400 mt-1">1st solo: +30 • 1st pair: +20 • 2nd+ solo: +20 • 2nd+ pair: +15</p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="cyber-card p-4 border-neon-blue/30 bg-neon-blue/5">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-neon-blue flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium text-white mb-1">Point Calculation:</p>
            <ul className="space-y-1 text-gray-400">
              <li>• Points are based on whether this is the player's <strong className="text-white">1st</strong> or <strong className="text-white">2nd+</strong> presentation</li>
              <li>• Solo presentations earn more than pair presentations</li>
              <li>• Each presenter gets points separately based on their own history</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="cyber-card p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Topic *</label>
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Docker Fundamentals" className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2"><CalendarIcon className="w-4 h-4" />Date *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">1st Presenter *</label>
            <select value={firstPresenter} onChange={(e) => setFirstPresenter(e.target.value)} className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" required disabled={isLoadingCounts}>
              <option value="">{isLoadingCounts ? 'Loading...' : 'Choose presenter...'}</option>
              {players.map((player) => {
                const status = getPresentationStatus(player.player_id);
                return (
                  <option key={player.player_id} value={player.player_id}>
                    {player.player_name} ({status})
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">2nd Presenter (Optional)</label>
            <select value={secondPresenter} onChange={(e) => setSecondPresenter(e.target.value)} className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" disabled={!firstPresenter || isLoadingCounts}>
              <option value="">Solo presentation</option>
              {availableSecondPresenters.map((player) => {
                const status = getPresentationStatus(player.player_id);
                return (
                  <option key={player.player_id} value={player.player_id}>
                    {player.player_name} ({status})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {firstPresenter && (
          <div className="p-4 bg-neon-blue/10 rounded-lg border border-neon-blue/30">
            <div className="text-center space-y-1">
              {isSolo ? (
                <div className="text-neon-blue font-medium">
                  <span className="text-lg">Solo: +{firstPresenterPoints} points</span>
                  <p className="text-sm text-gray-400 mt-1">
                    {players.find(p => p.player_id === firstPresenter)?.player_name} 
                    <span className="text-neon-purple ml-2">({getPresentationStatus(firstPresenter)})</span>
                  </p>
                </div>
              ) : (
                <div className="text-neon-blue font-medium">
                  <span className="text-lg">Pair Presentation</span>
                  <div className="flex justify-center gap-6 mt-2 text-sm">
                    <div>
                      <span className="text-white">{players.find(p => p.player_id === firstPresenter)?.player_name}</span>
                      <span className="text-neon-blue ml-2">+{firstPresenterPoints}</span>
                      <span className="text-neon-purple ml-1 text-xs">({getPresentationStatus(firstPresenter)})</span>
                    </div>
                    <div>
                      <span className="text-white">{players.find(p => p.player_id === secondPresenter)?.player_name}</span>
                      <span className="text-neon-blue ml-2">+{secondPresenterPoints}</span>
                      <span className="text-neon-purple ml-1 text-xs">({getPresentationStatus(secondPresenter)})</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2"><LinkIcon className="w-4 h-4" />Slides Link (URL)</label><input type="url" value={slidesUrl} onChange={(e) => setSlidesUrl(e.target.value)} placeholder="https://...slides link" className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2"><LinkIcon className="w-4 h-4" />YouTube Link (URL)</label><input type="url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/..." className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2"><LinkIcon className="w-4 h-4" />Evaluation Link (URL)</label><input type="url" value={evalLink} onChange={(e) => setEvalLink(e.target.value)} placeholder="https://...evaluation form" className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" /></div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {message && <span className={message.startsWith('✓') ? 'text-success' : 'text-danger'}>{message}</span>}
        <div className="flex-1" />
        <button type="submit" disabled={!topic || !date || !firstPresenter || isSubmitting || isLoadingCounts} className="btn-primary flex items-center gap-2 disabled:opacity-50">
          {isSubmitting ? <div className="w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Log Presentation</span>
        </button>
      </div>
    </motion.form>
  );
}
