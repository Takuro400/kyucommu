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
      },
    },
  },
  plugins: [],
};
export default config;
