// This is a mock implementation for the preview environment
// In a real app, this would use actual Firebase functions

export const firebaseSignInAsGuest = async () => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return a mock guest user
  return {
    uid: "guest-" + Math.random().toString(36).substring(2, 9),
    isAnonymous: true,
    displayName: "Guest User",
  }
}

export const firebaseSignOut = async () => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  // No return value needed
}

export const getCurrentUser = () => {
  // Return a mock guest user
  return {
    uid: "guest-" + Math.random().toString(36).substring(2, 9),
    isAnonymous: true,
    displayName: "Guest User",
  }
}
