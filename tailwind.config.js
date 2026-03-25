/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      maxWidth: {
        content: '1200px',
      },
      colors: {
        primary: {
          DEFAULT: '#2e7d32',
          dark: '#1b5e20',
          light: '#e8f5e9',
        },
        error: '#e53935',
        warning: '#f57c00',
        info: '#1565c0',
        surface: '#ffffff',
        background: '#f0f2f5',
      },
    },
  },
  plugins: [],
};
