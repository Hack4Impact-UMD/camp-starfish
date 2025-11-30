import { modals } from '@mantine/modals';
import { ReactNode } from 'react';
import { ModalProps } from '@mantine/core';
import { ConfirmationModalContent } from './ConfirmationModal';
import { ContentModalContent } from './ContentModal';
import { ContextModalContent } from './ContextModal';

export interface OpenConfirmationModalOptions {
    title?: string | ReactNode;
    message?: string | ReactNode;
    warningText?: string | ReactNode;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    dangerous?: boolean;
    loading?: boolean;
    size?: ModalProps['size'];
}

export interface OpenContentModalOptions {
    title?: string | ReactNode;
    subtitle?: string | ReactNode;
    children: ReactNode;
    onClose?: () => void;
    size?: ModalProps['size'];
    headerIcon?: ReactNode;
    closeOnClickOutside?: boolean;
    withCloseButton?: boolean;
}

export interface OpenContextModalOptions {
    title?: string | ReactNode;
    contextText: string | ReactNode;
    description?: string | ReactNode;
    onAction?: () => void;
    onCancel?: () => void;
    actionLabel?: string;
    cancelLabel?: string;
    icon?: ReactNode;
    loading?: boolean;
    size?: ModalProps['size'];
}

/**
 * Opens a confirmation modal using the modal manager
 * Uses ConfirmationModalContent to ensure consistency
 */
export function openConfirmationModal(options: OpenConfirmationModalOptions) {
    const modalId = `confirmation-${Date.now()}`;
    
    modals.open({
        modalId,
        title: options.title,
        size: options.size || 'md',
        centered: true,
        withCloseButton: false,
        closeOnClickOutside: !options.loading,

        // Only need to define unique styling here (border color), base styles are in theme.ts
        classNames: {
            content: 'rounded-xl border-2 border-purple-500', 
        },
        children: (
            <ConfirmationModalContent
                message={options.message}
                warningText={options.warningText}
                onConfirm={() => {
                    options.onConfirm();
                    modals.close(modalId);
                }}
                onCancel={() => {
                    options.onCancel?.();
                    modals.close(modalId);
                }}
                confirmLabel={options.confirmLabel}
                cancelLabel={options.cancelLabel}
                loading={options.loading}
                dangerous={options.dangerous}
            />
        ),
    });
}

/**
 * Opens a content modal using the modal manager
 * Uses ContentModalContent to ensure consistency
 */
export function openContentModal(options: OpenContentModalOptions) {
    const modalId = `content-${Date.now()}`;

    const modalTitle = options.title ? (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
                {options.headerIcon && <div>{options.headerIcon}</div>}
                <h2 className="text-2xl font-semibold text-gray-800">{options.title}</h2>
            </div>
            {options.subtitle && (
                <p className="text-sm text-gray-600 italic font-normal">
                    {options.subtitle}
                </p>
            )}
        </div>
    ) : undefined;
    
    modals.open({
        modalId,
        title: modalTitle,
        size: options.size || 'lg',
        centered: true,

        withCloseButton: options.withCloseButton ?? true,
        closeOnClickOutside: options.closeOnClickOutside ?? true,
        onClose: () => {
            options.onClose?.();
        },
        classNames: {
            content: 'rounded-xl border-2 border-blue-500',
            title: 'w-full', 
        },
        children: <ContentModalContent>{options.children}</ContentModalContent>,
    });
}

/**
 * Opens a context modal using the modal manager
 * Uses ContextModalContent to ensure consistency
 */
export function openContextModal(options: OpenContextModalOptions) {
    const modalId = `context-${Date.now()}`;
    
    modals.open({
        modalId,
        title: options.title || 'Information',
        size: options.size || 'md',
        centered: true,

        withCloseButton: !options.onAction, 
        closeOnClickOutside: !options.loading,
        
        classNames: {
            content: 'rounded-xl border-2 border-blue-500', 
        },
        children: (
            <ContextModalContent
                contextText={options.contextText}
                description={options.description}
                icon={options.icon}
                loading={options.loading}
                onAction={() => {
                    options.onAction?.();
                    modals.close(modalId);
                }}
                onCancel={options.onAction ? () => {
                    modals.close(modalId);
                    options.onCancel?.();
                } : undefined}
                actionLabel={options.actionLabel}
                cancelLabel={options.cancelLabel}
            />
        ),
    });
}