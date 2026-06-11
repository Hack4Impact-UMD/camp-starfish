import { Radio } from "@mantine/core";

const RadioGroupThemeExtension = Radio.Group.extend({
  classNames: {
    label: 'text-neutral-5 text-xl font-medium',
  }
});

export default RadioGroupThemeExtension;