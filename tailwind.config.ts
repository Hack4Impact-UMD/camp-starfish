import type { Config } from "tailwindcss";
import { theme } from "./src/styles/theme";
import { campStarfishFonts } from "./src/styles/fonts";
import { DEFAULT_THEME } from "@mantine/core";
import { CustomThemeConfig } from "tailwindcss/types/config";

type TailwindThemeConverters = {
  [key in keyof CustomThemeConfig]: () => CustomThemeConfig[key];
}

const tailwindThemeConverters: Partial<TailwindThemeConverters> = {
  colors: () => {
    const mantineColors = theme.colors ?? DEFAULT_THEME.colors;
    const primaryShade = (typeof theme.primaryShade === "number" ? theme.primaryShade : theme.primaryShade?.light) ?? (typeof DEFAULT_THEME.primaryShade === "number" ? DEFAULT_THEME.primaryShade : DEFAULT_THEME.primaryShade.light);
    const tailwindColors: CustomThemeConfig["colors"] = {};
    for (const color in mantineColors) {
      if (!mantineColors[color]) continue;
      tailwindColors[color] = { DEFAULT: mantineColors[color][primaryShade] };
      for (let i = 0; i < mantineColors[color].length; i++) {
        tailwindColors[color][i] = mantineColors[color][i];
      }
    }
    return tailwindColors;
  },
  fontFamily: () => {
    const fontFamily: CustomThemeConfig["fontFamily"] = {};
    campStarfishFonts.forEach((font) => fontFamily[font] = `var(--font-${font})`);
    return fontFamily;
  },
  fontSize: () => {
    return (theme.fontSizes ?? DEFAULT_THEME.fontSizes) as CustomThemeConfig['fontSize'];
  },
  lineHeight: () => {
    return (theme.lineHeights ?? DEFAULT_THEME.lineHeights) as CustomThemeConfig['lineHeight'];
  },
  spacing: () => {
    return (theme.spacing ?? DEFAULT_THEME.spacing) as CustomThemeConfig['spacing'];
  },
  borderRadius: () => {
    return (theme.radius ?? DEFAULT_THEME.radius) as CustomThemeConfig['borderRadius'];
  },
  boxShadow: () => {
    return (theme.shadows ?? DEFAULT_THEME.shadows) as CustomThemeConfig['boxShadow'];
  },
  screens: () => {
    return (theme.breakpoints ?? DEFAULT_THEME.breakpoints) as CustomThemeConfig['screens'];
  },
  blur: () => {
    return (theme.radius ?? DEFAULT_THEME.radius) as CustomThemeConfig['blur'];
  },
}

const tailwindConfigExtension: Partial<CustomThemeConfig> = {};
Object.keys(tailwindThemeConverters).forEach((key) => {
  tailwindConfigExtension[key] = tailwindThemeConverters[key] && tailwindThemeConverters[key]();
})

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: tailwindConfigExtension },
  plugins: [],
} satisfies Config;
