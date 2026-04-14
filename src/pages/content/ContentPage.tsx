import { useNavigate } from 'react-router-dom';
import { HelpCircle, Image, FileText } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';

const SECTIONS = [
  {
    icon: HelpCircle,
    title: 'FAQs',
    description: 'Manage frequently asked questions displayed on the website.',
    path: '/content/faqs',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Image,
    title: 'Banners',
    description: 'Manage promotional banners and homepage hero images.',
    path: '/content/banners',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
];

export default function ContentPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content"
        subtitle="Manage website content — FAQs, banners, and more"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTIONS.map(section => (
          <button
            key={section.path}
            onClick={() => navigate(section.path)}
            className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-[#e8eaed] shadow-[0_1px_3px_0_rgba(0,0,0,.06)] hover:shadow-md transition-shadow text-left group"
          >
            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${section.bg}`}>
              <section.icon size={22} className={section.color} />
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-[#202124] group-hover:text-red-600 transition-colors">
                {section.title}
              </h3>
              <p className="mt-1 text-[13px] text-[#5f6368] leading-relaxed">{section.description}</p>
            </div>
          </button>
        ))}
      </div>

      <Card padding="md">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50">
            <FileText size={16} className="text-[#5f6368]" />
          </div>
          <div>
            <h2 className="text-[14px] font-bold text-[#202124]">Content Guidelines</h2>
            <p className="text-[12px] text-[#9aa0a6]">Best practices for website content</p>
          </div>
        </div>
        <ul className="space-y-2">
          {[
            'Keep FAQs concise and customer-focused — answer the most common questions first.',
            'Use banner images that are at least 1200×400px for best display quality.',
            'Inactive content is hidden from the public website but remains in the system.',
            'Changes to FAQs and banners are reflected on the website immediately after saving.',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#5f6368]">
              <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 text-[9px] font-bold">{i + 1}</span>
              {tip}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
