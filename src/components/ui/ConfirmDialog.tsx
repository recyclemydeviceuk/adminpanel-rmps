import { AlertTriangle } from 'lucide-react';
import Button from './Button';

interface ConfirmDialogProps {
  open:        boolean;
  onConfirm:   () => void;
  onCancel:    () => void;
  title:       string;
  message:     string;
  confirmLabel?: string;
  cancelLabel?:  string;
  variant?:    'danger' | 'warning' | 'info';
  loading?:    boolean;
}

const ICON_COLOR = {
  danger:  'bg-red-100 text-red-600',
  warning: 'bg-yellow-100 text-yellow-600',
  info:    'bg-blue-100 text-blue-600',
};

export default function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'danger',
  loading      = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 animate-overlay-in"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-modal-in">
        <div className={`
          mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full
          ${ICON_COLOR[variant]}
        `}>
          <AlertTriangle size={22} />
        </div>
        <div className="text-center">
          <h3 className="text-[16px] font-bold text-[#202124]">{title}</h3>
          <p className="mt-2 text-[13px] text-[#5f6368] leading-relaxed">{message}</p>
        </div>
        <div className="mt-6 flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
