import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase project configuration
// You can get this from the Firebase Console -> Project Settings
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const db = getFirestore(app);