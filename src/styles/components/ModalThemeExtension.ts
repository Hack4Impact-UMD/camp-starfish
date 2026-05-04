import { Modal } from "@mantine/core";

const ModalThemeExtension = Modal.extend({
  classNames: {
    content: 'rounded-none',
    header: 'rounded-none bg-blue-8',
    title: 'text-white text-2xl uppercase font-Lato font-black',
    close: 'text-white hover:bg-blue-6'
  }
});

export default ModalThemeExtension;