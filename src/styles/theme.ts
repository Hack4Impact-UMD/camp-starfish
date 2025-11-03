import { MantineColorsTuple, MantineThemeOverride } from "@mantine/core";
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
    TextInput: {
      defaultProps: {
        radius: "md",
        size: "sm",
        styles: {
          input: {
            backgroundColor: "#C0C6C9", // neutral.4
            border: 'none', // Remove borders for all text inputs
          },
        },
      },
    },
    DatePickerInput: {
      defaultProps: {
        styles: {
          input: {
            backgroundColor: "#C0C6C9", // neutral.4 (matching TextInput)
            border: 'none', // Remove borders for all date inputs
          },
          // Calendar dropdown styling
          calendarHeaderControl: {
            width: 28,
            height: 28,
            fontSize: 14,
          },
          calendarHeader: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: 8,
          },
          calendarHeaderLevel: {
            fontWeight: 600,
            fontSize: "15px",
            textAlign: "center" as const,
            flex: 1,
          },
          day: {
            fontVariantNumeric: "tabular-nums",
            fontFeatureSettings: "'tnum' 1",
            fontFamily: "Inter, sans-serif",
            width: 32,
            height: 32,
            lineHeight: "32px",
            textAlign: "center" as const,
          },
        },
      },
    },
    Button: {
      defaultProps: {
        radius: "xl",
        size: "sm",
        styles: {
          root: {
            textTransform: "uppercase" as const,
            fontWeight: 600,
          },
        },
      },
    },
    Title: {
      defaultProps: {
        fw: 700,
      },
    },
    Radio: {
      defaultProps: {
        styles: {
          radio: {
            width: 16,
            height: 16,
            marginTop: 2,
            '&:checked': {
              backgroundColor: 'var(--mantine-color-blue-filled)',
              borderColor: 'var(--mantine-color-blue-filled)',
            }
          },
          icon: { 
            display: 'none' // Hide default white dot for solid bullets
          }
        },
      },
    },
  },
};
