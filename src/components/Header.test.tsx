/**
 * Header Component Tests
 * TDD: Tests written first, then implementation
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './Header';

// Helper to render with router context
const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  it('renders the Incrypt Solutions logo', () => {
    renderWithRouter(<Header />);
    
    const logo = screen.getByAltText(/incrypt/i);
    expect(logo).toBeInTheDocument();
  });

  it('renders the Incrypt Arena title', () => {
    renderWithRouter(<Header />);
    
    expect(screen.getByText(/incrypt arena/i)).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderWithRouter(<Header />);
    
    expect(screen.getByRole('link', { name: /leaderboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /rules/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
  });

  it('has correct navigation link destinations', () => {
    renderWithRouter(<Header />);
    
    expect(screen.getByRole('link', { name: /leaderboard/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /rules/i })).toHaveAttribute('href', '/rules');
    expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', '/login');
  });
});
