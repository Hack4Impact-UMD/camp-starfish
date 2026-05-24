import { ActionIcon } from "@mantine/core";
import classNames from "classnames";

const ActionItemThemeExtension = ActionIcon.extend({
  classNames: (theme, props, ctx) => {
    return {
      root: classNames('border-2', {
        'hover:rounded-xl hover:bg-[#00000010]': props.variant === "transparent"
      })
    }
  },
  defaultProps: {
    radius: 'xl',
    size: 'xl'
  }
});

export default ActionItemThemeExtension;