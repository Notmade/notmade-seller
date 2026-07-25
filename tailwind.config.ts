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
          black: "#080808",
          red: "#CC0000",
          "red-dark": "#A00000",
          "red-light": "#FF1A1A",
        },
      },
      fontFamily: {
        bebas: ["var(--font-bebas)", "Bebas Neue", "cursive"],
        inter: ["var(--font-inter)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
