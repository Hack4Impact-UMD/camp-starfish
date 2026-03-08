import { MantineThemeOverride, createTheme } from "@mantine/core";
import globalTheme from "./globalTheme";
import ButtonThemeExtension from "./components/ButtonThemeExtension";
import TitleThemeExtension from "./components/TitleThemeExtension";
import TextThemeExtension from "./components/TextThemeExtension";
import NotificationThemeExtension from "./components/NotificationThemeExtension";
import TextInputThemeExtension from "./components/TextInputThemeExtension";
import DatePickerThemeExtension from "./components/DatePickerThemeExtension";

const theme: MantineThemeOverride = {
  ...globalTheme,
  components: {
    DatePicker: DatePickerThemeExtension,
    Notification: NotificationThemeExtension,
    TextInput: TextInputThemeExtension,
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