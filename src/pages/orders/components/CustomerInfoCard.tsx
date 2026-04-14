import { Mail, Phone, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CustomerInfoCardProps {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export default function CustomerInfoCard({ customerId, customerName, customerEmail, customerPhone }: CustomerInfoCardProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <div
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => navigate(`/customers/${customerId}`)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate(`/customers/${customerId}`)}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 flex-shrink-0">
          <User size={16} className="text-red-600" />
        </div>
        <span className="text-[14px] font-semibold text-[#202124] group-hover:text-red-600 transition-colors">
          {customerName}
        </span>
      </div>
      <div className="space-y-2">
        <a
          href={`mailto:${customerEmail}`}
          className="flex items-center gap-2.5 text-[13px] text-[#5f6368] hover:text-red-600 transition-colors"
        >
          <Mail size={13} className="flex-shrink-0" />
          {customerEmail}
        </a>
        <a
          href={`tel:${customerPhone}`}
          className="flex items-center gap-2.5 text-[13px] text-[#5f6368] hover:text-red-600 transition-colors"
        >
          <Phone size={13} className="flex-shrink-0" />
          {customerPhone}
        </a>
      </div>
    </div>
  );
}
