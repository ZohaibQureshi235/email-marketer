// types/index.ts
export interface UserSettingsData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface EmailSettingsData {
  EMAIL_HOST: string;
  EMAIL_PORT: string;
  EMAIL_USER: string;
  EMAIL_PASSWORD: string;
}

export interface SettingsData {
  user: UserSettingsData;
  email: EmailSettingsData;
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface FormErrors {
  [key: string]: string;
}

// UI Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}