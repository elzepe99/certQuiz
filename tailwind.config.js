/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          canvas: '#0B0F14',
          panel: '#11161D',
          'panel-hi': '#161D26',
        },
        border: {
          subtle: '#1E2630',
          DEFAULT: '#2A3340',
          strong: '#3A4554',
        },
        text: {
          primary: '#E6EDF5',
          secondary: '#9AA8BC',
          muted: '#6A7689',
          faint: '#4A5466',
        },
        accent: {
          DEFAULT: '#7AB8FF',
          hi: '#A8D0FF',
        },
        success: {
          DEFAULT: '#4ADE80',
        },
        danger: {
          DEFAULT: '#F87171',
        },
        warning: {
          DEFAULT: '#FBBF24',
        },
      },
      backgroundColor: {
        'accent-soft': 'rgba(122, 184, 255, 0.08)',
        'success-soft': 'rgba(74, 222, 128, 0.10)',
        'danger-soft': 'rgba(248, 113, 113, 0.10)',
        'warning-soft': 'rgba(251, 191, 36, 0.10)',
      },
      borderColor: {
        'accent-line': 'rgba(122, 184, 255, 0.35)',
        'success-line': 'rgba(74, 222, 128, 0.35)',
        'danger-line': 'rgba(248, 113, 113, 0.35)',
        'warning-line': 'rgba(251, 191, 36, 0.45)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-lg': ['32px', { lineHeight: '1.25', fontWeight: '400' }],
        'display-md': ['28px', { lineHeight: '1.3', fontWeight: '400' }],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '12px',
        lg: '16px',
      },
      boxShadow: {
        'accent-glow': '0 0 0 1px rgba(122, 184, 255, 0.35), 0 0 24px -8px rgba(122, 184, 255, 1)',
      },
      keyframes: {
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-down': 'slideDown 200ms ease-out',
        'fade-in': 'fadeIn 160ms ease-out',
      },
    },
  },
  plugins: [],
};
