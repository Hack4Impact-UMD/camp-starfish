import { ActionIcon } from "@mantine/core";
import classNames from "classnames";

const ActionItemThemeExtension = ActionIcon.extend({
  classNames: (_theme, props, _ctx) => {
    return {
      root: classNames({
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