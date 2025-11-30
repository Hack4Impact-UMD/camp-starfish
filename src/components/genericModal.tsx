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
  borderColor?: string;
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

export interface ConfirmationModalContentProps {
  title?: string | ReactNode;
  message?: string | ReactNode;
  warningText?: string | ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  dangerous?: boolean;
}

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

/**
 * Standalone Confirmation Modal (wraps GenericModal for direct use)
 */
export interface ConfirmationModalProps extends ConfirmationModalContentProps {
  opened: boolean;
  onClose: () => void;
  // onCancel?: () => void;
  size?: ModalProps['size'];
}

export function ConfirmationModal({
  opened,
  onClose,
  title,
  message,
  warningText,
  onConfirm,
  // onCancel,
  confirmLabel,
  cancelLabel,
  loading = false,
  dangerous = false,
  size = 'md',
}: ConfirmationModalProps) {
  return (
    <GenericModal
      opened={opened}
      onClose={onClose}
      title={title}
      size={size}
      closeOnClickOutside={!loading}
      withCloseButton={false}
      borderColor="border-purple-500"
    >
      <ConfirmationModalContent
        message={message}
        warningText={warningText}
        onConfirm={onConfirm}
        // onCancel={onCancel || onClose}
        onCancel={onClose}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        loading={loading}
        dangerous={dangerous}
      />
    </GenericModal>
  );
}

// ============================================================================
// CONTENT MODAL - Extends GenericModal
// ============================================================================

export interface ContentModalContentProps {
  children: ReactNode;
}

/**
 * Content Modal Content (just renders children)
 */
export function ContentModalContent({ children }: ContentModalContentProps) {
  return <>{children}</>;
}

/**
 * Standalone Content Modal (wraps GenericModal for direct use)
 */
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
      <ContentModalContent>{children}</ContentModalContent>
    </GenericModal>
  );
}

// ============================================================================
// CONTEXT MODAL - Extends GenericModal
// ============================================================================

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

/**
 * Standalone Context Modal (wraps GenericModal for direct use)
 */
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
  size?: ModalProps['size'];
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
}: ContextModalProps) {
  const handleAction = onAction || onClose;

  return (
    <GenericModal
      opened={opened}
      onClose={onClose}
      title={title}
      size={size}
      closeOnClickOutside={!loading}
      withCloseButton={!onAction}
      borderColor="border-blue-500"
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

// ============================================================================
// HELPER FUNCTIONS - Use Mantine Modal Manager with Modal Components
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
    classNames: {
      content: 'rounded-xl border-2 border-purple-500',
      header: 'border-b-0 pb-4',
      title: 'text-xl font-semibold text-gray-800 text-center w-full',
      body: 'text-gray-700',
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

interface OpenContentModalOptions {
  title?: string | ReactNode;
  subtitle?: string | ReactNode;
  children: ReactNode;
  onClose?: () => void;
  size?: ModalProps['size'];
  headerIcon?: ReactNode;
  closeOnClickOutside?: boolean;
  withCloseButton?: boolean;
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
      header: 'border-b-0 pb-4',
      title: 'w-full',
      body: 'text-gray-700',
    },
    children: <ContentModalContent>{options.children}</ContentModalContent>,
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
  size?: ModalProps['size'];
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
      header: 'border-b-0 pb-4',
      title: 'text-xl font-semibold text-gray-800 text-center w-full',
      body: 'text-gray-700',
    },
    children: (
      <ContextModalContent
        contextText={options.contextText}
        description={options.description}
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
        icon={options.icon}
        loading={options.loading}
      />
    ),
  });
}