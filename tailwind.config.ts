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
          bg:      "#0B0B0C",
          card:    "#111113",
          red:     "#FF3B30",
          accent:  "#C8F542",
          dirty:   "#E8E4DC",
          /* legacy */
          black:    "#080808",
          "red-dk": "#AA0000",
        },
      },
      fontFamily: {
        bebas:   ["var(--font-bebas)", "Bebas Neue", "cursive"],
        archivo: ["var(--font-archivo)", "Archivo", "sans-serif"],
        mono:    ["var(--font-space-mono)", "Space Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
