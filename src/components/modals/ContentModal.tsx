import { ReactNode } from 'react';
import { GenericModalProps } from '../modals/GenericModal';
import GenericModal from '../modals/GenericModal';

export interface ContentModalProps extends Omit<GenericModalProps, 'title'> {
    title?: string | ReactNode;
    subtitle?: string | ReactNode;
    children: ReactNode;
    headerIcon?: ReactNode;
}

export interface OpenContentModalOptions extends Omit<ContentModalProps, 'opened' | 'onClose'> {}

export function ContentModalContent({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

export function ContentModal({
    opened,
    onClose,
    title,
    subtitle,
    children,
    size = 'lg',
    closeOnClickOutside = true,
    withCloseButton = true,
    headerIcon,
    ...rest
}: ContentModalProps) {
    const modalTitle = title ? (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
                {headerIcon && <div>{headerIcon}</div>}
                {/* Title style inherited from theme, but wrapped in custom h2 */}
                <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
            </div>
            {subtitle && (
                <p className="text-sm text-gray-600 italic font-normal">
                    {subtitle}
                </p>
            )}
        </div>
    ) : undefined;

    return (
        <GenericModal
            opened={opened}
            onClose={onClose}
            title={modalTitle}
            size={size}
            closeOnClickOutside={closeOnClickOutside}
            withCloseButton={withCloseButton}
            borderColor="border-blue-500" // Default info color
            {...rest}
        >
            <ContentModalContent>{children}</ContentModalContent>
        </GenericModal>
    );
}
