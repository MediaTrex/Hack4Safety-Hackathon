/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary:'#0165E1',
        // primary:       '#1a3a6b',
        'primary-dark':'#0f2347',
        'primary-mid': '#1e4080',
        'primary-light':'#2563eb',
        accent:        '#e63946',
        success:       '#16a34a',
        warning:       '#ea580c',
        info:          '#0284c7',
        surface:       '#ffffff',
        'bg-base':     '#f0f4f8',
        'bg-card':     '#ffffff',
        border:        '#e8edf3',
        'text-main':   '#1e293b',
        'text-sub':    '#64748b',
        'text-muted':  '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        xl2: '14px',
        xl3: '18px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
};
