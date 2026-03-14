import { MantineThemeOverride, Title, createTheme } from "@mantine/core";
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
    Button: ButtonThemeExtension,
    DatePickerInput: DatePickerInputThemeExtension,
    DatePicker: DatePickerThemeExtension,
    Menu: MenuThemeExtension,
    Notification: NotificationThemeExtension,
    Radio: RadioThemeExtension,
    TextInput: TextInputThemeExtension,
    Text: TextThemeExtension,
    Title: TitleThemeExtension,
  }
};

export default theme;