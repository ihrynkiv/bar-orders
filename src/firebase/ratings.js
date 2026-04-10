import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from './config'

const RATINGS_COLLECTION = 'ratings'

// Add a new rating
export const addRating = async (drinkId, userId, userName, rating, comment = '') => {
  try {
    const ratingData = {
      drinkId,
      userId,
      userName,
      rating: Number(rating), // 1-5 stars
      comment: comment.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, RATINGS_COLLECTION), ratingData)
    return docRef.id
  } catch (error) {
    console.error('Error adding rating:', error)
    throw error
  }
}

// Get ratings for a specific drink
export const getDrinkRatings = async (drinkId) => {
  try {
    // Use simple query without compound index requirements
    const q = query(collection(db, RATINGS_COLLECTION))
    
    const querySnapshot = await getDocs(q)
    const ratings = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      // Filter on client side to avoid compound index
      if (data.drinkId === drinkId) {
        ratings.push({ id: doc.id, ...data })
      }
    })
    
    // Sort on client side
    ratings.sort((a, b) => {
      const timeA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0)
      const timeB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0)
      return timeB - timeA // Descending order (newest first)
    })
    
    return ratings
  } catch (error) {
    console.error('Error getting drink ratings:', error)
    throw error
  }
}

// Subscribe to ratings for a specific drink
export const subscribeToRatings = (drinkId, callback) => {
  // Use simple query without compound index requirements
  const q = query(collection(db, RATINGS_COLLECTION))
  
  return onSnapshot(q, (snapshot) => {
    const ratings = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      // Filter on client side to avoid compound index
      if (data.drinkId === drinkId) {
        ratings.push({ 
          id: doc.id, 
          ...data,
          // Ensure createdAt is properly formatted
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null
        })
      }
    })
    
    // Sort on client side
    ratings.sort((a, b) => {
      const timeA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0)
      const timeB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0)
      return timeB - timeA // Descending order (newest first)
    })
    
    callback(ratings)
  })
}

// Calculate average rating and total count for a drink
export const getDrinkRatingStats = async (drinkId) => {
  try {
    const ratings = await getDrinkRatings(drinkId)
    
    if (ratings.length === 0) {
      return { averageRating: 0, totalRatings: 0 }
    }
    
    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0)
    const averageRating = totalRating / ratings.length
    
    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalRatings: ratings.length
    }
  } catch (error) {
    console.error('Error calculating rating stats:', error)
    return { averageRating: 0, totalRatings: 0 }
  }
}

// Get all ratings with stats for multiple drinks (for displaying on cards)
export const getMultipleDrinksStats = async (drinkIds) => {
  try {
    const statsPromises = drinkIds.map(async (drinkId) => {
      const stats = await getDrinkRatingStats(drinkId)
      return { drinkId, ...stats }
    })
    
    const results = await Promise.all(statsPromises)
    
    // Convert to object with drinkId as key
    const statsMap = {}
    results.forEach(({ drinkId, averageRating, totalRatings }) => {
      statsMap[drinkId] = { averageRating, totalRatings }
    })
    
    return statsMap
  } catch (error) {
    console.error('Error getting multiple drink stats:', error)
    return {}
  }
}

// Check if user has already rated a drink
export const getUserRatingForDrink = async (drinkId, userId) => {
  try {
    // Use simple query without compound index requirements
    const q = query(collection(db, RATINGS_COLLECTION))
    
    const querySnapshot = await getDocs(q)
    
    // Filter on client side to avoid compound index
    let userRating = null
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.drinkId === drinkId && data.userId === userId) {
        userRating = { id: doc.id, ...data }
      }
    })
    
    return userRating
  } catch (error) {
    console.error('Error getting user rating:', error)
    return null
  }
}