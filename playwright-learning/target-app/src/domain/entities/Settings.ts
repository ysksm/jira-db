export interface GeneralSettings {
  siteName: string;
  language: 'ja' | 'en';
  timezone: string;
  dateFormat: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  orderAlerts: boolean;
  stockAlerts: boolean;
  newsletterSubscription: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordMinLength: number;
  requireSpecialChars: boolean;
}

export interface AppSettings {
  general: GeneralSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
}
