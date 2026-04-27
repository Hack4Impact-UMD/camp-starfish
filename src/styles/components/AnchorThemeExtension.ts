import { Anchor } from "@mantine/core";
import Link from "next/link";

const AnchorThemeExtension = Anchor.extend({
  defaultProps: {
    component: Link
  }
});

export default AnchorThemeExtension;