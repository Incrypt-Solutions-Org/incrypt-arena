/**
 * Header Component - Role-Based Navigation
 * Shows different nav links based on user role (player/admin)
 */
import { Link, useLocation } from 'react-router-dom';
import { Trophy, BookOpen, Shield, Gift, User, Users, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// Navigation links for players
const PLAYER_NAV_LINKS = [
  { path: '/', label: 'Leaderboard', icon: Trophy },
  { path: '/my-achievements', label: 'My Achievements', icon: User },
  { path: '/team-achievements', label: 'Team', icon: Users },
  { path: '/rules', label: 'Rules', icon: BookOpen },
  { path: '/rewards', label: 'Rewards', icon: Gift },
] as const;

// Navigation links for admins
const ADMIN_NAV_LINKS = [
  { path: '/admin/dashboard', label: 'Admin Dashboard', icon: Shield },
  { path: '/', label: 'Leaderboard', icon: Trophy },
  { path: '/rules', label: 'Rules', icon: BookOpen },
] as const;

export function Header() {
  const location = useLocation();
  const { isAuthenticated, isAdmin, playerData, signOut } = useAuth();

  // Select nav links based on role
  const navLinks = isAdmin ? ADMIN_NAV_LINKS : PLAYER_NAV_LINKS;

  // Don't show header on login/signup pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

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
          {isAuthenticated ? (
            <>
              {/* Role-based nav links */}
              {navLinks.map(({ path, label, icon: Icon }) => {
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
                    <span className="hidden md:inline">{label}</span>
                  </Link>
                );
              })}
              
              {/* User info & Logout */}
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-700">
                {playerData && (
                  <span className="text-sm text-gray-400 hidden lg:inline">
                    {playerData.name}
                  </span>
                )}
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-danger hover:bg-danger/10 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Public nav when not logged in */}
              <Link to="/" className={`flex items-center gap-2 px-4 py-2 rounded-lg ${location.pathname === '/' ? 'bg-neon-blue/20 text-neon-blue' : 'text-gray-300'}`}>
                <Trophy className="w-4 h-4" />
                <span className="hidden md:inline">Leaderboard</span>
              </Link>
              <Link to="/rules" className={`flex items-center gap-2 px-4 py-2 rounded-lg ${location.pathname === '/rules' ? 'bg-neon-blue/20 text-neon-blue' : 'text-gray-300'}`}>
                <BookOpen className="w-4 h-4" />
                <span className="hidden md:inline">Rules</span>
              </Link>
              <Link to="/rewards" className={`flex items-center gap-2 px-4 py-2 rounded-lg ${location.pathname === '/rewards' ? 'bg-neon-blue/20 text-neon-blue' : 'text-gray-300'}`}>
                <Gift className="w-4 h-4" />
                <span className="hidden md:inline">Rewards</span>
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 btn-primary rounded-lg"
              >
                Login
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
