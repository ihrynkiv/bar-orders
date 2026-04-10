import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getMultipleDrinksStats } from '../firebase/ratings'

const RatingsContext = createContext()

export const useRatings = () => {
  const context = useContext(RatingsContext)
  if (!context) {
    throw new Error('useRatings must be used within a RatingsProvider')
  }
  return context
}

export const RatingsProvider = ({ children }) => {
  const [ratingsStats, setRatingsStats] = useState({}) // { drinkId: { averageRating, totalRatings } }
  const [loading, setLoading] = useState(false)

  // Load ratings stats for multiple drinks
  const loadRatingsStats = useCallback(async (drinkIds) => {
    if (!drinkIds || drinkIds.length === 0) return

    setLoading(true)
    try {
      const stats = await getMultipleDrinksStats(drinkIds)
      setRatingsStats(prev => ({ ...prev, ...stats }))
    } catch (error) {
      console.error('Error loading ratings stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Get rating stats for a specific drink
  const getRatingStats = useCallback((drinkId) => {
    return ratingsStats[drinkId] || { averageRating: 0, totalRatings: 0 }
  }, [ratingsStats])

  // Update stats for a specific drink (after new rating is submitted)
  const updateDrinkStats = useCallback((drinkId, newStats) => {
    setRatingsStats(prev => ({
      ...prev,
      [drinkId]: newStats
    }))
  }, [])

  // Check if a drink has ratings
  const hasRatings = useCallback((drinkId) => {
    const stats = ratingsStats[drinkId]
    return stats && stats.totalRatings > 0
  }, [ratingsStats])

  const value = {
    ratingsStats,
    loading,
    loadRatingsStats,
    getRatingStats,
    updateDrinkStats,
    hasRatings
  }

  return (
    <RatingsContext.Provider value={value}>
      {children}
    </RatingsContext.Provider>
  )
}