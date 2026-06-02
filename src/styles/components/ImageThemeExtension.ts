import { Image, ImageProps } from "@mantine/core";
import NextImage from "next/image";

const ImageThemeExtension = Image.extend({
  defaultProps: {
    component: NextImage,
    // The Firebase Storage emulator serves images from localhost (a private
    // IP), which Next.js 16's image optimizer refuses to proxy. Skip
    // optimization in development; production still optimizes the public host.
    // `unoptimized` is forwarded to NextImage but isn't part of ImageProps.
    unoptimized: process.env.NODE_ENV !== "production",
  } as Partial<ImageProps> & { unoptimized?: boolean },
});

export default ImageThemeExtension;