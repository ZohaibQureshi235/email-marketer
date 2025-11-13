// User and Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Email and Campaign Types
export type CampaignStatus = 'draft' | 'scheduled' | 'sent' | 'archived';

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  subject: string;
  previewText?: string;
  recipientCount: number;
  sentAt?: Date;
  scheduledFor?: Date;
  createdAt: Date;
  updatedAt: Date;
  openRate?: number;
  clickRate?: number;
}

export interface EmailContact {
  id: string;
  email: string;
  nickname?: string;
  tags: string[];
  status: 'active' | 'inactive' | 'bounced';
  addedAt: Date;
  lastContacted?: Date;
}

export interface EmailBlock {
  id: string;
  type: 'text' | 'image' | 'button' | 'divider' | 'header' | 'footer' | 'spacer';
  content: string;
  styles: Record<string, string>;
  position: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  blocks: EmailBlock[];
  createdAt: Date;
  updatedAt: Date;
}

// File Upload Types
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  extractedEmails: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface CampaignFormData {
  name: string;
  subject: string;
  previewText: string;
  recipientGroups: string[];
  scheduleFor?: Date;
}

// Drag and Drop Types
export interface DragItem {
  id: string;
  type: string;
  index: number;
}

// Activity Types
export type ActivityType = 'campaign_created' | 'campaign_sent' | 'contact_added' | 'template_created';

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: Date;
  user?: string;
}