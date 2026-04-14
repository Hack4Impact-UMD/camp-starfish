import { MantineThemeOverride } from "@mantine/core";
import globalTheme from "./globalTheme";
import ActionIconThemeExtension from "./components/ActionIconThemeExtension";
import ButtonThemeExtension from "./components/ButtonThemeExtension";
import DatePickerInputThemeExtension from "./components/DatePickerInputThemeExtension";
import DatePickerThemeExtension from "./components/DatePickerThemeExtension";
import ImageThemeExtension from "./components/ImageThemeExtension";
import MenuThemeExtension from "./components/MenuThemeExtension";
import ModalThemeExtension from "./components/ModalThemeExtension";
import NotificationThemeExtension from "./components/NotificationThemeExtension";
import RadioThemeExtension from "./components/RadioThemeExtension";
import TextInputThemeExtension from "./components/TextInputThemeExtension";
import TextThemeExtension from "./components/TextThemeExtension";
import TitleThemeExtension from "./components/TitleThemeExtension";
import TooltipThemeExtension from "./components/TooltipThemeExtension";

const theme: MantineThemeOverride = {
  ...globalTheme,
  components: {
    ActionIcon: ActionIconThemeExtension,
    Button: ButtonThemeExtension,
    DatePickerInput: DatePickerInputThemeExtension,
    DatePicker: DatePickerThemeExtension,
    Image: ImageThemeExtension,
    Menu: MenuThemeExtension,
    Modal: ModalThemeExtension,
    Notification: NotificationThemeExtension,
    Radio: RadioThemeExtension,
    TextInput: TextInputThemeExtension,
    Text: TextThemeExtension,
    Title: TitleThemeExtension,
    Tooltip: TooltipThemeExtension
  }
};

export default theme;