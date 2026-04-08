import { createContext, useContext, useState, useEffect } from 'react'
import menuData from '../config/menu.json'

const MenuContext = createContext()

export const useMenu = () => {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider')
  }
  return context
}

export const MenuProvider = ({ children }) => {
  const [menu, setMenu] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading menu data
    const loadMenu = async () => {
      try {
        setMenu(menuData)
      } catch (error) {
        console.error('Error loading menu:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMenu()
  }, [])

  const getCategoryById = (categoryId) => {
    return menu?.categories.find(cat => cat.id === categoryId)
  }

  const getDrinkById = (drinkId) => {
    for (const category of menu?.categories || []) {
      const drink = category.drinks.find(d => d.id === drinkId)
      if (drink) return drink
    }
    return null
  }

  const getDrinksByCategory = (categoryId, subcategoryId = null) => {
    const category = getCategoryById(categoryId)
    if (!category) return []
    
    if (subcategoryId) {
      return category.drinks.filter(drink => drink.subcategory === subcategoryId)
    }
    
    return category.drinks
  }

  const value = {
    menu,
    loading,
    getCategoryById,
    getDrinkById,
    getDrinksByCategory,
    users: menu?.users || [],
    categories: menu?.categories || []
  }

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  )
}