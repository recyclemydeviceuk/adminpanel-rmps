import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open:      boolean;
  onClose:   () => void;
  title:     string;
  subtitle?: string;
  children:  ReactNode;
  footer?:   ReactNode;
  size?:     'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_MAP = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 animate-overlay-in"
        onClick={onClose}
      />
      <div
        className={`
          relative w-full ${SIZE_MAP[size]} max-h-[90vh]
          bg-white rounded-2xl shadow-2xl flex flex-col animate-modal-in
        `}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[#f3f4f6] flex-shrink-0">
          <div>
            <h2 className="text-[17px] font-bold text-[#202124]">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 text-[13px] text-[#5f6368]">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-xl text-[#5f6368] hover:bg-gray-100 hover:text-[#202124] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
        {footer && (
          <div className="flex-shrink-0 border-t border-[#f3f4f6] px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
