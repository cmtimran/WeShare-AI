import { db, auth } from "../firebaseConfig";
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from "firebase/firestore";
import { TransferData, User, UploadedFile } from "../types";

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

// --- Transfers (Firestore) ---

export const saveTransfer = async (transfer: TransferData): Promise<string> => {
  if (!db) throw new Error("Firebase DB not initialized");
  
  // Create a clean object for Firestore
  const transferPayload = {
    message: transfer.message,
    senderEmail: transfer.senderEmail,
    recipientEmail: transfer.recipientEmail || null,
    settings: transfer.settings,
    createdAt: transfer.createdAt,
    totalSize: transfer.totalSize,
    files: transfer.files.map(f => ({
      id: f.id,
      name: f.name,
      size: f.size,
      type: f.type,
      data: f.data // Storing base64 in Firestore (Limit: 1MB doc size!)
    }))
  };

  const docRef = await addDoc(collection(db, "transfers"), transferPayload);
  return docRef.id;
};

export const getTransfer = async (id: string): Promise<TransferData | undefined> => {
  if (!db) return undefined;
  
  try {
    const docRef = doc(db, "transfers", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as any;
      
      // Reconstruct files with preview URLs from base64 data
      const files: UploadedFile[] = data.files.map((f: any) => ({
        ...f,
        previewUrl: f.type.startsWith('image/') ? f.data : undefined
      }));

      return {
        id: docSnap.id,
        files,
        message: data.message,
        senderEmail: data.senderEmail,
        recipientEmail: data.recipientEmail,
        settings: data.settings,
        createdAt: data.createdAt,
        totalSize: data.totalSize
      };
    } else {
      return undefined;
    }
  } catch (e) {
    console.error("Error fetching transfer", e);
    return undefined;
  }
};

// --- User Management (Auth & Firestore) ---

export const registerUser = async (email: string, password: string): Promise<User> => {
  if (!auth || !db) throw new Error("Firebase not ready");

  const userCredential = await auth.createUserWithEmailAndPassword(email, password);
  const fbUser = userCredential.user;
  
  if (!fbUser) throw new Error("User creation failed");

  const newUser: User = {
    uid: fbUser.uid,
    email: fbUser.email || '',
    name: fbUser.email?.split('@')[0] || 'User',
    plan: 'free', // Default plan
    createdAt: Date.now()
  };

  // Create user profile in Firestore
  await setDoc(doc(db, "users", fbUser.uid), newUser);
  
  return newUser;
};

export const loginUser = async (email: string, password: string): Promise<void> => {
  if (!auth) throw new Error("Firebase not ready");
  await auth.signInWithEmailAndPassword(email, password);
};

export const logoutUser = async () => {
  if (!auth) return;
  await auth.signOut();
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  if (!db) return null;
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as User;
  }
  return null;
};

export const updateUserPlan = async (uid: string, plan: 'free' | 'pro'): Promise<void> => {
  if (!db) return;
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, { plan });
};