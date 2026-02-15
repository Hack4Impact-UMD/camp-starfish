import { MantineThemeOverride } from "@mantine/core";
import globalTheme from "./globalTheme";
import ButtonThemeExtension from "./components/ButtonThemeExtension";
import TitleThemeExtension from "./components/TitleThemeExtension";
import TextThemeExtension from "./components/TextThemeExtension";
import NotificationThemeExtension from "./components/NotificationThemeExtension";

const theme: MantineThemeOverride = {
  ...globalTheme,
  components: {
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
    },
    Notification: NotificationThemeExtension,
    TextInput: {
      classNames: {
        input: "bg-primary-0 rounded-md border-none px-3 py-2 text-sm text-neutral-5 placeholder:text-neutral-5 "
      },
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
    Button: ButtonThemeExtension,
    Title: TitleThemeExtension,
    Text: TextThemeExtension,
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

export default theme;