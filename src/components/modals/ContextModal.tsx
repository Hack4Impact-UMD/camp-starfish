import { ReactNode } from 'react';
import { GenericModalProps } from '../modals/GenericModal';
import GenericModal from '../modals/GenericModal';

export interface ContextModalContentProps {
    contextText: string | ReactNode;
    description?: string | ReactNode;
    onAction: () => void;
    onCancel?: () => void;
    actionLabel?: string;
    cancelLabel?: string;
    icon?: ReactNode;
    loading?: boolean;
}

export interface ContextModalProps extends Omit<GenericModalProps, 'children' | 'closeOnClickOutside' | 'withCloseButton' | 'subtitle'> {
    title?: string | ReactNode;
    contextText: string | ReactNode;
    description?: string | ReactNode;
    onAction?: () => void;
    actionLabel?: string;
    cancelLabel?: string;
    icon?: ReactNode;
    loading?: boolean;
}

export interface OpenContextModalOptions extends Omit<ContextModalProps, 'opened' | 'onClose'> {}

/**
 * Context Modal Content (used by both standalone and modal manager)
 */
export function ContextModalContent({
    contextText,
    description,
    onAction,
    onCancel,
    actionLabel = 'GOT IT',
    cancelLabel = 'CLOSE',
    icon,
    loading = false,
}: ContextModalContentProps) {
    return (
        <div className="flex flex-col gap-8">
            {icon && (
                <div className="flex justify-center">
                    {icon}
                </div>
            )}

            <div className="space-y-3 text-center">
                <p className="text-base font-medium text-gray-800">
                    {contextText}
                </p>
                {description && (
                    <p className="text-sm text-gray-600">
                        {description}
                    </p>
                )}
            </div>

            <div className="flex justify-center gap-4">
                {onCancel && (
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-12 py-3 text-sm font-bold text-gray-700 bg-gray-300 rounded-full hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wide"
                    >
                        {cancelLabel}
                    </button>
                )}
                <button
                    onClick={onAction}
                    disabled={loading}
                    className="px-12 py-3 text-sm font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wide"
                >
                    {loading ? 'LOADING...' : actionLabel}
                </button>
            </div>
        </div>
    );
}

export function ContextModal({
    opened,
    onClose,
    title = 'Information',
    contextText,
    description,
    actionLabel,
    onAction,
    cancelLabel,
    icon,
    loading = false,
    size = 'md',
    ...rest
}: ContextModalProps) {
    const handleAction = onAction || onClose;

    return (
        <GenericModal
            opened={opened}
            onClose={onClose}
            title={title}
            size={size}
            centered
            closeOnClickOutside={!loading}
            withCloseButton={!onAction}
            borderColor="border-blue-500"
            {...rest}
        >
            <ContextModalContent
                contextText={contextText}
                description={description}
                onAction={handleAction}
                onCancel={onAction ? onClose : undefined}
                actionLabel={actionLabel}
                cancelLabel={cancelLabel}
                icon={icon}
                loading={loading}
            />
        </GenericModal>
    );
}