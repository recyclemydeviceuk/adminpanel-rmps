import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import Button from './Button';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  icon?:          LucideIcon;
  title:          string;
  description?:   string;
  actionLabel?:   string;
  onAction?:      () => void;
  children?:      ReactNode;
  className?:     string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  children,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      {Icon && (
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 border border-[#e8eaed]">
          <Icon size={28} className="text-[#9aa0a6]" />
        </div>
      )}
      <h3 className="text-[15px] font-semibold text-[#202124]">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-[13px] text-[#5f6368] leading-relaxed">
          {description}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="md"
          onClick={onAction}
          leftIcon={<Plus size={15} />}
          className="mt-5"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
