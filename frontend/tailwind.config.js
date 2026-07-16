/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#050607',
        gunmetal: {
          950: '#0a0b0d',
          900: '#12141a',
          800: '#1a1d24',
          700: '#242833',
          600: '#2e3340',
        },
        silver: {
          300: '#c0c5d0',
          400: '#8b92a5',
          500: '#6b7285',
        },
        neon: {
          blue: '#00d4ff',
          purple: '#7b5cff',
          cyan: '#22f5d4',
        },
      },
      fontFamily: {
        display: ['"Orbitron"', 'sans-serif'],
        body: ['"Rajdhani"', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(0, 212, 255, 0.35)',
        'glow-purple': '0 0 28px rgba(123, 92, 255, 0.4)',
        'glow-cyan': '0 0 20px rgba(34, 245, 212, 0.35)',
        metal: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 32px rgba(0,0,0,0.45)',
      },
      backgroundImage: {
        'metal-sheen':
          'linear-gradient(135deg, rgba(192,197,208,0.12) 0%, rgba(26,29,36,0.9) 40%, rgba(10,11,13,0.95) 100%)',
        'neon-gradient': 'linear-gradient(135deg, #00d4ff 0%, #7b5cff 50%, #22f5d4 100%)',
        'grid-fade':
          'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
      },
      animation: {
        'glow-pulse': 'glowPulse 1.2s ease-out',
        'rank-shift': 'rankShift 0.6s ease-out',
        'fade-up': 'fadeUp 0.5s ease-out',
      },
      keyframes: {
        glowPulse: {
          '0%': {
            boxShadow: '0 0 0 0 rgba(0, 212, 255, 0)',
            backgroundColor: 'rgba(0, 212, 255, 0.25)',
          },
          '40%': {
            boxShadow: '0 0 32px 4px rgba(123, 92, 255, 0.55)',
            backgroundColor: 'rgba(123, 92, 255, 0.18)',
          },
          '100%': {
            boxShadow: '0 0 0 0 rgba(0, 212, 255, 0)',
            backgroundColor: 'transparent',
          },
        },
        rankShift: {
          '0%': { transform: 'translateX(-6px)', opacity: '0.6' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
