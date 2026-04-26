import { ActionIcon } from "@mantine/core";

const ActionItemThemeExtension = ActionIcon.extend({
  classNames: {
    root: 'border-2'
  },
  defaultProps: {
    radius: 'xl',
    size: 'xl'
  }
});

export default ActionItemThemeExtension;