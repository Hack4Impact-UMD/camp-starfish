import type { Config } from "tailwindcss";
import { theme } from "./src/styles/theme";
import { campStarfishFonts } from "./src/styles/fonts";
import { MantineColorsTuple } from "@mantine/core";

function mantineToTailwindColors(colors: Record<string, MantineColorsTuple | undefined>) {
  const result: Record<string, Record<number, string>> = {};

  for (const [name, arr] of Object.entries(colors)) {
    if (!arr) continue;

    result[name] = {
      0: arr[0],
      1: arr[1],
      2: arr[2],
      3: arr[3],
      4: arr[4],
      5: arr[5],
      6: arr[6],
      7: arr[7],
      8: arr[8],
      9: arr[9],
    };
  }

  return result;
}


export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/styles/**/*.{ts,tsx}", // include theme files for Tailwind JIT
  ],
  theme: {
    extend: {
      colors: theme.colors ? mantineToTailwindColors(theme.colors) : {},
      fontFamily: campStarfishFonts.reduce(
        (prev, font) => ({ ...prev, [font]: `var(--font-${font})` }),
        {}
      ),
    },
  },
  plugins: [],
} satisfies Config;
