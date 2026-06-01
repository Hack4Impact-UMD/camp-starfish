import { Tooltip } from "@mantine/core";

const TooltipThemeExtension = Tooltip.extend({
  classNames: {
    tooltip: 'bg-blue-5 rounded-sm font-Lato font-normal',
  },
  defaultProps: {
    position: 'bottom',
    withArrow: true
  }
});

export default TooltipThemeExtension;