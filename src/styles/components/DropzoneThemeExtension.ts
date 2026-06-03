import { Dropzone } from "@mantine/dropzone";

const DropzoneThemeExtension = Dropzone.extend({
  classNames: {
    inner: 'flex flex-col justify-center items-center border-4 border-dashed border-orange-5 rounded-lg my-2 p-2 cursor-pointer',
  }
});

export default DropzoneThemeExtension;