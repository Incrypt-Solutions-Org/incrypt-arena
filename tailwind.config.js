/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Cyberpunk color palette
      colors: {
        // Primary backgrounds
        'cyber-dark': '#0a0e1a',
        'cyber-darker': '#050810',
        'cyber-card': '#101827',
        
        // Neon accent colors
        'neon-blue': '#00d4ff',
        'neon-cyan': '#0ea5e9',
        'neon-purple': '#a855f7',
        
        // Rank colors
        'gold': '#fbbf24',
        'gold-bright': '#fcd34d',
        'silver': '#94a3b8',
        'silver-bright': '#cbd5e1',
        'bronze': '#cd7f32',
        'bronze-bright': '#d4a574',
        
        // Status colors
        'danger': '#ef4444',
        'success': '#22c55e',
      },
      
      // Custom animations for cyberpunk effects
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slide-in 0.5s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00d4ff, 0 0 10px #00d4ff' },
          '100%': { boxShadow: '0 0 20px #00d4ff, 0 0 40px #00d4ff' },
        },
        'pulse-neon': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      
      // Custom fonts
      fontFamily: {
        'display': ['Orbitron', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
