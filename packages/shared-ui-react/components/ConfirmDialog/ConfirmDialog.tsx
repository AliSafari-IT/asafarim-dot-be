import type { ReactNode } from 'react';
import { ButtonComponent } from '../Button';
import './ConfirmDialog.css';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /**
   * Visual emphasis for the confirm action. Defaults to 'danger'.
   */
  confirmVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'ghost' | 'outline' | 'link' | 'brand';
  /** Called when the user confirms the action. */
  onConfirm: () => void | Promise<void>;
  /** Called when the dialog should be closed without confirming. */
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const handleBackdropClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="confirm-dialog-backdrop"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={description ? 'confirm-dialog-description' : undefined}
      >
        <div className="confirm-dialog-header">
          <h2 id="confirm-dialog-title" className="confirm-dialog-title">
            {title}
          </h2>
        </div>

        {description && (
          <div id="confirm-dialog-description" className="confirm-dialog-body">
            {description}
          </div>
        )}

        <div className="confirm-dialog-footer">
          <ButtonComponent
            variant="secondary"
            type="button"
            onClick={onCancel}
          >
            {cancelLabel}
          </ButtonComponent>

          <ButtonComponent
            variant={confirmVariant}
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </ButtonComponent>
        </div>
      </div>
    </div>
  );
}
