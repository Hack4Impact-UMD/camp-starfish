import { MantineColorsTuple, MantineThemeOverride, MantineTheme } from "@mantine/core";
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
    "light-grey": [] as unknown as MantineColorsTuple,
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
      classNames: {
        input: "bg-primary-0 rounded-md border-none px-3 py-2 text-sm text-red-500 placeholder:text-neutral-5 focus:outline-none"
      },
    },

    DatePicker: {
      classNames: {
        calendarHeader: "mb-3",
        calendarHeaderLevel: "text-[15px] font-bold text-primary-5",
        weekday: "text-neutral-5 font-medium text-[13px]",
        day: `
          text-[14px] h-[38px] rounded-sm text-neutral-7
          hover:bg-primary-0
          data-[selected]:bg-link-0 data-[selected]:text-white
          data-[selected]:hover:bg-primary-6
          data-[in-range]:bg-link-1
          data-[first-in-range]:bg-link-5 data-[first-in-range]:text-white data-[first-in-range]:rounded-l-sm
          data-[last-in-range]:bg-primary-5 data-[last-in-range]:text-white data-[last-in-range]:rounded-r-sm
        `
      }
    }
  }

};