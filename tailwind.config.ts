import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.25rem", screens: { "2xl": "1360px" } },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: { DEFAULT: "hsl(var(--surface))", raised: "hsl(var(--surface-raised))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        phase: { before: "#D9A441", during: "#5DB7DE", after: "#22C55E" },
      },
      fontFamily: {
        sans: ['"DM Sans Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"DM Serif Display"', "ui-serif", "Georgia", "serif"],
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 4px)", sm: "calc(var(--radius) - 6px)" },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
        scan: { "0%": { top: "0%" }, "100%": { top: "100%" } },
      },
      animation: { shimmer: "shimmer 1.6s infinite", scan: "scan 1.8s ease-in-out infinite alternate" },
    },
  },
  plugins: [animate],
};

export default config;
