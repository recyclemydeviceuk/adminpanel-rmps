import api from './api';

export interface Settings {
  general: {
    businessName:    string;
    tagline:         string;
    phone:           string;
    email:           string;
    address:         string;
    whatsappNumber:  string;
    logoUrl:         string;
  };
  operations: {
    maintenanceMode:     boolean;
    maintenanceMessage:  string;
  };
  notifications: {
    emailOnNewOrder:      boolean;
    emailOnOrderComplete: boolean;
    emailOnWarrantyClaim: boolean;
    emailOnContactForm:   boolean;
    emailOnNewsletter:    boolean;
  };
}

export async function getSettings(): Promise<Settings> {
  const res = await api.get<{ data: Settings }>('/settings');
  return res.data.data;
}

export async function updateGeneralSettings(data: Settings['general']): Promise<Settings> {
  const res = await api.put<{ data: Settings }>('/settings/general', data);
  return res.data.data;
}

export async function updateOperationsSettings(data: Settings['operations']): Promise<Settings> {
  const res = await api.put<{ data: Settings }>('/settings/operations', data);
  return res.data.data;
}

export async function updateNotificationsSettings(data: Settings['notifications']): Promise<Settings> {
  const res = await api.put<{ data: Settings }>('/settings/notifications', data);
  return res.data.data;
}
