import { Title } from "@mantine/core";
import classNames from "classnames";

const TitleThemeExtension = Title.extend({
  classNames: (_, props) => {
    const { order } = props;
    return {
      root: classNames('font-Lato font-bold uppercase', {
        'text-5xl': order === 1
      })
    }
  }
})

export default TitleThemeExtension;