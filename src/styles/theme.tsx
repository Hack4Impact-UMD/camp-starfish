import { MantineThemeOverride } from "@mantine/core";
import globalTheme from "./globalTheme";
import ActionIconThemeExtension from "./components/ActionIconThemeExtension";
import AnchorThemeExtension from "./components/AnchorThemeExtension";
import ButtonThemeExtension from "./components/ButtonThemeExtension";
import CardThemeExtension from "./components/CardThemeExtension";
import DatePickerInputThemeExtension from "./components/DatePickerInputThemeExtension";
import DatePickerThemeExtension from "./components/DatePickerThemeExtension";
import DropzoneThemeExtension from "./components/DropzoneThemeExtension";
import ImageThemeExtension from "./components/ImageThemeExtension";
import MenuThemeExtension from "./components/MenuThemeExtension";
import ModalThemeExtension from "./components/ModalThemeExtension";
import MultiSelectThemeExtension from "./components/MultiSelectThemeExtension";
import NotificationThemeExtension from "./components/NotificationThemeExtension";
import RadioThemeExtension from "./components/RadioThemeExtension";
import RadioGroupThemeExtension from "./components/RadioGroupThemeExtension";
import SelectThemeExtension from "./components/SelectThemeExtension";
import TextInputThemeExtension from "./components/TextInputThemeExtension";
import TextThemeExtension from "./components/TextThemeExtension";
import TextareaThemeExtension from "./components/TextareaThemeExtension";
import TitleThemeExtension from "./components/TitleThemeExtension";
import TooltipThemeExtension from "./components/TooltipThemeExtension";

const theme: MantineThemeOverride = {
  ...globalTheme,
  components: {
    ActionIcon: ActionIconThemeExtension,
    Anchor: AnchorThemeExtension,
    Button: ButtonThemeExtension,
    Card: CardThemeExtension,
    DatePickerInput: DatePickerInputThemeExtension,
    DatePicker: DatePickerThemeExtension,
    Dropzone: DropzoneThemeExtension,
    Image: ImageThemeExtension,
    Menu: MenuThemeExtension,
    Modal: ModalThemeExtension,
    MultiSelect: MultiSelectThemeExtension,
    Notification: NotificationThemeExtension,
    Radio: RadioThemeExtension,
    RadioGroup: RadioGroupThemeExtension,
    Select: SelectThemeExtension,
    TextInput: TextInputThemeExtension,
    Text: TextThemeExtension,
    Textarea: TextareaThemeExtension,
    Title: TitleThemeExtension,
    Tooltip: TooltipThemeExtension
  }
};

export default theme;