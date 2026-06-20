export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#f8f6f2',
        luxury: '#1a1a1a',
        gold: '#c6a43f',
        charcoal: '#111827',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 30px 80px rgba(26, 26, 26, 0.08)',
      },
    },
  },
  plugins: [],
}
