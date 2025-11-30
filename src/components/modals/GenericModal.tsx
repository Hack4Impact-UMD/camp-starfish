import { ModalProps, Modal } from '@mantine/core';
import { ReactNode } from 'react';

export interface GenericModalProps extends Omit<ModalProps, 'classNames' | 'styles'> {
    borderColor?: string;
    className?: string;
    children: ReactNode;
    subtitle?: string | ReactNode;
}

/**
 * Generic Modal Component
 * Base modal that all other modal types wrap, applying consistent Figma styling (via theme)
 * and providing a colored border.
 */
export default function GenericModal({
    // Props derived from Mantine ModalProps
    opened,
    onClose,
    title,
    children,
    size = 'md',
    centered = true,
    closeOnClickOutside = true,
    withCloseButton = true,
    padding = 'xl',

    borderColor = 'border-blue-500',
    className = '',
    subtitle,
    ...rest
}: GenericModalProps) {
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={title}
            size={size}
            centered={centered}
            closeOnClickOutside={closeOnClickOutside}
            withCloseButton={withCloseButton}
            padding={padding}
            classNames={{
                // Root class for applying custom Tailwind classes to the Modal container
                root: className, 
                content: `rounded-xl border-2 ${borderColor}`,
            }}
            {...rest}
        >
            {children}
        </Modal>
    );
}