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
            orange: "#F4831F",
          },
          white: "#FFFFFF",

          text: {
            modalTitle: "#333333",
            modalSecondaryTitle: "#4A4A4A",
            headingBody: "#002D45",
            subheading: "#324D5B",
            toolButtons: "#324D5B",
            error: "#D32F2F",
            link: "#1D70B8",
          },
          buttons: {
            buttonTextDark: "#FFFFFF",
            buttonTextLight: "#333333",
            neutral: "#BDC3C7",
          },
          background: {
            default: "#F8FAFC",
            modal: "#F1F1F1",
            standardComponent: "#F7F7F7",
            formField: "#E6EAEC",
          },
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