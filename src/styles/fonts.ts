export const campStarfishFonts = ['Lato', 'NewSpirit', 'Besteam'] as const;
export type CampStarfishFont = typeof campStarfishFonts[number];
export const fontVars: Record<CampStarfishFont, `--${string}`> = {
  Lato: '--font-lato',
  NewSpirit: '--font-newSpirit',
  Besteam: '--font-besteam',
}