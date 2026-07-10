import { MultiSelect } from "@mantine/core";

const MultiSelectThemeExtension = MultiSelect.extend({
  classNames: {
    root: 'max-w-full',
    input: 'border-blue border-2 px-0 py-2.5 rounded-sm',
    dropdown: "rounded-sm border-neutral border p-0",
    option: "hover:bg-neutral-3 active:bg-neutral-4 rounded-none nth-2:rounded-t-sm last:rounded-b-sm not-last:border-b not-last:border-b-neutral-4",
  }
});

export default MultiSelectThemeExtension;