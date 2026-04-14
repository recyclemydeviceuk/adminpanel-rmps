import type { OrderItem } from '../../../types/order';
import { formatCurrency } from '../../../lib/currency';

interface OrderItemsTableProps {
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
}

export default function OrderItemsTable({ items, subtotal, discount, total }: OrderItemsTableProps) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[#f3f4f6]">
              <th className="text-left py-3 text-[#5f6368] font-medium">Service</th>
              <th className="text-left py-3 text-[#5f6368] font-medium">Device</th>
              <th className="text-center py-3 text-[#5f6368] font-medium">Qty</th>
              <th className="text-right py-3 text-[#5f6368] font-medium">Unit Price</th>
              <th className="text-right py-3 text-[#5f6368] font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-[#f9fafb]">
                <td className="py-3">
                  <p className="font-medium text-[#202124]">{item.repairType}</p>
                  <p className="text-[11px] text-[#9aa0a6] mt-0.5">{item.description}</p>
                </td>
                <td className="py-3 text-[#5f6368]">{item.deviceModel}</td>
                <td className="py-3 text-center text-[#5f6368]">{item.quantity}</td>
                <td className="py-3 text-right text-[#5f6368]">{formatCurrency(item.unitPrice)}</td>
                <td className="py-3 text-right font-semibold text-[#202124]">{formatCurrency(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 space-y-1.5 border-t border-[#f3f4f6] pt-4">
        <div className="flex justify-between text-[13px] text-[#5f6368]">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-[13px] text-green-600">
            <span>Discount</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-[15px] font-bold text-[#202124] border-t border-[#e8eaed] pt-2 mt-2">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
