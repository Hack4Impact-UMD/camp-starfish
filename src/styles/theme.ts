import { MantineColorsTuple, MantineTheme, MantineThemeOverride, NotificationProps } from "@mantine/core";
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
    "light-grey": [

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
        styles: {
          input: {
            backgroundColor: 'var(--mantine-color-neutral-2)',
            borderRadius: 'var(--mantine-radius-md)',
            border: 'none',
            padding: '12px 16px',
            fontSize: '14px',
            color: 'var(--mantine-color-neutral-4)',
          },
        },
      },
    },
    DatePicker: {
      defaultProps: {
        styles: {
          calendarHeader: {
            maxWidth: 'none',
          },
          calendarHeaderControl: {
            color: 'var(--mantine-color-neutral-9)',
          },
          monthCell: {
            color: 'var(--mantine-color-neutral-9)',
          },
          day: {
            color: 'var(--mantine-color-neutral-9)',
            fontSize: '16px',
            height: '40px',
          },
          month: {
            width: '100%',
          },
        },
      },
    },
  },
};

// Global styles for DatePicker data attributes (must be in CSS, not inline styles)
export const datePickerGlobalStyles = `
  .mantine-DatePicker-day[data-selected] {
    background-color: var(--mantine-color-primary-5) !important;
    color: white !important;
  }
  .mantine-DatePicker-day[data-in-range] {
    background-color: var(--mantine-color-accent-blue-0) !important;
    color: var(--mantine-color-neutral-9) !important;
  }
`;