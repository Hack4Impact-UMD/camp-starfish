import { Modal, ModalProps } from '@mantine/core';
import { modals } from '@mantine/modals';
import { ReactNode } from 'react';

// ============================================================================
// GENERIC MODAL - Base wrapper for all modal types
// ============================================================================

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
  padding?: string;
  borderColor?: string; // For different modal types: blue, purple, etc.
}

/**
 * Generic Modal Component
 * Base modal that all other modal types (confirmation, content, context) wrap.
 * Provides consistent Figma styling across all modals.
 */
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
  padding = 'xl',
  borderColor = 'border-blue-500',
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
        root: className,
        content: `rounded-xl border-2 ${borderColor}`,
        header: 'border-b-0 pb-4',
        title: 'text-xl font-semibold text-gray-800',
        body: 'text-gray-700',
      }}
    >
      {children}
    </Modal>
  );
}

// ============================================================================
// CONFIRMATION MODAL - Extends GenericModal
// ============================================================================

export interface ConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string | ReactNode;
  message?: string | ReactNode;
  warningText?: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  dangerous?: boolean;
}

export function ConfirmationModal({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  warningText,
  confirmLabel = 'CONFIRM',
  cancelLabel = 'CANCEL',
  loading = false,
  dangerous = false,
}: ConfirmationModalProps) {
  return (
    <GenericModal
      opened={opened}
      onClose={onClose}
      title={title}
      size="md"
      closeOnClickOutside={!loading}
      withCloseButton={false}
      borderColor="border-purple-500"
    >
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
            onClick={onClose}
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
    </GenericModal>
  );
}

// ============================================================================
// CONTENT MODAL - Extends GenericModal
// ============================================================================

export interface ContentModalProps {
  opened: boolean;
  onClose: () => void;
  title?: string | ReactNode;
  subtitle?: string | ReactNode;
  children: ReactNode;
  size?: ModalProps['size'];
  closeOnClickOutside?: boolean;
  withCloseButton?: boolean;
  headerIcon?: ReactNode;
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
}: ContentModalProps) {
  const modalTitle = title ? (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {headerIcon && <div>{headerIcon}</div>}
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
      borderColor="border-blue-500"
    >
      {children}
    </GenericModal>
  );
}

// ============================================================================
// CONTEXT MODAL - Extends GenericModal
// ============================================================================

