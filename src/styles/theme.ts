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
        input: "bg-primary-0 rounded-md border-none px-3 py-2 text-sm text-neutral-5 placeholder:text-neutral-5 "
      },
    },

    DatePicker: {
      defaultProps: {
        firstDayOfWeek: 0, 

      },
      classNames: {
        calendarHeader: "mb-[20px]",
        calendarHeaderLevel: "!text-[14px] !font-bold text-primary-5",
        weekday: "!text-neutral-5 !font-[600] !text-[14px]  border-none",
        
        day: `
          !text-[14px] h-[38px] !text-primary-6 !p-[1px]
          hover:bg-primary-0
          data-[selected]:bg-link-0 data-[selected]:text-white
          data-[selected]:hover:bg-primary-6
          data-[in-range]:bg-[rgba(34,139,230,0.2)]
          data-[first-in-range]:!bg-link-0 data-[first-in-range]:!text-white data-[first-in-range]:!rounded-sm 
          data-[last-in-range]:!bg-link-0 data-[last-in-range]:!text-white data-[last-in-range]:!rounded-sm
        `,
        root: "!border !border-primary-5 !rounded-lg !p-2",

      }
    }
  }

};