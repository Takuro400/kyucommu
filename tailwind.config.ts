import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#E6F1FB",
          100: "#B5D4F4",
          500: "#185FA5",
          600: "#0C447C",
          700: "#042C53",
        },
        kpink:   { DEFAULT: "#F2A7BB", light: "#FDE8EF", dark: "#E08AA0" },
        terra:   { DEFAULT: "#E8846A", light: "#FBEDE9" },
        lav:     { DEFAULT: "#C9B8E8", light: "#F0EBF9" },
        cream:   "#FDF6F0",
        charcoal: "#2D2D2D",
        muted:   "#8A8A8A",
      },
      fontFamily: {
        sans:    ["var(--font-noto)", "var(--font-dm)", "sans-serif"],
        display: ["var(--font-dm)", "sans-serif"],
      },
      boxShadow: {
        soft:    "0 4px 20px rgba(0,0,0,0.06)",
        "soft-lg": "0 8px 32px rgba(0,0,0,0.08)",
        pink:    "0 4px 20px rgba(242,167,187,0.25)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
    },
  },
  plugins: [],
};
export default config;
