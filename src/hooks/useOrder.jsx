import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const OrderContext = createContext()

export const useOrder = () => {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider')
  }
  return context
}

const STORAGE_KEY = 'bar-order-user'

export const OrderProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [orderItems, setOrderItems] = useState([])

  // Load user from localStorage on component mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY)
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        setCurrentUser(userData)
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error)
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const selectUser = useCallback((user) => {
    setCurrentUser(user)
    // Clear previous orders when switching users
    setOrderItems([])
    
    // Save user to localStorage or clear if null
    if (user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      } catch (error) {
        console.error('Error saving user to localStorage:', error)
      }
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const addToOrder = useCallback((drink, parameters = {}, comment = '') => {
    const newItem = {
      id: Date.now() + Math.random(), // temporary ID
      drinkId: drink.id,
      drinkName: drink.name,
      drinkParameters: parameters,
      parametersText: formatParameters(parameters, drink),
      comment,
      userId: currentUser?.id,
      userName: currentUser?.name,
      timestamp: new Date().toISOString()
    }
    
    setOrderItems(prev => [...prev, newItem])
  }, [currentUser])

  const removeFromOrder = useCallback((itemId) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId))
  }, [])

  const updateOrderItem = useCallback((itemId, updates) => {
    setOrderItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    )
  }, [])

  const clearOrder = useCallback(() => {
    setOrderItems([])
  }, [])

  const formatParameters = (parameters, drink) => {
    const paramTexts = []
    
    for (const [key, value] of Object.entries(parameters)) {
      const param = drink.parameters?.find(p => p.id === key)
      if (param) {
        if (param.type === 'select') {
          const option = param.options.find(opt => opt.value === value)
          if (option) {
            paramTexts.push(option.label)
          }
        } else if (param.type === 'boolean' && value) {
          paramTexts.push(param.label)
        }
      }
    }
    
    return paramTexts.join(', ')
  }

  const getOrderTotal = useCallback(() => {
    return orderItems.length
  }, [orderItems])

  const value = {
    currentUser,
    orderItems,
    selectUser,
    addToOrder,
    removeFromOrder,
    updateOrderItem,
    clearOrder,
    getOrderTotal
  }

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  )
}