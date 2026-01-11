/**
 * Login Page
 * Email/password authentication with role-based redirect
 */
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated, isAdmin, playerData, error: authError, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && playerData) {
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, isAdmin, playerData, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const success = await signIn(email, password);
      if (success) {
        // Wait a moment for playerData to load
        setTimeout(() => {
          setIsSubmitting(false);
          // Redirect happens in useEffect above
        }, 500);
      } else {
        setError(authError || 'Login failed. Please check your credentials.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-dark via-cyber-darker to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-8 max-w-md w-full"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/incrypt-logo.jpg"
            alt="Incrypt Solutions"
            className="h-16 w-auto mx-auto rounded-lg shadow-lg shadow-neon-blue/20 mb-4"
          />
          <h1 className="font-display text-3xl font-bold neon-text mb-2">
            Incrypt Arena
          </h1>
          <p className="text-gray-400">Sign in to continue</p>
        </div>

        {/* Important Notice */}
        <div className="mb-6 p-4 bg-neon-blue/10 border border-neon-blue/30 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-neon-blue flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-white mb-1">First time here?</p>
              <p>Players and admins use the same login. Your account type determines what you see after signing in.</p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none"
              required
              disabled={isSubmitting || isLoading}
              placeholder="your.email@incrypt.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none"
              required
              disabled={isSubmitting || isLoading}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="p-3 bg-danger/20 border border-danger/50 rounded-lg text-danger text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {isSubmitting || isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Signup Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-neon-blue hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            Need help? Contact your administrator to create an account or reset your password.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
