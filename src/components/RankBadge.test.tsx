/**
 * RankBadge Component Tests
 * TDD: Tests written first, then implementation
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RankBadge } from './RankBadge';

describe('RankBadge Component', () => {
  it('displays gold medal for rank 1', () => {
    render(<RankBadge rank={1} totalPlayers={8} />);
    
    expect(screen.getByText('🥇')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('displays silver medal for rank 2', () => {
    render(<RankBadge rank={2} totalPlayers={8} />);
    
    expect(screen.getByText('🥈')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays bronze medal for rank 3', () => {
    render(<RankBadge rank={3} totalPlayers={8} />);
    
    expect(screen.getByText('🥉')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays El Kooz (bucket) icon for last place', () => {
    render(<RankBadge rank={8} totalPlayers={8} />);
    
    expect(screen.getByText('🪣')).toBeInTheDocument();
    expect(screen.getByText(/el kooz/i)).toBeInTheDocument();
  });

  it('displays regular rank number for middle positions', () => {
    render(<RankBadge rank={5} totalPlayers={8} />);
    
    expect(screen.getByText('5')).toBeInTheDocument();
    // Should not show any medal
    expect(screen.queryByText('🥇')).not.toBeInTheDocument();
    expect(screen.queryByText('🥈')).not.toBeInTheDocument();
    expect(screen.queryByText('🥉')).not.toBeInTheDocument();
    expect(screen.queryByText('🪣')).not.toBeInTheDocument();
  });

  it('applies gold styling for first place', () => {
    const { container } = render(<RankBadge rank={1} totalPlayers={8} />);
    
    // Check for gold-related class
    expect(container.querySelector('.gold-shimmer')).toBeInTheDocument();
  });

  it('applies silver styling for second place', () => {
    const { container } = render(<RankBadge rank={2} totalPlayers={8} />);
    
    expect(container.querySelector('.silver-shine')).toBeInTheDocument();
  });

  it('applies bronze styling for third place', () => {
    const { container } = render(<RankBadge rank={3} totalPlayers={8} />);
    
    expect(container.querySelector('.bronze-glow')).toBeInTheDocument();
  });
});
