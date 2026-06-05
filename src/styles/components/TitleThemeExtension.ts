import { Title } from "@mantine/core";
import classNames from "classnames";

const TitleThemeExtension = Title.extend({
  classNames: (_, props) => {
    const { order } = props;
    return {
      root: classNames('font-Lato font-bold', {
        'text-5xl': order === 1,
        'text-4xl': order === 2,
        'text-3xl': order === 3,
        'text-2xl': order === 4,
        'text-xl': order === 5,
        'text-lg': order === 6
      })
    }
  }
});

export default TitleThemeExtension;