import { createContext, useContext, useState, useCallback } from 'react'

const OrderContext = createContext()

export const useOrder = () => {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider')
  }
  return context
}

export const OrderProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [orderItems, setOrderItems] = useState([])

  const selectUser = useCallback((user) => {
    setCurrentUser(user)
    // Clear previous orders when switching users
    setOrderItems([])
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