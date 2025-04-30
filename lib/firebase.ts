// lib/firebase.ts
import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// BACKEND INTEGRATION POINT 1: Firebase Configuration
// Replace these environment variables with your actual Firebase project details
// You can find these in your Firebase project settings
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
// This creates the connection to your Firebase backend
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// BACKEND INTEGRATION POINT 2: Firebase Services
// These are the main Firebase services you'll use in your app:
// - auth: For user authentication (login, signup, etc.)
// - db: For database operations (storing and retrieving room data)
// - storage: For file storage (room images)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { app, auth, db, storage }
