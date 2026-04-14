import Badge from '../../../components/ui/Badge';
import type { OrderStatus } from '../../../types/order';

const STATUS_CONFIG: Record<OrderStatus, { variant: 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'default'; label: string }> = {
  paid:       { variant: 'success', label: 'Paid' },
  processing: { variant: 'info',    label: 'Processing' },
  pending:    { variant: 'warning', label: 'Pending' },
  completed:  { variant: 'purple',  label: 'Completed' },
  failed:     { variant: 'danger',  label: 'Failed' },
  refunded:   { variant: 'default', label: 'Refunded' },
  cancelled:  { variant: 'default', label: 'Cancelled' },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  dot?: boolean;
}

export default function OrderStatusBadge({ status, dot = true }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { variant: 'default', label: status };
  return (
    <Badge variant={config.variant} dot={dot}>
      {config.label}
    </Badge>
  );
}
