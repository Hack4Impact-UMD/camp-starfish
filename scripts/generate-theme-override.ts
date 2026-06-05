import { campStarfishFonts } from "@/styles/fonts";
import globalTheme from "../src/styles/globalTheme";
import { DEFAULT_THEME, mergeThemeOverrides } from "@mantine/core";
import { appendFileSync } from "fs";

const mergedTheme = mergeThemeOverrides(DEFAULT_THEME, globalTheme);
const colors = mergedTheme.colors || {};
const primaryShade = typeof mergedTheme.primaryShade === 'number' ? mergedTheme.primaryShade : mergedTheme.primaryShade?.light ?? 5;
let css = "@theme {\n";
for (const [color, shades] of Object.entries(colors)) {
  if (!shades) continue;
  for (let i = 0; i < shades.length; i++) {
    css += `\t--color-${color}-${i}: ${shades[i]};\n`
  }
  css += `\t--color-${color}: ${shades[primaryShade]};\n`
}
for (const font of campStarfishFonts) {
  css += `\t--font-${font}: ${font};\n`
}
css += "}\n";
appendFileSync("./src/styles/theme.css", css);