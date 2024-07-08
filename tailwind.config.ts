import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        PlayfairDisplay: ["Playfair Display", "serif"],
      },
      animation: {
        "fade-in-rotate": "fade-in-rotate 0.5s ease-in-out forwards",
        "fade-out-rotate": "fade-out-rotate 0.5s ease-in-out forwards",
      },
      keyframes: {
        "fade-in-rotate": {
          "0%": { opacity: "0", transform: "rotate(-90deg)" },
          "100%": { opacity: "1", transform: "rotate(0deg)" },
        },
        "fade-out-rotate": {
          "0%": { opacity: "1", transform: "rotate(0deg)" },
          "100%": { opacity: "0", transform: "rotate(90deg)" },
        },
      },
    },
  },
  plugins: [],
  darkMode: "class",
};

export default config;
