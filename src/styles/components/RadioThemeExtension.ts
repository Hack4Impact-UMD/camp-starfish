import { Radio } from "@mantine/core";

const RadioThemeExtension = Radio.extend({
  classNames: {
    radio: "checked:bg-blue not-checked:hover:bg-neutral-3 checked:border-blue border-neutral-4 border-2",
    icon: "hidden"
  }
});

export default RadioThemeExtension;