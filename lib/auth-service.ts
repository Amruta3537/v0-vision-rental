// lib/auth-service.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth"
import { auth } from "./firebase"

// BACKEND INTEGRATION POINT 3: User Authentication
// These functions handle all user authentication operations
// They communicate directly with Firebase Authentication

// Sign up a new user
export async function signUp(email: string, password: string, name: string) {
  try {
    // BACKEND API CALL: Creates a new user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    // BACKEND API CALL: Updates the user's profile with their name
    await updateProfile(userCredential.user, { displayName: name })

    return userCredential.user
  } catch (error) {
    console.error("Error signing up:", error)
    throw error
  }
}

// Sign in an existing user
export async function signIn(email: string, password: string) {
  try {
    // BACKEND API CALL: Authenticates a user with email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error("Error signing in:", error)
    throw error
  }
}

// Sign in as a guest (anonymous authentication)
export async function signInAsGuest() {
  try {
    // BACKEND API CALL: Creates an anonymous user in Firebase
    const userCredential = await signInAnonymously(auth)

    // BACKEND API CALL: Sets a display name for the guest user
    await updateProfile(userCredential.user, {
      displayName: `Guest ${Math.floor(Math.random() * 10000)}`,
    })

    return userCredential.user
  } catch (error) {
    console.error("Error signing in as guest:", error)
    throw error
  }
}

// Sign out the current user
export async function signOut() {
  try {
    // BACKEND API CALL: Signs out the current user
    await firebaseSignOut(auth)
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

// Get the currently authenticated user
export function getCurrentUser(): User | null {
  // BACKEND API CALL: Gets the current user from Firebase Authentication
  return auth.currentUser
}
