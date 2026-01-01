/**
 * Main App Component
 * Sets up routing and global layout
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { LeaderboardPage } from './pages/Leaderboard';
import { RulesPage } from './pages/Rules';
import { RewardsPage } from './pages/Rewards';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';

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
            {/* Public Routes */}
            <Route path="/" element={<LeaderboardPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
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
