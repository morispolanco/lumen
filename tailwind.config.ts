import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: "#FAF8F5",
          100: "#F4EFE6",
          200: "#E8E0D1",
          300: "#D8CCB8",
        },
        ink: {
          900: "#1E1B18",
          700: "#3D3730",
          500: "#635A4F",
          400: "#857A6C",
        },
        crimson: {
          700: "#7C2D12",
          800: "#63220D",
          50: "#FDF4F0",
        },
        ochre: {
          600: "#B45309",
          100: "#FEF3C7",
          50: "#FFFBEB",
        },
      },
      fontFamily: {
        serif: ["var(--font-eb-garamond)", "Georgia", "Cambria", "serif"],
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        editorial: "0 1px 3px rgba(30, 27, 24, 0.05), 0 8px 24px rgba(30, 27, 24, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
