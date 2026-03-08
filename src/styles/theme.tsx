import { MantineThemeOverride, createTheme } from "@mantine/core";
import globalTheme from "./globalTheme";
import ButtonThemeExtension from "./components/ButtonThemeExtension";
import TitleThemeExtension from "./components/TitleThemeExtension";
import TextThemeExtension from "./components/TextThemeExtension";
import NotificationThemeExtension from "./components/NotificationThemeExtension";
import TextInputThemeExtension from "./components/TextInputThemeExtension";
import DatePickerThemeExtension from "./components/DatePickerThemeExtension";
import DatePickerInputThemeExtension from "./components/DatePickerInput";

const theme: MantineThemeOverride = {
  ...globalTheme,
  components: {
    DatePicker: DatePickerThemeExtension,
    Notification: NotificationThemeExtension,
    TextInput: TextInputThemeExtension,
    DatePickerInput: DatePickerInputThemeExtension,
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