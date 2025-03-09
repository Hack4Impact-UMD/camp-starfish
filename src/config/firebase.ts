import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "camp-starfish.firebaseapp.com",
  projectId: "camp-starfish",
  storageBucket: "camp-starfish.firebasestorage.app",
  messagingSenderId: "353349843655",
  appId: "1:353349843655:web:659825cf31b9dcf3e0dce2",
  measurementId: "G-S3K5R4T5K8",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 
export const functions = getFunctions(app, 'us-central1');