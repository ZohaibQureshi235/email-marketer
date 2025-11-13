export const APP_CONFIG = {
  name: 'Email Marketer POS',
  version: '1.0.0',
  description: 'Premium Email Marketing Platform',
};

export const EMAIL_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['.csv', '.txt', '.doc', '.docx', '.xlsx', '.xls'],
  maxContactsPerImport: 10000,
  dailyEmailLimit: 1000,
};

export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  SENT: 'sent',
  ARCHIVED: 'archived',
} as const;

export const CONTACT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BOUNCED: 'bounced',
} as const;

export const COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};