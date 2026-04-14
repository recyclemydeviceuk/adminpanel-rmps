import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface Breadcrumb {
  label: string;
  to?:   string;
}

interface PageHeaderProps {
  title:        string;
  subtitle?:    string;
  actions?:     ReactNode;
  breadcrumbs?: Breadcrumb[];
  backTo?:      string;
  className?:   string;
}

export default function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  backTo,
  className = '',
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className={`mb-6 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-2 flex items-center gap-1.5 text-[12px] text-[#5f6368]">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-[#d1d5db]">/</span>}
              {crumb.to ? (
                <button
                  onClick={() => navigate(crumb.to!)}
                  className="hover:text-red-600 transition-colors font-medium"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-[#202124] font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {backTo && (
            <button
              onClick={() => navigate(backTo)}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-[#e8eaed] bg-white text-[#5f6368] hover:bg-gray-50 hover:text-[#202124] transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft size={17} />
            </button>
          )}
          <div>
            <h1 className="text-[22px] font-bold text-[#202124] leading-tight">{title}</h1>
            {subtitle && (
              <p className="mt-0.5 text-[13px] text-[#5f6368]">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
