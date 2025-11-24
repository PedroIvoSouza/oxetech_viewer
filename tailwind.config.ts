import type { Config } from "tailwindcss"

const config = {
  darkMode: "class",
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "24px", // Bento Grid padding
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "off-white": "#F9F7F2", // Papel de alta qualidade - Reports
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          vivid: "hsl(var(--primary-vivid))",
          base: "hsl(var(--primary))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          cool: "hsl(var(--accent-cool))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--foreground))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--foreground))",
        },
        // Paletas por módulo (USAspending.gov Blue System)
        work: {
          primary: "#005ea2", // USWDS Primary
          secondary: "#1a4480", // USWDS Primary Base
          light: "#3B82F6",
          dark: "#1E40AF",
        },
        edu: {
          primary: "#005ea2", // USWDS Primary (azul institucional)
          secondary: "#1a4480", // USWDS Primary Base
          light: "#28a0cb", // Accent Cool
          dark: "#1E40AF",
        },
        lab: {
          primary: "#005ea2", // USWDS Primary (azul institucional)
          secondary: "#1a4480", // USWDS Primary Base
          light: "#28a0cb", // Accent Cool
          dark: "#1E40AF",
        },
        trilhas: {
          primary: "#005ea2", // USWDS Primary (azul institucional)
          secondary: "#1a4480", // USWDS Primary Base
          light: "#28a0cb", // Accent Cool
          dark: "#1E40AF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "8px", // USAspending.gov standard
        "2xl": "12px",
      },
      fontFamily: {
        sans: ['Inter', 'Public Sans', 'system-ui', 'sans-serif'],
        heading: ['Source Sans Pro', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'JetBrains Mono', 'monospace'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "skeleton": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.4s ease-out",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "skeleton": "skeleton 2s ease-in-out infinite",
      },
      boxShadow: {
        "soft": "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
        "medium": "0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.2)",
        "large": "0 8px 32px rgba(0, 0, 0, 0.12)",
        "bento": "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
      },
      spacing: {
        'bento-gap': '20px',
        'bento-padding': '24px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
