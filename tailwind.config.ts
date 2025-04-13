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
            blue: "#00B6CE",
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
            body: "#001B2A",
            subheadings: "#3B4E57",
            darkerButtons: "#FFFFFF",
            lighterButtons: "#2F424C",
          },
          buttons: {
            buttonTextDark: "#FFFFFF",
            buttonTextLight: "#333333",
            neutral: "#C0C6C9",
            success: "#1E8E3E",
            warning: "#EFAF00",
          },
          background: {
            default: "#F8FAFC",
            modal: "#FFFFFF",
            standardComponent: "#F7F7F7",
            main: "#FAFAFB",
          },
          icons: {
            primary: "#002D45",
            lessProminent: "#C0C6C9",
          },
          cta: {
            primary: "#07B862",
            secondary: "#F4831F",
          },
          neutral: {
            n0: "#FFFFFF",
            n10: "#FAFAFB",
            n40: "#EBEBEC",
            n50: "#C0C6C9",
            n500: "#3B4E57",
            n600: "#2F424C",
            n700: "#1D323E",
          },
          primaryScale: {
            p50: "#EAECEF",
            p200: "#A9B3BC",
            p300: "#002D45",
            p500: "#0D1624",
          },
          secondaryScale: {
            orangeS75: "#FCEED3",
            orangeS300: "#F4B84F",
            orangeS400: "#E85C15",
            orangeS500: "#954013",
            greenS75: "#E2F6ED",
            greenS300: "#7BE4AA",
            greenS400: "#45BE85",
            greenS500: "#0A715C",
          },
          accentScale: {
            yellowA100: "#FEF5CF",
            yellowA200: "#FBE78C",
            yellowA300: "#F9D65D",
            yellowA400: "#F7C01F",
            yellowA500: "#F5C87D6",
            blueA100: "#E2F5F8",
            blueA200: "#A7D4E3",
            blueA300: "#80B6CD",
            blueA400: "#4D91B0",
            blueA500: "#00677C",
          },
          errorScale: {
            w300: "#E12F2F",
            w400: "#C42121",
            w500: "#A11A1A",
          },
          successScale: {
            s300: "#1DB53E",
            s400: "#15832B",
            s500: "#0E672E",
          },
          warningScale: {
            y300: "#FFC600",
            y400: "#D7C600",
            y500: "#B3A500",
          },
          linksScale: {
            b300: "#1A80D8",
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