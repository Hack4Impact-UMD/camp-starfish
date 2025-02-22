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
            orange: "F4831F"
          }
        },
        pattern: {
          primary_bg: 'rgba(255, 255, 255, 0.07)',
          secondary_bg: 'rgba(255, 255, 255, 0.40)',
          white_bg: 'rgba(96, 96, 96, 0.07)'
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
