/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      backgroundColor: {
        'solaris-blue': '#4D97FF',
        'solaris-gray': '#C0C0C0',
      },
      boxShadow: {
        'solaris-inset': 'inset 1px 1px 2px #333',
        'solaris-outset': '1px 1px 2px #333',
      },
    },
  },
  plugins: [],
}
