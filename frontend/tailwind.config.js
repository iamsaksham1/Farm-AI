/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ground: {
          light: '#f5f5f3',
          dark: '#141413',
        },
        surface: {
          light: '#ffffff',
          dark: '#1c1b1a',
        },
        surfaceElevated: {
          light: '#fafafa',
          dark: '#232220',
        },
        ink: {
          DEFAULT: '#1a1a1a',
          dark: '#f3f3ef',
          muted: '#737373',
          'muted-dark': '#9e9e98',
          faint: '#a3a3a3',
          'faint-dark': '#666663',
        },
        hairline: {
          light: 'rgba(0, 0, 0, 0.08)',
          dark: 'rgba(255, 255, 255, 0.08)',
          strong: 'rgba(0, 0, 0, 0.16)',
          'strong-dark': 'rgba(255, 255, 255, 0.16)',
        },
        // Restrained functional accents
        sev: {
          healthy: '#15803d',     // Green
          healthyLight: '#dcfce7',
          low: '#65a30d',         // Lime-olive
          lowLight: '#ecfccb',
          med: '#d97706',         // Amber
          medLight: '#fef3c7',
          high: '#ea580c',        // Orange
          highLight: '#ffedd5',
          critical: '#dc2626',    // Red
          criticalLight: '#fee2e2',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.02)',
        'soft-dark': '0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)',
        'specimen': '0 2px 8px rgba(0,0,0,0.04), 0 20px 40px rgba(0,0,0,0.03)',
      },
      animation: {
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'sweep': 'sweep 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.85', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        sweep: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { opacity: '0.6' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
