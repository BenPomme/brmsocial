import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f3eee4",
        ink: "#1b1712",
        muted: "#6b6258",
        line: "#d9d0c3",
        accent: "#b5442a",
        "accent-dark": "#8e301c",
        moss: "#3d5a45",
        sand: "#e7dfd2",
        ok: "#2f6b4f",
        warn: "#9a6b12",
        wa: "#075e54",
        "wa-header": "#128c7e",
        "wa-chat": "#ece5dd",
        "wa-out": "#dcf8c6",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(27,23,18,0.06), 0 12px 32px rgba(27,23,18,0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
