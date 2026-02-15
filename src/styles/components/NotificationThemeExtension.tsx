import { MantineTheme, Notification, NotificationProps } from "@mantine/core";
import classNames from "classnames";
import { MdCheckCircle } from "react-icons/md";

const NotificationThemeExtension = Notification.extend({
  classNames: (theme: MantineTheme, props: NotificationProps) => {
    const { variant = 'success' } = props;
    return {
      root: 'bg-white rounded-md shadow-[0_2px_6px_rgba(0,0,0,0.15)] py-5 px-4 h-24',
      title: classNames('font-bold text-lg', {
        'text-success-4': variant === 'success',
        'text-error-4': variant === 'error'
      }),
      icon: 'p-0 bg-white',
      description: 'font-medium text-sm text-neutral-5',
      closeButton: 'text-neutral-6 size-24',
    }
  },
  defaultProps: {
    withCloseButton: true,
    variant: 'success',
    icon: <MdCheckCircle size={100} className="text-success" />
  }
});

export default NotificationThemeExtension;