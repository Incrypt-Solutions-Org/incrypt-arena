/**
 * Main App Component
 * Sets up routing and global layout
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LeaderboardPage } from './pages/Leaderboard';
import { RulesPage} from './pages/Rules';
import { RewardsPage } from './pages/Rewards';
import { CheckInPage } from './pages/CheckIn';
import { AdminDashboard } from './pages/AdminDashboard';
import MyAchievements from './pages/MyAchievements';
import TeamAchievements from './pages/TeamAchievements';
import Login from './pages/Login';
import Signup from './pages/Signup';

export default function App() {
  return (
    <BrowserRouter>
      {/* Global Layout */}
      <div className="min-h-screen flex flex-col bg-cyber-dark">
        {/* Header (fixed) */}
        <Header />

        {/* Main Content */}
        <main className="flex-1">
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Public Routes */}
            <Route path="/" element={<LeaderboardPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            
            {/* Protected User Routes */}
            <Route path="/checkin" element={<ProtectedRoute><CheckInPage /></ProtectedRoute>} />
            <Route path="/my-achievements" element={<ProtectedRoute><MyAchievements /></ProtectedRoute>} />
            <Route path="/team-achievements" element={<ProtectedRoute><TeamAchievements /></ProtectedRoute>} />
            
            {/* Protected Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
            
            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

/**
 * 404 Not Found Page
 */
function NotFound() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="font-display text-6xl font-bold text-danger mb-4">404</h1>
      <p className="text-gray-400 mb-4">Page not found</p>
      <a href="/" className="btn-primary">
        Back to Leaderboard
      </a>
    </div>
  );
}

/**
 * Simple Footer Component
 */
function Footer() {
  return (
    <footer className="bg-cyber-darker border-t border-neon-blue/10 py-4">
      <div className="container mx-auto px-4 text-center text-sm text-gray-500">
        <p>
          © {new Date().getFullYear()} Incrypt Solutions • Incrypt Arena
        </p>
      </div>
    </footer>
  );
}
