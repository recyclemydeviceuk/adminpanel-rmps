import { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import type { FaqEntry } from './FaqItem';

interface FaqFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<FaqEntry, 'id'>) => Promise<void>;
  initialData?: FaqEntry | null;
  nextSortOrder: number;
}

export default function FaqFormModal({ open, onClose, onSubmit, initialData, nextSortOrder }: FaqFormModalProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.question); setAnswer(initialData.answer);
      setCategory(initialData.category); setIsActive(initialData.isActive);
    } else {
      setQuestion(''); setAnswer(''); setCategory(''); setIsActive(true);
    }
    setError('');
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) { setError('Question is required.'); return; }
    if (!answer.trim()) { setError('Answer is required.'); return; }
    setLoading(true);
    try {
      await onSubmit({
        question: question.trim(), answer: answer.trim(),
        category: category.trim(), isActive,
        sortOrder: initialData?.sortOrder ?? nextSortOrder,
      });
      onClose();
    } catch {
      setError('Failed to save FAQ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={initialData ? 'Edit FAQ' : 'Add FAQ'} size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" size="md" form="faq-form" type="submit" loading={loading}>
            {initialData ? 'Save Changes' : 'Add FAQ'}
          </Button>
        </div>
      }
    >
      <form id="faq-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[#202124]">Question <span className="text-red-500">*</span></label>
          <textarea
            value={question} onChange={e => setQuestion(e.target.value)}
            placeholder="e.g. How long does a screen repair take?"
            rows={2} required
            className="w-full rounded-xl border border-[#e8eaed] bg-white px-3.5 py-2.5 text-[14px] text-[#202124] placeholder:text-[#9aa0a6] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[#202124]">Answer <span className="text-red-500">*</span></label>
          <textarea
            value={answer} onChange={e => setAnswer(e.target.value)}
            placeholder="Provide a clear, helpful answer..."
            rows={5} required
            className="w-full rounded-xl border border-[#e8eaed] bg-white px-3.5 py-2.5 text-[14px] text-[#202124] placeholder:text-[#9aa0a6] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none"
          />
        </div>
        <Input label="Category" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Repairs, Pricing, Shipping" hint="Optional — used to group FAQs" />
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 accent-red-600" />
          <span className="text-[13px] text-[#202124] font-medium">Visible on website</span>
        </label>
        {error && <p className="text-[12px] text-red-500">{error}</p>}
      </form>
    </Modal>
  );
}
