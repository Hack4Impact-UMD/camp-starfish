import { MantineThemeOverride, Title, createTheme } from "@mantine/core";
import globalTheme from "./globalTheme";
import ActionIconThemeExtension from "./components/ActionIconThemeExtension";
import ButtonThemeExtension from "./components/ButtonThemeExtension";
import DatePickerInputThemeExtension from "./components/DatePickerInputThemeExtension";
import DatePickerThemeExtension from "./components/DatePickerThemeExtension";
import MenuThemeExtension from "./components/MenuThemeExtension";
import NotificationThemeExtension from "./components/NotificationThemeExtension";
import RadioThemeExtension from "./components/RadioThemeExtension";
import TextInputThemeExtension from "./components/TextInputThemeExtension";
import TextThemeExtension from "./components/TextThemeExtension";
import TitleThemeExtension from "./components/TitleThemeExtension";
import ModalThemeExtension from "./components/ModalThemeExtension";

const theme: MantineThemeOverride = {
  ...globalTheme,
  components: {
    ActionIcon: ActionIconThemeExtension,
    Button: ButtonThemeExtension,
    DatePickerInput: DatePickerInputThemeExtension,
    DatePicker: DatePickerThemeExtension,
    Menu: MenuThemeExtension,
    Modal: ModalThemeExtension,
    Notification: NotificationThemeExtension,
    Radio: RadioThemeExtension,
    TextInput: TextInputThemeExtension,
    Text: TextThemeExtension,
    Title: TitleThemeExtension,
  }
};

export default theme;