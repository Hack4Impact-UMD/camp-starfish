import { Card } from "@mantine/core";

const CardThemeExtension = Card.extend({
  classNames: {
    root: 'bg-neutral-1 h-full w-full rounded-lg shadow-md',
  }
});

export default CardThemeExtension;