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
        camp: {
          primary: "#002D45",
          secondary: "#FFDE59",
          tert: {
            green: "#07B862",
            blue: "#00BDCE",
            orange: "F4831F",
            dark_grey: "#333333"
          },
          white: "#FFFFFF"
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
      fontFamily: {
        lato: "var(--font-lato)",
        newSpirit: "var(--font-new-spirit)",
        besteam: "var(--font-besteam)",
      },
    },
  },
  plugins: [],
} satisfies Config;
