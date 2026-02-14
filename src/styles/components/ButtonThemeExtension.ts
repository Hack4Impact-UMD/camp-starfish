import { Button } from "@mantine/core"

const ButtonThemeExtension = Button.extend({
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

export default ButtonThemeExtension;