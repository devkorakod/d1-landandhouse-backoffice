import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: 'var(--color-ink)', soft: 'var(--color-ink-soft)' },
        red: { DEFAULT: 'var(--color-red)', bright: 'var(--color-red-bright)' },
        white: { DEFAULT: 'var(--color-white)', deep: 'var(--color-white-deep)' },
        muted: 'var(--color-muted)',
        line: 'var(--color-line)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
    },
  },
  plugins: [],
} satisfies Config;
