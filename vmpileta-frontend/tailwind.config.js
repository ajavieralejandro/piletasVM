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
        // Colores principales del club Villa Mitre
        'villamitre': {
          'green': '#1a4d3e',
          'green-light': '#2d6a57',
          'green-dark': '#0f3329',
        },
        // Paleta Dark Mode personalizada
        'dark': {
          'bg-primary': '#0f1419',      // Fondo principal (muy oscuro)
          'bg-secondary': '#1a2332',    // Cards y tablas
          'bg-tertiary': '#22303f',     // Hover y elementos elevados
          'border': '#2d3748',          // Bordes
          'text-primary': '#e5e7eb',    // Texto principal
          'text-secondary': '#9ca3af',  // Texto secundario
          'text-tertiary': '#6b7280',   // Texto terciario
        },
        // Cyan/Verde agua para elementos activos
        'accent': {
          'cyan': '#4fd1c5',
          'cyan-light': '#7eddd4',
          'cyan-dark': '#38b2ac',
        },
        // Colores originales del sistema (modo claro)
        primary: {
          50: '#e6f7f4',
          100: '#b3e8dd',
          200: '#80d9c6',
          300: '#4dcaaf',
          400: '#1abb98',
          500: '#16a085',
          600: '#138573',
          700: '#106a61',
          800: '#0d4f4f',
          900: '#0a343d',
        },
      },
    },
  },
  plugins: [],
}
