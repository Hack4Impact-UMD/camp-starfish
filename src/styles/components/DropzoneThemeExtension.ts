import { Dropzone } from "@mantine/dropzone";

const DropzoneThemeExtension = Dropzone.extend({
  classNames: {
    inner: 'cursor-pointer'
  }
});

export default DropzoneThemeExtension;