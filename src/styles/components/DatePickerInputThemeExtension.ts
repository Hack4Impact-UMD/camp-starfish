import { DatePickerInput } from "@mantine/dates";
import DatePickerThemeExtension from "./DatePickerThemeExtension";
import TextInputThemeExtension from "./TextInputThemeExtension";
import theme from "../theme";

const DatePickerInputThemeExtension = DatePickerInput.extend({
  classNames: (theme, props, ctx) => {
    const datePickerClassNames = typeof DatePickerThemeExtension.classNames === 'function' ? DatePickerThemeExtension.classNames(theme, props, ctx) : DatePickerThemeExtension.classNames;
    const textInputClassNames = typeof TextInputThemeExtension.classNames === 'function' ? TextInputThemeExtension.classNames(theme, props, ctx) : TextInputThemeExtension.classNames;
    return { ...datePickerClassNames, ...textInputClassNames }
  },
  styles: (theme, props, ctx) => {
    const datePickerStyles = typeof DatePickerThemeExtension.styles === 'function' ? DatePickerThemeExtension.styles(theme, props, ctx) : DatePickerThemeExtension.styles;
    const textInputStyles = typeof TextInputThemeExtension.styles === 'function' ? TextInputThemeExtension.styles(theme, props, ctx) : TextInputThemeExtension.styles;
    return { ...datePickerStyles, ...textInputStyles }
  },
  defaultProps: {
    ...DatePickerThemeExtension.defaultProps,
    ...TextInputThemeExtension.defaultProps
  },
  vars: (theme, props, ctx) => {
    const datePickerVars = typeof DatePickerThemeExtension.vars === 'function' ? DatePickerThemeExtension.vars(theme, props, ctx) : DatePickerThemeExtension.vars;
    const textInputVars = typeof TextInputThemeExtension.vars === 'function' ? TextInputThemeExtension.vars(theme, props, ctx) : TextInputThemeExtension.vars;
    return { ...datePickerVars, ...textInputVars }
  }
})

export default DatePickerInputThemeExtension;