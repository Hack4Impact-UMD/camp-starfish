import { Image } from "@mantine/core";
import NextImage from "next/image";

const ImageThemeExtension = Image.extend({
  defaultProps: {
    component: NextImage
  }
});

export default ImageThemeExtension;