import { Modal, ModalProps } from '@mantine/core';
import { ReactNode } from 'react';



export interface GenericModalProps {
  opened: boolean;
  onClose: () => void;
  title?: string | ReactNode;
  children: ReactNode;
  size?: ModalProps['size'];
  centered?: boolean;
  className?: string;
  closeOnClickOutside?: boolean;
  withCloseButton?: boolean;
}


export default function GenericModal({
  opened,
  onClose,
  title,
  children,
  size = 'md',
  centered = true,
  className = '',
  closeOnClickOutside = true,
  withCloseButton = true,
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
      classNames={{
        root: className,
        content: 'rounded-lg',
        header: 'border-b border-gray-200 pb-4',
        title: 'text-lg font-semibold text-gray-900',
        body: 'p-6',
      }}
    >
      {children}
    </Modal>
  );
}


export interface ConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  dangerous?: boolean;
}

export function ConfirmationModal({
  opened,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  dangerous = false,
}: ConfirmationModalProps) {
  return (
    <GenericModal
      opened={opened}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnClickOutside={!loading}
    >
      <div className="flex flex-col gap-6">
        <p className="text-sm text-gray-600">
          {message}
        </p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              dangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Loading...' : confirmLabel}
          </button>
        </div>
      </div>
    </GenericModal>
  );
}


export interface ContentModalProps {
  opened: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalProps['size'];
  closeOnClickOutside?: boolean;
}

export function ContentModal({
  opened,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnClickOutside = true,
}: ContentModalProps) {
  return (
    <GenericModal
      opened={opened}
      onClose={onClose}
      title={title}
      size={size}
      closeOnClickOutside={closeOnClickOutside}
    >
      <div className="flex flex-col gap-4">
        <div className="flex-1">
          {children}
        </div>
        {footer && (
          <div className="pt-4 border-t border-gray-200">
            {footer}
          </div>
        )}
      </div>
    </GenericModal>
  );
}


export interface ContextModalProps {
  opened: boolean;
  onClose: () => void;
  title?: string;
  contextText: string | ReactNode;
  description?: string | ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  cancelLabel?: string;
  icon?: ReactNode;
  loading?: boolean;
}

export function ContextModal({
  opened,
  onClose,
  title = 'Information',
  contextText,
  description,
  actionLabel = 'Got it',
  onAction,
  cancelLabel = 'Close',
  icon,
  loading = false,
}: ContextModalProps) {
  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      onClose();
    }
  };

  return (
    <GenericModal
      opened={opened}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnClickOutside={!loading}
    >
      <div className="flex flex-col gap-6">
        {icon && (
          <div className="flex justify-center">
            {icon}
          </div>
        )}
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">
            {contextText}
          </p>
          {description && (
            <p className="text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          {onAction && (
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={handleAction}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Loading...' : actionLabel}
          </button>
        </div>
      </div>
    </GenericModal>
  );
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/*
// All three modal types wrap the same GenericModal component

// 1. CONFIRMATION MODAL
<ConfirmationModal
  opened={confirmOpened}
  onClose={closeConfirm}
  onConfirm={handleDelete}
  title="Delete Item"
  message="Are you sure you want to delete this item? This action cannot be undone."
  confirmLabel="Delete"
  dangerous
/>

// 2. CONTENT MODAL
<ContentModal
  opened={contentOpened}
  onClose={closeContent}
  title="Edit Profile"
  footer={
    <div className="flex justify-end gap-3">
      <button onClick={closeContent} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
        Cancel
      </button>
      <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
        Save Changes
      </button>
    </div>
  }
>
  <input className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Name" />
  <input className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Email" />
</ContentModal>

// 3. CONTEXT MODAL
<ContextModal
  opened={contextOpened}
  onClose={closeContext}
  title="Welcome!"
  contextText="Thank you for joining our platform."
  description="Here are some tips to get started..."
  actionLabel="Get Started"
  onAction={handleGetStarted}
/>

// 4. DIRECT GENERIC MODAL (for custom needs)
<GenericModal
  opened={opened}
  onClose={close}
  title="Custom Modal"
>
  <YourCustomContent />
</GenericModal>
*/