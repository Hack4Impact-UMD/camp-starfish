import type { Config } from "tailwindcss";
import { theme } from "./src/styles/theme";
import { campStarfishFonts } from "./src/styles/fonts";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: theme.colors ? Object.keys(theme.colors).reduce((prev, color) => ({ ...prev, [color]: Object.assign({}, theme.colors![color])}), {}) : undefined,
      fontFamily: campStarfishFonts.reduce((prev, font) => ({ ...prev, [font]: `var(--font-${font})`}), {}),
    },
  },
  plugins: [],
} satisfies Config;