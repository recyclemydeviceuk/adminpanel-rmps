import { useState } from 'react';
import { Plus, HelpCircle } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SearchInput from '../../components/ui/SearchInput';
import EmptyState from '../../components/ui/EmptyState';
import FaqItem, { type FaqEntry } from './components/FaqItem';
import FaqFormModal from './components/FaqFormModal';
import { useToast } from '../../hooks/useToast';

const INITIAL_FAQS: FaqEntry[] = [
  { id: 'faq-001', question: 'How long does a screen repair take?', answer: 'Most screen repairs are completed within 1-2 hours. For same-day express repairs, we aim to have your device ready within 2 hours of drop-off.', category: 'Repairs', isActive: true, sortOrder: 1 },
  { id: 'faq-002', question: 'Do you use genuine parts?', answer: 'We use high-quality OEM-grade parts for all repairs. Genuine manufacturer parts are available on request for select Apple devices at an additional cost.', category: 'Repairs', isActive: true, sortOrder: 2 },
  { id: 'faq-003', question: 'What warranty do you offer?', answer: 'All repairs come with a standard 3-month warranty covering parts and labour. Extended 12-month warranty is available as an optional add-on.', category: 'Warranty', isActive: true, sortOrder: 3 },
  { id: 'faq-004', question: 'Can I get my phone repaired while I wait?', answer: 'Yes! We offer a walk-in service for most common repairs. Simply bring your device to any of our locations and our technicians will assess and repair it while you wait (subject to availability).', category: 'Repairs', isActive: true, sortOrder: 4 },
  { id: 'faq-005', question: 'Do you offer a collection and delivery service?', answer: 'Yes, we offer a nationwide collection and return service. We will collect your device, repair it at our workshop, and return it to you — usually within 2-3 working days.', category: 'Delivery', isActive: true, sortOrder: 5 },
  { id: 'faq-006', question: 'What payment methods do you accept?', answer: 'We accept all major credit and debit cards, PayPal, and bank transfer. Payment is taken after the repair is completed and you are satisfied.', category: 'Pricing', isActive: true, sortOrder: 6 },
];

export default function FaqsManagerPage() {
  const [faqs, setFaqs] = useState<FaqEntry[]>(INITIAL_FAQS);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editFaq, setEditFaq] = useState<FaqEntry | null>(null);
  const { success } = useToast();

  const filtered = faqs.filter(f => {
    const q = search.toLowerCase();
    return !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
  });

  const handleSubmit = async (data: Omit<FaqEntry, 'id'>) => {
    if (editFaq) {
      setFaqs(prev => prev.map(f => f.id === editFaq.id ? { ...f, ...data } : f));
      success('FAQ updated');
    } else {
      const newFaq: FaqEntry = { ...data, id: `faq-${Date.now()}` };
      setFaqs(prev => [...prev, newFaq]);
      success('FAQ added');
    }
  };

  const handleDelete = (faq: FaqEntry) => {
    if (!confirm(`Delete this FAQ?`)) return;
    setFaqs(prev => prev.filter(f => f.id !== faq.id));
    success('FAQ deleted');
  };

  const handleToggle = (faq: FaqEntry) => {
    setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, isActive: !f.isActive } : f));
  };

  const openCreate = () => { setEditFaq(null); setModalOpen(true); };
  const openEdit = (faq: FaqEntry) => { setEditFaq(faq); setModalOpen(true); };

  return (
    <div className="space-y-5">
      <PageHeader
        title="FAQs"
        subtitle={`${faqs.filter(f => f.isActive).length} active FAQs`}
        breadcrumbs={[{ label: 'Content', to: '/content' }, { label: 'FAQs' }]}
        actions={
          <Button variant="primary" size="md" leftIcon={<Plus size={15} />} onClick={openCreate}>
            Add FAQ
          </Button>
        }
      />

      <Card padding="md">
        <SearchInput value={search} onChange={setSearch} placeholder="Search FAQs..." className="max-w-sm" />
      </Card>

      <Card padding="md">
        {filtered.length === 0 ? (
          <EmptyState icon={HelpCircle} title="No FAQs found" description="Add your first FAQ to help customers." actionLabel="Add FAQ" onAction={openCreate} />
        ) : (
          <div className="space-y-2">
            {filtered.map(faq => (
              <FaqItem key={faq.id} faq={faq} onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggle} />
            ))}
          </div>
        )}
      </Card>

      <FaqFormModal
        open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit}
        initialData={editFaq} nextSortOrder={faqs.length + 1}
      />
    </div>
  );
}
