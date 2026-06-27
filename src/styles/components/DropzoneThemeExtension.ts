import { Dropzone } from "@mantine/dropzone";

const DropzoneThemeExtension = Dropzone.extend({
  classNames: {
    inner: 'flex flex-col justify-center items-center bg-neutral-2 hover:bg-neutral-3 border-4 border-dashed border-orange-5 rounded-lg my-2 p-2 cursor-pointer text-center',
  }
});

export default DropzoneThemeExtension;