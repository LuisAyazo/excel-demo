/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFA500', // Color amarillo-naranja principal
        'primary-dark': '#FF8C00', // Versión más oscura para hover
        'primary-light': '#FFD700', // Versión más clara
        secondary: '#1A1A1A', // Negro para textos principales
        'background': '#FFFFFF', // Blanco para fondos principales
        'background-alt': '#F5F5F5', // Gris muy claro para fondos alternativos
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}