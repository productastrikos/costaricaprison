/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── CACCO command palette ──────────────────────────────
        'app-bg':       '#081018',
        'app-bg-deep':  '#050b12',
        'app-panel':    '#132235',
        'app-panel-2':  '#0F1B2B',
        'app-dark':     '#0F1B2B',
        'app-darker':   '#081018',
        'app-border':   '#1D3652',
        'app-border-strong': '#295182',
        'app-accent':   '#4AA8FF',
        'app-cyan':     '#35E0D4',
        'app-violet':   '#9B6BFF',
        'app-success':  '#00D26A',
        'app-warning':  '#FFC247',
        'app-danger':   '#FF4D4D',
        'app-info':     '#4AA8FF',
        // Security levels
        'sec-1': '#00D26A',
        'sec-2': '#4AA8FF',
        'sec-3': '#FFC247',
        'sec-4': '#FF4D4D',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
