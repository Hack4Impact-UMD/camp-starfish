import { MantineThemeOverride, createTheme } from "@mantine/core";
import globalTheme from "./globalTheme";
import ButtonThemeExtension from "./components/ButtonThemeExtension";
import TitleThemeExtension from "./components/TitleThemeExtension";
import TextThemeExtension from "./components/TextThemeExtension";
import NotificationThemeExtension from "./components/NotificationThemeExtension";
import TextInputThemeExtension from "./components/TextInputThemeExtension";
import DatePickerThemeExtension from "./components/DatePickerThemeExtension";
import DatePickerInputThemeExtension from "./components/DatePickerInputThemeExtension";
import RadioThemeExtension from "./components/RadioThemeExtension";
import MenuThemeExtension from "./components/MenuThemeExtension";

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
    Radio: RadioThemeExtension,
    Menu: MenuThemeExtension
  }
};

export default theme;