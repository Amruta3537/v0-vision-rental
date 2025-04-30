// lib/room-service.ts
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  setDoc,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "./firebase"
import { getCurrentUser } from "./auth-service"

// BACKEND INTEGRATION POINT 4: Database Collection
// This is the name of the collection in Firestore where room data will be stored
const ROOMS_COLLECTION = "rooms"

// Room data interface
export interface RoomData {
  id?: string
  title: string
  rent: string
  deposit: string
  description: string
  images: string[]
  location: string
  amenities: string[]
  featured?: boolean
  rating?: number
  reviews?: number
  owner?: string
  ownerName?: string
  createdAt?: any
  updatedAt?: any
}

// BACKEND INTEGRATION POINT 5: Create Operation
// Add a new room to the database
export async function addRoom(roomData: RoomData) {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    // Prepare room data with metadata
    const roomWithMetadata = {
      ...roomData,
      owner: user.uid,
      ownerName: user.displayName || "Anonymous",
      createdAt: serverTimestamp(), // BACKEND API: Uses server timestamp for consistent timing
      updatedAt: serverTimestamp(),
    }

    // BACKEND API CALL: Adds a new document to the rooms collection
    const docRef = await addDoc(collection(db, ROOMS_COLLECTION), roomWithMetadata)
    return { id: docRef.id, ...roomWithMetadata }
  } catch (error) {
    console.error("Error adding room:", error)
    throw error
  }
}

// BACKEND INTEGRATION POINT 6: Update Operation
// Update an existing room in the database
export async function updateRoom(id: string, roomData: Partial<RoomData>) {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    // BACKEND API CALL: Get reference to the room document
    const roomRef = doc(db, ROOMS_COLLECTION, id)
    const roomSnap = await getDoc(roomRef)

    // Check if room exists and user is authorized
    if (!roomSnap.exists()) throw new Error("Room not found")
    if (roomSnap.data().owner !== user.uid) throw new Error("Not authorized to update this room")

    // BACKEND API CALL: Update the room document
    await updateDoc(roomRef, {
      ...roomData,
      updatedAt: serverTimestamp(),
    })

    return { id, ...roomData }
  } catch (error) {
    console.error("Error updating room:", error)
    throw error
  }
}

// BACKEND INTEGRATION POINT 7: Delete Operation
// Delete a room from the database
export async function deleteRoom(id: string) {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    // BACKEND API CALL: Get reference to the room document
    const roomRef = doc(db, ROOMS_COLLECTION, id)
    const roomSnap = await getDoc(roomRef)

    // Check if room exists and user is authorized
    if (!roomSnap.exists()) throw new Error("Room not found")
    if (roomSnap.data().owner !== user.uid) throw new Error("Not authorized to delete this room")

    // BACKEND API CALL: Delete the room document
    await deleteDoc(roomRef)
    return { success: true }
  } catch (error) {
    console.error("Error deleting room:", error)
    throw error
  }
}

// BACKEND INTEGRATION POINT 8: Read Operation - Get All
// Get all rooms from the database
export async function getAllRooms() {
  try {
    // BACKEND API CALL: Create a query to get all rooms ordered by creation date
    const roomsQuery = query(collection(db, ROOMS_COLLECTION), orderBy("createdAt", "desc"))

    // BACKEND API CALL: Execute the query
    const querySnapshot = await getDocs(roomsQuery)
    const rooms: RoomData[] = []

    // Process the query results
    querySnapshot.forEach((doc) => {
      rooms.push({ id: doc.id, ...doc.data() } as RoomData)
    })

    return rooms
  } catch (error) {
    console.error("Error getting rooms:", error)
    throw error
  }
}

// BACKEND INTEGRATION POINT 9: Read Operation - Get One
// Get a single room by ID
export async function getRoomById(id: string) {
  try {
    // BACKEND API CALL: Get reference to the room document
    const roomRef = doc(db, ROOMS_COLLECTION, id)

    // BACKEND API CALL: Get the room document
    const roomSnap = await getDoc(roomRef)

    if (!roomSnap.exists()) throw new Error("Room not found")

    return { id: roomSnap.id, ...roomSnap.data() } as RoomData
  } catch (error) {
    console.error("Error getting room:", error)
    throw error
  }
}

