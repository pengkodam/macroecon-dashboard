/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        midnight: '#0a0f1a',
        ink: '#141b2d',
        slate: '#1e293b',
        mist: '#94a3b8',
        pearl: '#e2e8f0',
        gold: '#f59e0b',
        emerald: '#10b981',
        coral: '#f43f5e',
        sky: '#38bdf8',
        amethyst: '#a78bfa',
      },
    },
  },
  plugins: [],
};
