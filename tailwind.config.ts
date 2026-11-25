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
          50: "#FAF7F0",
          100: "#F4EFE4",
          200: "#E8E0D0",
          300: "#D8CEBA",
        },
        ivory: "#FCFBF7",
        ink: {
          900: "#17191C",
          700: "#373B42",
          500: "#5E626A",
          400: "#858077",
        },
        navy: {
          700: "#253F73",
          800: "#1C315A",
          900: "#152546",
          50: "#EEF2F9",
        },
        gold: {
          700: "#7F5F26",
          600: "#947132",
          100: "#F7EEDB",
          50: "#FBF7EC",
        },
      },
      fontFamily: {
        serif: ["var(--font-eb-garamond)", "Georgia", "Cambria", "serif"],
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        editorial:
          "0 1px 2px rgba(23, 25, 28, 0.04), 0 10px 28px rgba(37, 63, 115, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