// BACKEND INTEGRATION POINT 10: Read Operation - Get By Owner
// Get rooms by owner
export async function getRoomsByOwner() {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    // BACKEND API CALL: Create a query to get rooms by owner
    const roomsQuery = query(
      collection(db, ROOMS_COLLECTION),
      where("owner", "==", user.uid),
      orderBy("createdAt", "desc"),
    )

    // BACKEND API CALL: Execute the query
    const querySnapshot = await getDocs(roomsQuery)
    const rooms: RoomData[] = []

    // Process the query results
    querySnapshot.forEach((doc) => {
      rooms.push({ id: doc.id, ...doc.data() } as RoomData)
    })

    return rooms
  } catch (error) {
    console.error("Error getting rooms by owner:", error)
    throw error
  }
}

// BACKEND INTEGRATION POINT 11: File Upload
// Upload room image to Firebase Storage
export async function uploadRoomImage(file: File) {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    // BACKEND API CALL: Create a reference to the file location in Firebase Storage
    const fileRef = ref(storage, `rooms/${user.uid}/${Date.now()}_${file.name}`)

    // BACKEND API CALL: Upload the file to Firebase Storage
    await uploadBytes(fileRef, file)

    // BACKEND API CALL: Get the download URL for the uploaded file
    const downloadURL = await getDownloadURL(fileRef)

    return downloadURL
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}

// BACKEND INTEGRATION POINT 12: Favorites - Add
// Add a favorite room for a user
export async function addFavorite(roomId: string) {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    // BACKEND API CALL: Create a reference to the favorite document
    // We use a composite ID (userId_roomId) to ensure uniqueness
    const favoriteRef = doc(db, "favorites", `${user.uid}_${roomId}`)

    // BACKEND API CALL: Create or update the favorite document
    await setDoc(favoriteRef, {
      userId: user.uid,
      roomId: roomId,
      createdAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error adding favorite:", error)
    throw error
  }
}

// BACKEND INTEGRATION POINT 13: Favorites - Remove
// Remove a favorite room for a user
export async function removeFavorite(roomId: string) {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    // BACKEND API CALL: Create a reference to the favorite document
    const favoriteRef = doc(db, "favorites", `${user.uid}_${roomId}`)

    // BACKEND API CALL: Delete the favorite document
    await deleteDoc(favoriteRef)

    return { success: true }
  } catch (error) {
    console.error("Error removing favorite:", error)
    throw error
  }
}

// BACKEND INTEGRATION POINT 14: Favorites - Get
// Get all favorite rooms for a user
export async function getFavorites() {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    // BACKEND API CALL: Create a query to get favorites by user
    const favoritesQuery = query(collection(db, "favorites"), where("userId", "==", user.uid))

    // BACKEND API CALL: Execute the query
    const querySnapshot = await getDocs(favoritesQuery)
    const favoriteIds: string[] = []

    // Process the query results to get room IDs
    querySnapshot.forEach((doc) => {
      favoriteIds.push(doc.data().roomId)
    })

    // Get the actual room data for each favorite
    const rooms: RoomData[] = []

    for (const id of favoriteIds) {
      try {
        const room = await getRoomById(id)
        rooms.push(room)
      } catch (error) {
        console.warn(`Favorite room ${id} not found, may have been deleted`)
      }
    }

    return rooms
  } catch (error) {
    console.error("Error getting favorites:", error)
    throw error
  }
}

// BACKEND INTEGRATION POINT 15: Reviews
// Add a review for a room
export async function addReview(roomId: string, rating: number, comment: string) {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    // BACKEND API CALL: Create a reference to the review document
    const reviewRef = doc(db, "reviews", `${user.uid}_${roomId}`)

    // BACKEND API CALL: Create or update the review document
    await setDoc(reviewRef, {
      userId: user.uid,
      roomId: roomId,
      userName: user.displayName || "Anonymous",
      rating: rating,
      comment: comment,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    // Update the room's average rating
    await updateRoomRating(roomId)

    return { success: true }
  } catch (error) {
    console.error("Error adding review:", error)
    throw error
  }
}

// Helper function to update a room's average rating
async function updateRoomRating(roomId: string) {
  try {
    // BACKEND API CALL: Create a query to get all reviews for a room
    const reviewsQuery = query(collection(db, "reviews"), where("roomId", "==", roomId))

    // BACKEND API CALL: Execute the query
    const querySnapshot = await getDocs(reviewsQuery)
    let totalRating = 0
    let reviewCount = 0

    // Calculate the average rating
    querySnapshot.forEach((doc) => {
      totalRating += doc.data().rating
      reviewCount++
    })

    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0

    // BACKEND API CALL: Update the room document with the new rating
    const roomRef = doc(db, ROOMS_COLLECTION, roomId)
    await updateDoc(roomRef, {
      rating: Number.parseFloat(averageRating.toFixed(1)),
      reviews: reviewCount,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating room rating:", error)
    throw error
  }
}
