import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
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
        primary: {
          DEFAULT: "#f47c6c", // Coral
          foreground: "#FFFFFF",
          50: "#fde8e5",
          100: "#fbd0cb",
          200: "#f9b8b0",
          300: "#f79f95",
          400: "#f58d80",
          500: "#f47c6c", // Base
          600: "#f26957",
          700: "#f05742",
          800: "#ee452d",
          900: "#e43319",
        },
        secondary: {
          DEFAULT: "#a3d7e0", // Turquesa
          foreground: "#111111",
          50: "#f0f9fa",
          100: "#e0f2f6",
          200: "#d1ecf1",
          300: "#c1e5ec",
          400: "#b2dfe7",
          500: "#a3d7e0", // Base
          600: "#93d1db",
          700: "#84cbd6",
          800: "#74c4d1",
          900: "#65becc",
        },
        accent: {
          DEFAULT: "#f9a05d", // Naranja
          foreground: "#FFFFFF",
          50: "#fef2e8",
          100: "#fde5d0",
          200: "#fcd8b9",
          300: "#fbcba1",
          400: "#fabf8a",
          500: "#f9a05d", // Base
          600: "#f8934b",
          700: "#f78639",
          800: "#f67927",
          900: "#f56c15",
        },
        highlight: {
          DEFAULT: "#f1c84b", // Amarillo
          foreground: "#111111",
          50: "#fdf8e6",
          100: "#fbf1cd",
          200: "#f9eab4",
          300: "#f7e39b",
          400: "#f5dc82",
          500: "#f1c84b", // Base
          600: "#efc132",
          700: "#edba19",
          800: "#d6a611",
          900: "#bd920f",
        },
        destructive: {
          DEFAULT: "#FF5A5A",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#f8e9dc", // Versión más clara de #fdf1e8
          foreground: "#64748B",
        },
        popover: {
          DEFAULT: "#fdf1e8", // Crema
          foreground: "#111111",
        },
        card: {
          DEFAULT: "#fdf1e8", // Crema
          foreground: "#111111",
        },
        // Category colors
        music: "#f47c6c", // Coral para música
        sports: "#a3d7e0", // Turquesa para deportes
        food: "#f9a05d", // Naranja para gastronomía
        art: "#f1c84b", // Amarillo para arte
        tech: "#f47c6c", // Coral para tecnología
        outdoor: "#a3d7e0", // Turquesa para aire libre
        // Stats card colors
        stats: {
          blue: {
            bg: "#e0f2f6",
            text: "#a3d7e0",
          },
          coral: {
            bg: "#fde8e5",
            text: "#f47c6c",
          },
          orange: {
            bg: "#fef2e8",
            text: "#f9a05d",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 15px 0 rgba(212, 175, 55, 0.3)" },
          "50%": { boxShadow: "0 0 25px 0 rgba(212, 175, 55, 0.6)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "scale-up": {
          "0%": { transform: "scale(0.95)", opacity: "0.5" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-left": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-right": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-slow": "pulse-slow 3s infinite ease-in-out",
        float: "float 6s infinite ease-in-out",
        "slide-up": "slide-up 0.5s ease-out",
        glow: "glow 2s infinite ease-in-out",
        "spin-slow": "spin-slow 8s linear infinite",
        "bounce-subtle": "bounce-subtle 2s infinite ease-in-out",
        "scale-up": "scale-up 0.3s ease-out",
        "slide-left": "slide-left 0.5s ease-out",
        "slide-right": "slide-right 0.5s ease-out",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "dots-pattern": "radial-gradient(circle, rgba(212, 175, 55, 0.1) 1px, transparent 1px)",
        "hero-pattern": 'url("/placeholder.svg?height=600&width=1920")',
        "gradient-spotlight": "radial-gradient(circle at center, var(--tw-gradient-stops))",
        "gradient-diagonal": "linear-gradient(45deg, var(--tw-gradient-stops))",
      },
      boxShadow: {
        neon: '0 0 5px theme("colors.primary.200"), 0 0 20px theme("colors.primary.500")',
        "neon-secondary": '0 0 5px theme("colors.secondary.200"), 0 0 20px theme("colors.secondary.500")',
        "neon-accent": '0 0 5px theme("colors.accent.200"), 0 0 20px theme("colors.accent.500")',
        "card-hover": "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
        "shadow-subtle": "0 0 0 1px rgba(0, 0, 0, 0.05)",
      },
      transitionProperty: {
        height: "height",
      },
      transitionDuration: {
        "0": "0ms",
        "2000": "2000ms",
      },
      zIndex: {
        "100": "100",
      },
      extend: {
        keyframes: {
          marquee: {
            "0%": { transform: "translateX(0%)" },
            "100%": { transform: "translateX(-100%)" },
          },
          marquee2: {
            "0%": { transform: "translateX(100%)" },
            "100%": { transform: "translateX(0%)" },
          },
        },
        animation: {
          marquee: "marquee var(--marquee-duration) linear infinite",
          marquee2: "marquee2 var(--marquee-duration) linear infinite",
        },
      },
      variants: {
        extend: {
          display: ["group-hover"],
        },
      },
      screens: {
        fold: "320px",
        // => @media (min-width: 320px) { ... }

        phone: "640px",
        // => @media (min-width: 640px) { ... }

        tablet: "768px",
        // => @media (min-width: 768px) { ... }

        laptop: "1024px",
        // => @media (min-width: 1024px) { ... }

        desktop: "1280px",
        // => @media (min-width: 1280px) { ... }

        tv: "1536px",
        // => @media (min-width: 1536px) { ... }
      },
      spacing: {
        "128": "32rem",
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            color: theme("colors.gray.700"),
            h2: {
              fontWeight: "700",
              letterSpacing: theme("letterSpacing.tight"),
              color: theme("colors.gray.900"),
            },
            h3: {
              fontWeight: "600",
              color: theme("colors.gray.900"),
            },
            strong: {
              color: theme("colors.gray.900"),
            },
            a: {
              color: theme("colors.gray.900"),
            },
          },
        },
      }),
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
