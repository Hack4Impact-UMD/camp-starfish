import { Button } from "@mantine/core"

export const ButtonThemeExtension = Button.extend({
  defaultProps: {
    radius: "xl",
    size: "md",
  },
  classNames: () => {
    return {
      root: 'uppercase font-bold'
    }
  }
})