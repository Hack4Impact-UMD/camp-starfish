import { Anchor } from "@mantine/core";
import Link from "next/link";

const AnchorThemeExtension = Anchor.extend({
  defaultProps: {
    component: Link,
    underline: 'hover'
  }
});

export default AnchorThemeExtension;