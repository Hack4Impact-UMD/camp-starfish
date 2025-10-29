import { MantineColorsTuple, MantineTheme, MantineThemeOverride } from "@mantine/core";  
import { campStarfishFonts } from "./fonts";

export const theme: MantineThemeOverride = {
  colors: {
    neutral: [
      ...Array<string>(2).fill("#FFFFFF"),
      "#FAFAFB",
      "#DEE1E3",
      "#C0C6C9",
      "#3B4E57",
      "#2F424C",
      ...Array<string>(3).fill("#1D323D"),
    ] as unknown as MantineColorsTuple,
    primary: [
      ...Array<string>(4).fill("#E6EAEC"),
      "#2B5165",
      "#002D45",
      ...Array<string>(4).fill("#001B2A"),
    ] as unknown as MantineColorsTuple,
    "secondary-orange": [
      ...Array<string>(4).fill("#FACCA3"),
      "#F4831F",
      "#AB5C16",
      ...Array<string>(4).fill("#955013"),
    ] as unknown as MantineColorsTuple,
    "secondary-green": [
      ...Array<string>(4).fill("#99E2BF"),
      "#07B862",
      "#058145",
      ...Array<string>(4).fill("#04703C"),
    ] as unknown as MantineColorsTuple,
    "accent-yellow": [
      ...Array<string>(3).fill("#FFEC9F"),
      "#FFE475",
      "#FFDE59",
      "#B39B3E",
      ...Array<string>(4).fill("#9C8736"),
    ] as unknown as MantineColorsTuple,
    "accent-blue": [
      ...Array<string>(3).fill("#6BD5E3"),
      "#2BC2D6",
      "#00B6CE",
      "#007F90",
      ...Array<string>(4).fill("#006F7E"),
    ] as unknown as MantineColorsTuple,
    success: [
      ...Array<string>(5).fill("#1E8E3E"),
      "#15632B",
      ...Array<string>(4).fill("#125726"),
    ] as unknown as MantineColorsTuple,
    error: [
      ...Array<string>(5).fill("#D32F2F"),
      "#942121",
      ...Array<string>(4).fill("#811D1D"),
    ] as unknown as MantineColorsTuple,
    warning: [
      ...Array<string>(5).fill("#EFAF00"),
      "#A77A00",
      ...Array<string>(4).fill("#926B00"),
    ] as unknown as MantineColorsTuple,
    link: Array<string>(10).fill('#1A80D8') as unknown as MantineColorsTuple,
  },
  primaryShade: 4,
  primaryColor: "primary",
  fontFamily: `${campStarfishFonts.join(', ')}, sans-serif`,
  headings: {
    fontFamily: `Lato, sans-serif`,
    fontWeight: '500'
  },
  defaultRadius: "xl",
  cursorType: "pointer",
  components: {
    //theme for general toast component notification 
  Notification: {
    styles: (theme: MantineTheme, params: Record<string, any>) => {  

      const colorKey = params.color || 'primary';
      const accent = theme.colors[colorKey][4];
      const border = theme.colors.neutral[3];

      return {
        root: {
          backgroundColor: theme.white,
          border: `1px solid ${border}`,
          borderRadius: theme.radius.md,
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          padding: '20px 16px',
          position: 'relative',
          width: 450,
          height: 90,
        },
        body: {
          paddingLeft: 12,
        },
        icon: { 
          color: accent 
        },
        title: { 
          fontWeight: 700, color: accent,
          fontSize: 18,
        },
        description: { 
          color: theme.colors.neutral[5],
          fontWeight: 510,
          fontSize: 14,
        },
        closeButton: {
         color: theme.colors.neutral[6],
         defaultProps: { withBorder: false, closeButtonProps: { iconSize: 90 } },
        },
      };
    },
    defaultProps: { withBorder: false },
  },
},
};

//override the themes for toast notification component here
//use mantine styles API
// exit button on right
 //image on left for success (checkmark) and error (x)
