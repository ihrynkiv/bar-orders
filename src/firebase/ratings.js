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
    const q = query(
      collection(db, RATINGS_COLLECTION),
      where('drinkId', '==', drinkId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const ratings = []
    
    querySnapshot.forEach((doc) => {
      ratings.push({ id: doc.id, ...doc.data() })
    })
    
    return ratings
  } catch (error) {
    console.error('Error getting drink ratings:', error)
    throw error
  }
}

// Subscribe to ratings for a specific drink
export const subscribeToRatings = (drinkId, callback) => {
  const q = query(
    collection(db, RATINGS_COLLECTION),
    where('drinkId', '==', drinkId),
    orderBy('createdAt', 'desc')
  )
  
  return onSnapshot(q, (snapshot) => {
    const ratings = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      ratings.push({ 
        id: doc.id, 
        ...data,
        // Ensure createdAt is properly formatted
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null
      })
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
    const q = query(
      collection(db, RATINGS_COLLECTION),
      where('drinkId', '==', drinkId),
      where('userId', '==', userId)
    )
    
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }
    
    // Return the first (should be only) rating
    const doc = querySnapshot.docs[0]
    return { id: doc.id, ...doc.data() }
  } catch (error) {
    console.error('Error getting user rating:', error)
    return null
  }
}