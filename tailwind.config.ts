import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pacifico: ["Pacifico", "cursive"],
        nunito: ["Nunito", "sans-serif"],
      },
      colors: {
        cream: "#FFF9E6",
        coral: "#FF6B6B",
        teal: "#4ECDC4",
        sunny: "#FFD700",
      },
    },
  },
  plugins: [],
};

export default config;
