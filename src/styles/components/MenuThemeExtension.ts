import { Menu } from "@mantine/core";

const MenuThemeExtension = Menu.extend({
  classNames: {
    dropdown: "rounded-sm border-neutral border p-0",
    item: "hover:bg-neutral-3 active:bg-neutral-4 rounded-none nth-2:rounded-t-sm last:rounded-b-sm not-last:border-b not-last:border-b-neutral-4",
  }
});

export default MenuThemeExtension;