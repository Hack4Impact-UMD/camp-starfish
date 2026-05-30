import { Textarea } from "@mantine/core";

const TextareaThemeExtension = Textarea.extend({
  classNames: {
        input: "bg-blue-0 rounded-md border-none hover:border-neutral-8 px-3 hover:border-2 py-2 text-sm text-blue-9 placeholder:text-neutral-5",
  }
});

export default TextareaThemeExtension;