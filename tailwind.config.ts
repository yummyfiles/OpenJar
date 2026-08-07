import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        brand: ["var(--font-mono)", "ui-monospace", "monospace"]
      },
      colors: {
        // grayscale-only design system
        ink: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a"
        }
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        card: "0 0 0 1px rgb(255 255 255 / 0.06), 0 2px 12px -4px rgb(0 0 0 / 0.4)",
        "card-hover": "0 0 0 1px rgb(255 255 255 / 0.1), 0 8px 32px -8px rgb(0 0 0 / 0.6)",
        glow: "0 0 24px -6px rgb(255 255 255 / 0.25)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.4s ease both",
        shimmer: "shimmer 1.5s infinite linear"
      }
    }
  },
  plugins: []
};

export default config;
