export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string; // Base64 string for this demo (Firestore limit 1MB)
  previewUrl?: string; // Client-side only
}

export interface TransferSettings {
  expiresIn: '1-day' | '7-days' | 'never';
  passwordProtected: boolean;
  password?: string;
}

export interface TransferData {
  id?: string;
  files: UploadedFile[];
  message: string;
  senderEmail: string;
  recipientEmail?: string;
  settings: TransferSettings;
  createdAt: number;
  totalSize: number;
}

export interface User {
  uid: string;
  email: string;
  name: string;
  plan: 'free' | 'pro';
  createdAt: number;
}