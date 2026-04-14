import type { Customer } from '../types/customer';

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cust-001', name: 'James Wilson', email: 'james.wilson@email.com', phone: '07700 900123',
    address: { line1: '12 Baker Street', city: 'London', county: 'Greater London', postcode: 'W1U 3BH', country: 'UK' },
    totalOrders: 3, totalSpent: 399.97, lastOrderDate: '2024-03-15T10:23:00Z',
    status: 'active', createdAt: '2023-08-10T09:00:00Z',
  },
  {
    id: 'cust-002', name: 'Sarah Ahmed', email: 'sarah.ahmed@email.com', phone: '07700 900456',
    address: { line1: '47 Oxford Road', city: 'Manchester', postcode: 'M13 9PL', country: 'UK' },
    totalOrders: 1, totalSpent: 79.99, lastOrderDate: '2024-03-15T09:05:00Z',
    status: 'active', createdAt: '2024-01-20T11:30:00Z',
  },
  {
    id: 'cust-003', name: 'Tom Clarke', email: 'tom.clarke@email.com', phone: '07700 900789',
    address: { line1: '8 Park Avenue', city: 'Birmingham', postcode: 'B3 2TA', country: 'UK' },
    totalOrders: 2, totalSpent: 179.98, lastOrderDate: '2024-03-14T14:45:00Z',
    status: 'active', createdAt: '2023-11-05T14:00:00Z',
  },
  {
    id: 'cust-004', name: 'Priya Sharma', email: 'priya.sharma@email.com', phone: '07700 900321',
    address: { line1: '23 Victoria Street', city: 'Edinburgh', postcode: 'EH1 2JL', country: 'UK' },
    totalOrders: 2, totalSpent: 239.98, lastOrderDate: '2024-03-14T11:30:00Z',
    status: 'active', createdAt: '2023-09-18T10:45:00Z',
  },
  {
    id: 'cust-005', name: 'Daniel Murphy', email: 'daniel.murphy@email.com', phone: '07700 900654',
    address: { line1: '5 High Street', city: 'Bristol', postcode: 'BS1 2AW', country: 'UK' },
    totalOrders: 1, totalSpent: 69.99, lastOrderDate: '2024-03-13T16:20:00Z',
    status: 'active', createdAt: '2024-02-14T08:30:00Z',
  },
  {
    id: 'cust-006', name: 'Emma Thompson', email: 'emma.thompson@email.com', phone: '07700 900987',
    address: { line1: '91 Queen Street', city: 'Cardiff', postcode: 'CF10 2BU', country: 'UK' },
    totalOrders: 1, totalSpent: 0, lastOrderDate: '2024-03-13T09:15:00Z',
    status: 'inactive', createdAt: '2024-01-08T13:20:00Z',
  },
  {
    id: 'cust-007', name: 'Liam Johnson', email: 'liam.johnson@email.com', phone: '07700 900147',
    address: { line1: '34 King Street', city: 'Leeds', postcode: 'LS1 2HH', country: 'UK' },
    totalOrders: 4, totalSpent: 489.96, lastOrderDate: '2024-03-12T13:45:00Z',
    status: 'active', createdAt: '2023-05-22T15:00:00Z',
  },
  {
    id: 'cust-008', name: 'Chloe Davis', email: 'chloe.davis@email.com', phone: '07700 900258',
    address: { line1: '16 Bridge Road', city: 'Sheffield', postcode: 'S1 2GF', country: 'UK' },
    totalOrders: 2, totalSpent: 219.98, lastOrderDate: '2024-03-12T10:00:00Z',
    status: 'active', createdAt: '2023-12-01T09:15:00Z',
  },
  {
    id: 'cust-009', name: 'Oliver Brown', email: 'oliver.brown@email.com', phone: '07700 900369',
    address: { line1: '72 Castle Gate', city: 'Nottingham', postcode: 'NG1 7AQ', country: 'UK' },
    totalOrders: 1, totalSpent: 179.99, lastOrderDate: '2024-03-11T14:30:00Z',
    status: 'active', createdAt: '2024-03-01T11:00:00Z',
  },
  {
    id: 'cust-010', name: 'Isla MacDonald', email: 'isla.macdonald@email.com', phone: '07700 900741',
    address: { line1: '3 Princes Street', city: 'Glasgow', postcode: 'G1 3AH', country: 'UK' },
    totalOrders: 3, totalSpent: 329.97, lastOrderDate: '2024-03-10T11:20:00Z',
    status: 'active', createdAt: '2023-07-11T14:30:00Z',
  },
  {
    id: 'cust-011', name: 'Noah Williams', email: 'noah.williams@email.com', phone: '07700 900852',
    address: { line1: '55 Church Lane', city: 'Liverpool', postcode: 'L1 3BS', country: 'UK' },
    totalOrders: 1, totalSpent: 0, lastOrderDate: '2024-03-09T16:55:00Z',
    status: 'active', createdAt: '2024-02-28T10:00:00Z',
  },
  {
    id: 'cust-012', name: 'Amelia Scott', email: 'amelia.scott@email.com', phone: '07700 900963',
    address: { line1: '28 Market Place', city: 'Leicester', postcode: 'LE1 5GH', country: 'UK' },
    totalOrders: 2, totalSpent: 159.98, lastOrderDate: '2024-03-08T09:30:00Z',
    status: 'active', createdAt: '2023-10-14T12:00:00Z',
  },
  {
    id: 'cust-013', name: 'Harry Evans', email: 'harry.evans@email.com', phone: '07700 900174',
    address: { line1: '9 Westgate', city: 'Newcastle', postcode: 'NE1 4XN', country: 'UK' },
    totalOrders: 1, totalSpent: 99.99, lastOrderDate: '2024-03-07T14:10:00Z',
    status: 'active', createdAt: '2024-01-30T16:45:00Z',
  },
  {
    id: 'cust-014', name: 'Sophie Turner', email: 'sophie.turner@email.com', phone: '07700 900285',
    address: { line1: '61 Broad Street', city: 'London', postcode: 'E1 6RF', country: 'UK' },
    totalOrders: 1, totalSpent: 279.99, lastOrderDate: '2024-03-05T15:40:00Z',
    status: 'active', createdAt: '2024-02-05T08:00:00Z',
  },
  {
    id: 'cust-015', name: 'Jack Robinson', email: 'jack.robinson@email.com', phone: '07700 900396',
    address: { line1: '44 Queens Road', city: 'Brighton', postcode: 'BN1 3XE', country: 'UK' },
    totalOrders: 0, totalSpent: 0,
    status: 'inactive', createdAt: '2024-03-01T10:00:00Z',
  },
];
