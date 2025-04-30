"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define the shape of our auth context
interface AuthContextType {
  user: any | null
  loading: boolean
  isGuest: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, name: string) => Promise<any>
  signInAsGuest: () => Promise<any>
  signOut: () => Promise<void>
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock Firebase auth functions for preview environment
const mockSignIn = async (email: string, password: string) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Simple validation
  if (!email || !password) {
    throw new Error("Email and password are required")
  }

  // Return a mock user
  return {
    uid: "mock-uid-123",
    email,
    displayName: email.split("@")[0],
  }
}

const mockSignUp = async (email: string, password: string, name: string) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Simple validation
  if (!email || !password || !name) {
    throw new Error("Email, password, and name are required")
  }

  // Return a mock user
  return {
    uid: "mock-uid-" + Math.random().toString(36).substring(2, 9),
    email,
    displayName: name,
  }
}

const mockSignInAsGuest = async () => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return a mock guest user
  return {
    uid: "guest-" + Math.random().toString(36).substring(2, 9),
    isAnonymous: true,
    displayName: "Guest User",
  }
}

const mockSignOut = async () => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  // No return value needed
}

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  // Check for existing user on mount
  useEffect(() => {
    // Check localStorage for existing user
    try {
      const storedUser = localStorage.getItem("currentUser")
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        setIsGuest(parsedUser.isGuest || false)
      }
    } catch (error) {
      console.error("Error checking for stored user:", error)
    }

    setLoading(false)
  }, [])

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Use mock function for preview environment
      const user = await mockSignIn(email, password)

      // Save user to state and localStorage
      setUser(user)
      setIsGuest(false)
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          ...user,
          isGuest: false,
        }),
      )

      return user
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Sign up function
  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true)
    try {
      // Use mock function for preview environment
      const user = await mockSignUp(email, password, name)

      // Save user to state and localStorage
      setUser(user)
      setIsGuest(false)
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          ...user,
          isGuest: false,
        }),
      )

      return user
    } catch (error) {
      console.error("Sign up error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Sign in as guest function
  const signInAsGuest = async () => {
    setLoading(true)
    try {
      // Use mock function for preview environment
      const guestUser = await mockSignInAsGuest()

      // Save guest user to state and localStorage
      setUser(guestUser)
      setIsGuest(true)
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          ...guestUser,
          isGuest: true,
        }),
      )

      return guestUser
    } catch (error) {
      console.error("Guest sign in error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Sign out function
  const signOut = async () => {
    setLoading(true)
    try {
      // Use mock function for preview environment
      await mockSignOut()

      // Clear user from state and localStorage
      setUser(null)
      setIsGuest(false)
      localStorage.removeItem("currentUser")
    } catch (error) {
      console.error("Sign out error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Create the context value object
  const contextValue: AuthContextType = {
    user,
    loading,
    isGuest,
    signIn,
    signUp,
    signInAsGuest,
    signOut,
  }

  // Provide the context to children
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
