import { Modal } from "@mantine/core";

const ModalThemeExtension = Modal.extend({
  classNames: {
    content: 'rounded-none',
    header: 'rounded-none bg-blue-8',
    title: 'text-white text-2xl'
  }
});

export default ModalThemeExtension;