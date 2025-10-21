import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        
        neutral: {
          0: "#FFFFFF",
          10: "#FAFAFB",
          40: "#EBEBEC",
          50: "#C0C6C9",
          500: "#3B4E57",
          600: "#2F424C",
          700: "#1D323E",
        },
        primary: {
          50: "#EAECEF",
          200: "#A9B3BC",
          300: "#002D45",
          500: "#0D1624",
        },
        secondary: {
          orange: {
            75: "#FCEED3",
            300: "#F4B84F",
            400: "#E85C15",
            500: "#954013",
          },
          green: {
            75: "#E2F6ED",
            300: "#7BE4AA",
            400: "#45BE85",
            500: "#0A715C",
          }
        },
        accent: {
          yellow: {
            100: "#FEF5CF",
            200: "#FBE78C",
            300: "#F9D65D",
            400: "#F7C01F",
            500: "#F5C87D",
          },
          blue: {
            100: "#E2F5F8",
            200: "#A7D4E3",
            300: "#80B6CD",
            400: "#4D91B0",
            500: "#00677C",
          }
        },
        error: {
          300: "#E12F2F",
          400: "#C42121",
          500: "#A11A1A",

        },
        success: {
          300: "#4CDA64",
          400: "#38C24E",
          500: "#1DB53E",
        },
        warning: {
          300: "#FFC600",
          400: "#D7C600",
          500: "#B3A500"
        },
        link: {
          DEFAULT: "#1A80D8",
        },
        pattern: {
          primary_bg: "rgba(255, 255, 255, 0.07)",
          secondary_bg: "rgba(255, 255, 255, 0.40)",
          white_bg: "rgba(96, 96, 96, 0.07)",
        },
      },
      fontFamily: {
        lato: ["var(--font-lato)"],
        newSpirit: ["var(--font-newSpirit)"],
        besteam: ["var(--font-besteam)"],
      },
    },
  },
  plugins: [],
} satisfies Config;