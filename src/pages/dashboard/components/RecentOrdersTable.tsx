import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders } from '../../../lib/orders';
import type { Order } from '../../../types/order';

const STATUS_STYLE: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  paid:       { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200' },
  processing: { dot: 'bg-blue-500',    text: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-200'    },
  pending:    { dot: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200'   },
  completed:  { dot: 'bg-purple-500',  text: 'text-purple-700',  bg: 'bg-purple-50',   border: 'border-purple-200'  },
  failed:     { dot: 'bg-red-500',     text: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-200'     },
  refunded:   { dot: 'bg-orange-500',  text: 'text-orange-700',  bg: 'bg-orange-50',   border: 'border-orange-200'  },
  cancelled:  { dot: 'bg-gray-400',    text: 'text-gray-600',    bg: 'bg-gray-50',     border: 'border-gray-200'    },
};

const AVATAR_GRADS = [
  'from-red-400 to-rose-500',
  'from-blue-400 to-indigo-500',
  'from-amber-400 to-orange-500',
  'from-pink-400 to-fuchsia-500',
  'from-emerald-400 to-teal-500',
  'from-violet-400 to-purple-500',
  'from-cyan-400 to-sky-500',
  'from-lime-400 to-green-500',
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getAvatarGrad(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADS[Math.abs(hash) % AVATAR_GRADS.length];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function RecentOrdersTable() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then(all => {
        // Sort newest first, take 8
        const sorted = [...all].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sorted.slice(0, 8));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-[14px] font-semibold text-[#5f6368]">No orders yet</p>
        <p className="text-[12px] text-[#9aa0a6] mt-1">Orders will appear here once customers start booking repairs</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#f3f4f6]">
            {['Order', 'Customer', 'Service', 'Amount', 'Status', 'Time'].map(h => (
              <th key={h} className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#9aa0a6]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f8fafc]">
          {orders.map(order => {
            const s = STATUS_STYLE[order.status] ?? STATUS_STYLE.pending;
            const service = order.repairType || order.items?.[0]?.repairType || 'Repair';
            const device  = order.model || order.device || '—';
            return (
              <tr
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="group cursor-pointer hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-white transition-all duration-150"
              >
                {/* Order Number */}
                <td className="px-6 py-4">
                  <span className="font-mono text-[12px] font-bold text-[#5f6368] group-hover:text-red-600 transition-colors">
                    {order.orderNumber || order.id.slice(-6).toUpperCase()}
                  </span>
                </td>

                {/* Customer */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getAvatarGrad(order.customerName)} text-[11px] font-black text-white shadow-sm`}>
                      {getInitials(order.customerName)}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#202124] leading-tight">{order.customerName}</p>
                      <p className="text-[11px] text-[#9aa0a6]">{device}</p>
                    </div>
                  </div>
                </td>

                {/* Service */}
                <td className="px-6 py-4">
                  <span className="text-[13px] text-[#5f6368]">{service}</span>
                </td>

                {/* Amount */}
                <td className="px-6 py-4">
                  <span className="text-[14px] font-black text-[#202124]">
                    £{order.total.toFixed(2)}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${s.bg} ${s.text} ${s.border}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>

                {/* Time */}
                <td className="px-6 py-4 text-right">
                  <span className="text-[12px] text-[#9aa0a6]">{timeAgo(order.createdAt)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
