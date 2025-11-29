import type { Config } from "tailwindcss";
import { theme } from "./src/styles/theme";
import { campStarfishFonts } from "./src/styles/fonts";
import { MantineColorsTuple } from "@mantine/core";

function mantineToTailwindColors(colors: Record<string, MantineColorsTuple | undefined>) {
  const result: Record<string, Record<number, string>> = {};

  for (const [name, arr] of Object.entries(colors)) {
    if (!arr || arr.length === 0) continue;

    result[name] = {}

    for (let i = 0; i < arr.length; i++) {
      result[name][i] = arr[i] ?? "#ffffff";
    }
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
