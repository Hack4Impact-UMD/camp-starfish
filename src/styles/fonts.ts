export const campStarfishFonts = ['Lato', 'New Spirit', 'Besteam'] as const;
export type CampStarfishFont = typeof campStarfishFonts[number];
export const fontVars: Record<CampStarfishFont, `--${string}`> = {
  Lato: '--font-lato',
  'New Spirit': '--font-newSpirit',
  Besteam: '--font-besteam',
}