import { TransferData, User, UploadedFile } from "../types";
import { PutBlobResult } from '@vercel/blob';

// --- Helpers ---
export const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- Transfers (Vercel Blob & KV) ---

export const saveTransfer = async (transfer: TransferData): Promise<string> => {
  // 1. Upload files to Vercel Blob
  const uploadedFiles: UploadedFile[] = [];

  for (const fileObj of transfer.files) {
    if (fileObj.data && fileObj.data.startsWith('data:')) {
      // Convert base64 back to Blob for upload
      const res = await fetch(fileObj.data);
      const blob = await res.blob();

      // Upload via API
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(fileObj.name)}`, {
        method: 'POST',
        body: blob,
      });

      if (!response.ok) throw new Error('File upload failed');

      const blobResult = (await response.json()) as PutBlobResult;

      uploadedFiles.push({
        ...fileObj,
        data: blobResult.url, // Store the public URL instead of base64
        previewUrl: blobResult.url
      });
    } else {
      // If for some reason data is missing or not base64, skip or handle error
      console.warn("Skipping invalid file data", fileObj.name);
    }
  }

  // 2. Save metadata to Vercel KV
  const id = transfer.id || Date.now().toString(36) + Math.random().toString(36).substr(2);

  const payload = {
    ...transfer,
    id,
    files: uploadedFiles // with Blob URLs
  };

  const kvResponse = await fetch('/api/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!kvResponse.ok) throw new Error('Failed to save transfer metadata');

  return id;
};

export const getTransfer = async (id: string): Promise<TransferData | undefined> => {
  try {
    const response = await fetch(`/api/transfer?id=${id}`);
    if (!response.ok) {
      if (response.status === 404) return undefined;
      throw new Error('Failed to fetch transfer');
    }

    const data = await response.json();
    return data as TransferData;
  } catch (e) {
    console.error("Error fetching transfer", e);
    return undefined;
  }
};

// --- User Management (Mock for now, KV potential later) ---
// Note: Real auth would require Vercel Auth or similar. Keeping it simple/mock for now as requested.

const USERS_KEY = "weshare_users";
const CURRENT_USER_KEY = "weshare_current_user_uid";

export const registerUser = async (email: string, password: string): Promise<User> => {
  // Simulate delay
  await new Promise(r => setTimeout(r, 500));

  const usersAttr = localStorage.getItem(USERS_KEY);
  const users: Record<string, User & { password: string }> = usersAttr ? JSON.parse(usersAttr) : {};

  const existingUser = Object.values(users).find(u => u.email === email);
  if (existingUser) throw new Error("User already exists");

  const uid = Date.now().toString();
  const newUser: User = {
    uid,
    email,
    name: email.split('@')[0],
    plan: 'free',
    createdAt: Date.now()
  };

  users[uid] = { ...newUser, password };
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_USER_KEY, uid);

  return newUser;
};

export const loginUser = async (email: string, password: string): Promise<void> => {
  await new Promise(r => setTimeout(r, 500));
  const usersAttr = localStorage.getItem(USERS_KEY);
  const users: Record<string, User & { password: string }> = usersAttr ? JSON.parse(usersAttr) : {};
  const user = Object.values(users).find(u => u.email === email && u.password === password);
  if (!user) throw new Error("Invalid credentials");
  localStorage.setItem(CURRENT_USER_KEY, user.uid);
};

export const logoutUser = async () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  const usersAttr = localStorage.getItem(USERS_KEY);
  const users: Record<string, User> = usersAttr ? JSON.parse(usersAttr) : {};
  return users[uid] || null;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const uid = localStorage.getItem(CURRENT_USER_KEY);
  if (!uid) return null;
  return getUserProfile(uid);
};

export const updateUserPlan = async (uid: string, plan: 'free' | 'pro'): Promise<void> => {
  const usersAttr = localStorage.getItem(USERS_KEY);
  const users: Record<string, User & { password: string }> = usersAttr ? JSON.parse(usersAttr) : {};
  if (users[uid]) {
    users[uid].plan = plan;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};