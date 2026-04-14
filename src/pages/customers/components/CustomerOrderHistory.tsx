import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../../hooks/useOrders';
import { formatCurrency } from '../../../lib/currency';
import { formatDate } from '../../../lib/dates';
import Spinner from '../../../components/ui/Spinner';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import type { OrderStatus } from '../../../types/order';

interface CustomerOrderHistoryProps {
  customerId: string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; dot: string }> = {
  pending:   { label: 'Pending',   color: 'bg-amber-50 text-amber-700',   dot: 'bg-amber-400' },
  paid:      { label: 'Paid',      color: 'bg-blue-50 text-blue-700',     dot: 'bg-blue-400' },
  processing:{ label: 'Processing',color: 'bg-indigo-50 text-indigo-700', dot: 'bg-indigo-400' },
  completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700',dot: 'bg-emerald-500' },
  failed:    { label: 'Failed',    color: 'bg-red-50 text-red-700',       dot: 'bg-red-500' },
  refunded:  { label: 'Refunded',  color: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500',    dot: 'bg-gray-400' },
};

export default function CustomerOrderHistory({ customerId }: CustomerOrderHistoryProps) {
  const navigate = useNavigate();
  const { orders, loading } = useOrders();
  const customerOrders = orders.filter(o => o.customerId === customerId);

  if (loading) {
    return <div className="flex justify-center py-10"><Spinner /></div>;
  }

  if (customerOrders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50">
          <ShoppingBag size={20} className="text-[#d1d5db]" />
        </div>
        <p className="text-[13px] font-semibold text-[#5f6368]">No orders yet</p>
        <p className="text-[12px] text-[#9aa0a6]">This customer hasn't placed any orders.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Table header */}
      <div className="grid grid-cols-[1.2fr_2fr_1fr_1.2fr_1fr_24px] gap-3 border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-2.5">
        {['Order', 'Device / Service', 'Total', 'Status', 'Date', ''].map(h => (
          <span key={h} className="text-[11px] font-semibold uppercase tracking-wide text-[#9aa0a6]">{h}</span>
        ))}
      </div>

      <div className="divide-y divide-[#f8fafc]">
        {customerOrders.map(order => {
          const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
          return (
            <div key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="grid grid-cols-[1.2fr_2fr_1fr_1.2fr_1fr_24px] gap-3 items-center px-5 py-3.5 hover:bg-[#fafbfc] cursor-pointer transition-colors group">

              {/* Order number */}
              <span className="font-mono text-[11px] font-bold text-[#5f6368] bg-gray-100 px-2 py-1 rounded-lg w-fit">
                {order.orderNumber}
              </span>

              {/* Device / Service */}
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[#202124] truncate">{order.device}</p>
                <p className="text-[11px] text-[#9aa0a6] truncate">{order.repairType}</p>
              </div>

              {/* Total */}
              <span className="text-[13px] font-bold text-[#202124]">{formatCurrency(order.total)}</span>

              {/* Status chip */}
              <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold w-fit ${cfg.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>

              {/* Date */}
              <span className="text-[11px] text-[#9aa0a6]">{formatDate(order.createdAt)}</span>

              {/* Arrow */}
              <ChevronRight size={12} className="text-[#e2e8f0] group-hover:text-red-400 transition-colors" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
