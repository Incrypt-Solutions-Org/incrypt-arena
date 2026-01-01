/**
 * Header Component
 * Main navigation header with Incrypt logo and nav links
 */
import { Link, useLocation } from 'react-router-dom';
import { Trophy, BookOpen, Shield, Gift } from 'lucide-react';

/**
 * Navigation link configuration
 * Defines the main menu structure
 */
const NAV_LINKS = [
  { path: '/', label: 'Leaderboard', icon: Trophy },
  { path: '/rules', label: 'Rules', icon: BookOpen },
  { path: '/rewards', label: 'Rewards', icon: Gift },
  { path: '/admin', label: 'Admin', icon: Shield },
] as const;

export function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-cyber-darker/90 backdrop-blur-md border-b border-neon-blue/20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-4 group">
          <img
            src="/incrypt-logo.jpg"
            alt="Incrypt Solutions"
            className="h-12 w-auto rounded-lg shadow-lg shadow-neon-blue/20 
                       group-hover:shadow-neon-blue/40 transition-shadow duration-300"
          />
          <div className="hidden sm:block">
            <h1 className="font-display text-2xl font-bold neon-text">
              Incrypt Arena
            </h1>
            <p className="text-xs text-gray-400">Incrypt Solutions</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2">
          {NAV_LINKS.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            
            return (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg
                  transition-all duration-300 font-medium
                  ${isActive 
                    ? 'bg-neon-blue/20 text-neon-blue neon-border' 
                    : 'text-gray-300 hover:text-neon-blue hover:bg-neon-blue/10'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
