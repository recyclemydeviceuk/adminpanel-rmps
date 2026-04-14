export interface NewsletterSubmission {
  id: string;
  email: string;
  subscribedAt: string;
  source: 'footer' | 'popup' | 'page';
  status: 'active' | 'unsubscribed';
}

export interface ContactSubmission {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  submittedAt: string;
  status: 'new' | 'read' | 'replied';
}

export interface WarrantySubmission {
  id: string;
  name: string;
  email: string;
  deviceBrand: string;
  deviceModel: string;
  claimInfo: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  orderReference?: string;
}
