import { useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
}

interface FaqItemProps {
  faq: FaqEntry;
  onEdit: (faq: FaqEntry) => void;
  onDelete: (faq: FaqEntry) => void;
  onToggle: (faq: FaqEntry) => void;
}

export default function FaqItem({ faq, onEdit, onDelete, onToggle }: FaqItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border transition-colors ${faq.isActive ? 'border-[#e8eaed]' : 'border-dashed border-[#e8eaed] opacity-60'}`}>
      <div
        className="flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer"
        onClick={() => setExpanded(p => !p)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setExpanded(p => !p)}
      >
        <p className="font-semibold text-[13px] text-[#202124] flex-1">{faq.question}</p>
        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit(faq)} className="flex h-7 w-7 items-center justify-center rounded-lg text-[#5f6368] hover:bg-gray-100 transition-colors">
            <Pencil size={12} />
          </button>
          <button onClick={() => onDelete(faq)} className="flex h-7 w-7 items-center justify-center rounded-lg text-[#5f6368] hover:bg-red-50 hover:text-red-600 transition-colors">
            <Trash2 size={12} />
          </button>
          <button onClick={() => onToggle(faq)} className="text-[10px] font-semibold px-2 py-1 rounded-lg border border-[#e8eaed] hover:bg-gray-50 transition-colors text-[#5f6368]">
            {faq.isActive ? 'Hide' : 'Show'}
          </button>
          <span className="ml-1 text-[#9aa0a6]">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4">
          <div className="h-px bg-[#f3f4f6] mb-3" />
          <p className="text-[13px] text-[#5f6368] leading-relaxed">{faq.answer}</p>
          {faq.category && (
            <span className="mt-2 inline-block text-[10px] font-medium bg-gray-100 text-[#5f6368] px-2 py-0.5 rounded-lg">
              {faq.category}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
