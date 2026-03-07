import theme from "../src/styles/theme";
import { DEFAULT_THEME, mergeThemeOverrides } from "@mantine/core";
import { appendFileSync } from "fs";

const mergedTheme = mergeThemeOverrides(DEFAULT_THEME, theme);
const colors = mergedTheme.colors || {};
let css = "@theme {\n";
for (const [color, shades] of Object.entries(colors)) {
  if (!shades) continue;
  for (let i = 0; i < shades.length; i++) {
    css += `--color-${color}-${i}: ${shades[i]};\n`
  }
}
css += "}\n";
appendFileSync("./src/styles/theme.css", css);