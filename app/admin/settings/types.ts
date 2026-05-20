export interface Category {
  id: string;
  name: string;
  description?: string;
  courseCount?: number;
}

export interface Provider {
  id: string;
  name: string;
  website?: string;
  courseCount?: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  description?: string;
  isActive: boolean;
}