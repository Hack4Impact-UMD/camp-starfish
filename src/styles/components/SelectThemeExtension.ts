import { Select } from "@mantine/core";

const SelectThemeExtension = Select.extend({
  classNames: {
    wrapper: 'max-w-80',
    input: 'border-blue border-2 px-0 py-2.5 rounded-sm max-h-30 overflow-y-scroll',
    dropdown: "rounded-sm border-neutral border p-0",
    option: "hover:bg-neutral-3 active:bg-neutral-4 rounded-none nth-2:rounded-t-sm last:rounded-b-sm not-last:border-b not-last:border-b-neutral-4",
  }
});

export default SelectThemeExtension;