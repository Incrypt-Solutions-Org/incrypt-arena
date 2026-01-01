/**
 * LeaderboardCard Component Tests
 * TDD: Tests written first, then implementation
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LeaderboardCard } from './LeaderboardCard';
import type { LeaderboardEntry } from '../types';

// Mock data for testing
const createMockEntry = (overrides: Partial<LeaderboardEntry> = {}): LeaderboardEntry => ({
  player_id: '1',
  player_name: 'Test User',
  rank: 1,
  total_points: 100,
  attendance_points: 30,
  activity_points: 20,
  course_points: 25,
  blog_points: 10,
  book_points: 0,
  presentation_points: 15,
  idea_points: 5,
  penalty_points: -5,
  is_last_place: false,
  ...overrides,
});

describe('LeaderboardCard Component', () => {
  it('renders player name', () => {
    const entry = createMockEntry({ player_name: 'Hassan' });
    render(<LeaderboardCard entry={entry} totalPlayers={8} />);
    
    expect(screen.getByText('Hassan')).toBeInTheDocument();
  });

  it('renders total points', () => {
    const entry = createMockEntry({ total_points: 150 });
    render(<LeaderboardCard entry={entry} totalPlayers={8} />);
    
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText(/points/i)).toBeInTheDocument();
  });

  it('renders rank badge', () => {
    const entry = createMockEntry({ rank: 1 });
    render(<LeaderboardCard entry={entry} totalPlayers={8} />);
    
    // Should show gold medal for rank 1
    expect(screen.getByText('🥇')).toBeInTheDocument();
  });

  it('shows point breakdown categories', () => {
    const entry = createMockEntry({
      attendance_points: 30,
      activity_points: 20,
      course_points: 25,
    });
    render(<LeaderboardCard entry={entry} totalPlayers={8} showDetails />);
    
    expect(screen.getByText(/attendance/i)).toBeInTheDocument();
    expect(screen.getByText(/activities/i)).toBeInTheDocument();
    expect(screen.getByText(/courses/i)).toBeInTheDocument();
  });

  it('displays negative penalty points in red', () => {
    const entry = createMockEntry({ penalty_points: -10 });
    const { container } = render(<LeaderboardCard entry={entry} totalPlayers={8} showDetails />);
    
    // Check for danger/red class on penalty
    expect(container.querySelector('.text-danger')).toBeInTheDocument();
  });

  it('shows El Kooz badge for last place', () => {
    const entry = createMockEntry({ rank: 8, is_last_place: true });
    render(<LeaderboardCard entry={entry} totalPlayers={8} />);
    
    expect(screen.getByText('🪣')).toBeInTheDocument();
  });

  it('applies gold styling for first place card', () => {
    const entry = createMockEntry({ rank: 1 });
    const { container } = render(<LeaderboardCard entry={entry} totalPlayers={8} />);
    
    // Check for special border/glow on first place
    expect(container.querySelector('.border-gold')).toBeInTheDocument();
  });
});
