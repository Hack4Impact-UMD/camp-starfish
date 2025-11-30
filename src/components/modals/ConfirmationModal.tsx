import { ReactNode } from 'react';
import { GenericModalProps } from '../modals/GenericModal';
import GenericModal from '../modals/GenericModal';

export interface ConfirmationModalContentProps {
    message?: string | ReactNode;
    warningText?: string | ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    dangerous?: boolean;
}

export interface ConfirmationModalProps extends Omit<GenericModalProps, 'children' | 'closeOnClickOutside' | 'withCloseButton' | 'title'> {
    title?: string | ReactNode;
    message?: string | ReactNode;
    warningText?: string | ReactNode;
    onConfirm: () => void;
    onCancel?: () => void; 
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    dangerous?: boolean;
}

export interface OpenConfirmationModalOptions extends Omit<ConfirmationModalProps, 'opened' | 'onClose'> {}

/**
 * Confirmation Modal Content (used by both standalone and modal manager)
 */
export function ConfirmationModalContent({
    message,
    warningText,
    onConfirm,
    onCancel,
    confirmLabel = 'CONFIRM',
    cancelLabel = 'CANCEL',
    loading = false,
    dangerous = false,
}: ConfirmationModalContentProps) {
    return (
        <div className="flex flex-col gap-8">
            {message && (
                <p className="text-base text-gray-800 text-center">
                    {message}
                </p>
            )}
            {warningText && (
                <p className="text-sm text-gray-600 text-center">
                    {warningText}
                </p>
            )}
            
            <div className="flex justify-center gap-4">
                <button
                    onClick={onCancel}
                    disabled={loading}
                    className="px-12 py-3 text-sm font-bold text-gray-700 bg-gray-300 rounded-full hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wide"
                >
                    {cancelLabel}
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className={`px-12 py-3 text-sm font-bold text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide ${
                        dangerous
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {loading ? 'LOADING...' : confirmLabel}
                </button>
            </div>
        </div>
    );
}

export function ConfirmationModal({
    opened,
    onClose,
    title,
    message,
    warningText,
    onConfirm,
    onCancel,
    confirmLabel,
    cancelLabel,
    loading = false,
    dangerous = false,
    size = 'md',
}: ConfirmationModalProps) {
    const handleCancel = onCancel || onClose;

    return (
        <GenericModal
            opened={opened}
            onClose={onClose}
            title={title}
            size={size}
            centered
            closeOnClickOutside={!loading}
            withCloseButton={false}
            borderColor="border-purple-500"
        >
            <ConfirmationModalContent
                message={message}
                warningText={warningText}
                onConfirm={onConfirm}
                onCancel={handleCancel}
                confirmLabel={confirmLabel}
                cancelLabel={cancelLabel}
                loading={loading}
                dangerous={dangerous}
            />
        </GenericModal>
    );
}