export interface ContextModalProps {
  opened: boolean;
  onClose: () => void;
  title?: string | ReactNode;
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
  actionLabel = 'GOT IT',
  onAction,
  cancelLabel = 'CLOSE',
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
      size="md"
      closeOnClickOutside={!loading}
      withCloseButton={!onAction}
      borderColor="border-blue-500"
    >
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
          {onAction && (
            <button
              onClick={onClose}
              disabled={loading}
              className="px-12 py-3 text-sm font-bold text-gray-700 bg-gray-300 rounded-full hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wide"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={handleAction}
            disabled={loading}
            className="px-12 py-3 text-sm font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wide"
          >
            {loading ? 'LOADING...' : actionLabel}
          </button>
        </div>
      </div>
    </GenericModal>
  );
}

// ============================================================================
// HELPER FUNCTIONS - Use Mantine Modal Manager to open modals
// ============================================================================

interface OpenConfirmationModalOptions {
  title?: string | ReactNode;
  message?: string | ReactNode;
  warningText?: string | ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  dangerous?: boolean;
  loading?: boolean;
}

export function openConfirmationModal(options: OpenConfirmationModalOptions) {
  const modalId = `confirmation-${Date.now()}`;
  
  modals.open({
    modalId,
    title: options.title,
    size: 'md',
    centered: true,
    withCloseButton: false,
    closeOnClickOutside: !options.loading,
    classNames: {
      content: 'rounded-xl border-2 border-purple-500',
      header: 'border-b-0 pb-4',
      title: 'text-xl font-semibold text-gray-800 text-center w-full',
      body: 'text-gray-700',
    },
    children: (
      <div className="flex flex-col gap-8">
        {options.message && (
          <p className="text-base text-gray-800 text-center">
            {options.message}
          </p>
        )}
        {options.warningText && (
          <p className="text-sm text-gray-600 text-center">
            {options.warningText}
          </p>
        )}
        
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              modals.close(modalId);
              options.onCancel?.();
            }}
            disabled={options.loading}
            className="px-12 py-3 text-sm font-bold text-gray-700 bg-gray-300 rounded-full hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wide"
          >
            {options.cancelLabel || 'CANCEL'}
          </button>
          <button
            onClick={() => {
              options.onConfirm();
              modals.close(modalId);
            }}
            disabled={options.loading}
            className={`px-12 py-3 text-sm font-bold text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide ${
              options.dangerous
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {options.loading ? 'LOADING...' : (options.confirmLabel || 'CONFIRM')}
          </button>
        </div>
      </div>
    ),
  });
}

interface OpenContentModalOptions {
  title?: string | ReactNode;
  subtitle?: string | ReactNode;
  children: ReactNode;
  onClose?: () => void;
  size?: ModalProps['size'];
  headerIcon?: ReactNode;
  closeOnClickOutside?: boolean;
}

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
    withCloseButton: true,
    closeOnClickOutside: options.closeOnClickOutside ?? true,
    onClose: options.onClose,
    classNames: {
      content: 'rounded-xl border-2 border-blue-500',
      header: 'border-b-0 pb-4',
      title: 'w-full',
      body: 'text-gray-700',
    },
    children: options.children,
  });
}

interface OpenContextModalOptions {
  title?: string | ReactNode;
  contextText: string | ReactNode;
  description?: string | ReactNode;
  onAction?: () => void;
  onCancel?: () => void;
  actionLabel?: string;
  cancelLabel?: string;
  icon?: ReactNode;
  loading?: boolean;
}

export function openContextModal(options: OpenContextModalOptions) {
  const modalId = `context-${Date.now()}`;
  
  modals.open({
    modalId,
    title: options.title || 'Information',
    size: 'md',
    centered: true,
    withCloseButton: !options.onAction,
    closeOnClickOutside: !options.loading,
    classNames: {
      content: 'rounded-xl border-2 border-blue-500',
      header: 'border-b-0 pb-4',
      title: 'text-xl font-semibold text-gray-800 text-center w-full',
      body: 'text-gray-700',
    },
    children: (
      <div className="flex flex-col gap-8">
        {options.icon && (
          <div className="flex justify-center">
            {options.icon}
          </div>
        )}
        
        <div className="space-y-3 text-center">
          <p className="text-base font-medium text-gray-800">
            {options.contextText}
          </p>
          {options.description && (
            <p className="text-sm text-gray-600">
              {options.description}
            </p>
          )}
        </div>

        <div className="flex justify-center gap-4">
          {options.onAction && (
            <button
              onClick={() => {
                modals.close(modalId);
                options.onCancel?.();
              }}
              disabled={options.loading}
              className="px-12 py-3 text-sm font-bold text-gray-700 bg-gray-300 rounded-full hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wide"
            >
              {options.cancelLabel || 'CLOSE'}
            </button>
          )}
          <button
            onClick={() => {
              options.onAction?.();
              modals.close(modalId);
            }}
            disabled={options.loading}
            className="px-12 py-3 text-sm font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wide"
          >
            {options.loading ? 'LOADING...' : (options.actionLabel || 'GOT IT')}
          </button>
        </div>
      </div>
    ),
  });
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// OPTION 1: Using helper functions with modal manager (RECOMMENDED)
import { openConfirmationModal, openContentModal, openContextModal } from '@/components/modals/GenericModal';

// Confirmation Modal
openConfirmationModal({
  title: 'Are you sure you want to delete this item?',
  warningText: 'WARNING: This action cannot be undone',
  onConfirm: () => console.log('Deleted!'),
  dangerous: true,
});

// Content Modal
openContentModal({
  title: 'Edit Profile',
  subtitle: 'Update your information',
  headerIcon: <UserIcon />,
  children: (
    <div>
      <input placeholder="Name" />
      <button>Save</button>
    </div>
  ),
});

// Context Modal
openContextModal({
  title: 'Welcome!',
  contextText: 'Thank you for joining.',
  description: 'Here are some tips...',
  icon: <CheckIcon />,
  actionLabel: 'GET STARTED',
});

// OPTION 2: Using components directly (for custom control)
import { ConfirmationModal, ContentModal, ContextModal } from '@/components/modals/GenericModal';

function MyComponent() {
  const [opened, setOpened] = useState(false);
  
  return (
    <>
      <button onClick={() => setOpened(true)}>Open</button>
      <ConfirmationModal
        opened={opened}
        onClose={() => setOpened(false)}
        onConfirm={() => console.log('Confirmed')}
        title="Confirm Action"
        message="Are you sure?"
        dangerous
      />
    </>
  );
}
*/