import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        glass: {
          DEFAULT: 'hsl(var(--glass))',
          border: 'hsl(var(--glass-border))',
          premium: 'hsl(var(--glass-premium))',
          'premium-border': 'hsl(var(--glass-premium-border))'
        },
        overlay: 'hsl(var(--overlay))',
        category: {
          study: 'hsl(var(--study))',
          work: 'hsl(var(--work))',
          habits: 'hsl(var(--habits))',
          personal: 'hsl(var(--personal))'
        },
        city: {
          sky: 'hsl(var(--sky-day))',
          sunset: 'hsl(var(--sky-sunset))',
          night: 'hsl(var(--sky-night))',
          grass: 'hsl(var(--grass))',
          building: 'hsl(var(--building))'
        },
        achievement: {
          gold: 'hsl(var(--gold))',
          silver: 'hsl(var(--silver))',
          bronze: 'hsl(var(--bronze))'
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'full': '9999px',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      backdropBlur: {
        'glass': '40px',
        'glass-strong': '60px',
        'overlay': '20px'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-out': {
          from: { opacity: '1', transform: 'translateY(0)' },
          to: { opacity: '0', transform: 'translateY(10px)' }
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' }
        },
        'scale-out': {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.9)' }
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(100%)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-down': {
          from: { opacity: '1', transform: 'translateY(0)' },
          to: { opacity: '0', transform: 'translateY(100%)' }
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' }
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        },
        'celebrate': {
          '0%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.05)' },
          '50%': { transform: 'scale(1)' },
          '75%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'walk-1': {
          '0%, 100%': { transform: 'translateX(0) translateY(0)' },
          '25%': { transform: 'translateX(8px) translateY(-2px)' },
          '50%': { transform: 'translateX(16px) translateY(0)' },
          '75%': { transform: 'translateX(8px) translateY(-2px)' }
        },
        'walk-2': {
          '0%, 100%': { transform: 'translateX(0) translateY(0)' },
          '25%': { transform: 'translateX(-6px) translateY(-1px)' },
          '50%': { transform: 'translateX(-12px) translateY(0)' },
          '75%': { transform: 'translateX(-6px) translateY(-1px)' }
        },
        'walk-3': {
          '0%, 100%': { transform: 'translateX(0) translateY(0)' },
          '50%': { transform: 'translateX(4px) translateY(-3px)' }
        },
        'confetti': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-100px) rotate(720deg)', opacity: '0' }
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 20px hsl(var(--primary) / 0.3)' },
          '50%': { boxShadow: '0 0 40px hsl(var(--primary) / 0.5)' }
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-out': 'fade-out 0.3s ease-out',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'scale-out': 'scale-out 0.2s ease-out',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-down': 'slide-down 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float-slow 4s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'celebrate': 'celebrate 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shimmer': 'shimmer 2s linear infinite',
        'walk-1': 'walk-1 3s ease-in-out infinite',
        'walk-2': 'walk-2 4s ease-in-out infinite',
        'walk-3': 'walk-3 2s ease-in-out infinite',
        'confetti': 'confetti 1s ease-out forwards',
        'glow': 'glow 2s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite'
      },
      fontFamily: {
        sans: [
          'SF Pro Display',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'sans-serif'
        ]
      },
      boxShadow: {
        'glass': 'var(--shadow-glass)',
        'glass-hover': 'var(--shadow-glass-hover)',
        'glow': 'var(--shadow-glow)',
        'premium': 'var(--shadow-premium)',
        'button': '0 4px 14px -3px hsl(var(--primary) / 0.4)'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
