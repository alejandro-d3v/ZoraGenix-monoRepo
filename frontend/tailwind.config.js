/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta principal de SoraGemiX
        nanoBlue: {
          50: '#e6f7ff',
          100: '#bae7ff',
          200: '#91d5ff',
          300: '#69c0ff',
          400: '#40a9ff',
          500: '#00D4FF', // Color principal
          600: '#0099cc',
          700: '#006699',
          800: '#004466',
          900: '#002233'
        },
        // Grises personalizados
        slate: {
          850: '#1e293b',
          950: '#0f172a'
        },
        // Gradientes holográficos
        holographic: {
          from: '#00D4FF',
          via: '#7c3aed',
          to: '#ec4899'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif']
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'spin-slow': 'spin 8s linear infinite'
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'holographic': 'linear-gradient(45deg, #00D4FF, #7c3aed, #ec4899, #00D4FF)',
        'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(228,100%,74%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%)'
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 212, 255, 0.5)',
        'neon-lg': '0 0 40px rgba(0, 212, 255, 0.6)',
        'holographic': '0 8px 32px rgba(0, 212, 255, 0.3)',
        'inner-glow': 'inset 0 2px 4px 0 rgba(0, 212, 255, 0.2)'
      },
      backdropBlur: {
        xs: '2px'
      }
    },
  },
  plugins: [],
}