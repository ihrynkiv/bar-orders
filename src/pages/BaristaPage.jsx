import { useState, useEffect } from 'react'
import { subscribeToActiveOrders, updateOrderStatus } from '../firebase/orders'

const BaristaPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToActiveOrders((snapshot) => {
      const ordersData = []
      snapshot.forEach((doc) => {
        ordersData.push({ id: doc.id, ...doc.data() })
      })
      setOrders(ordersData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'ready': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'new': return 'Новий'
      case 'in_progress': return 'В процесі'
      case 'ready': return 'Готовий'
      case 'completed': return 'Завершений'
      default: return status
    }
  }

  const groupedOrders = {
    new: orders.filter(o => o.status === 'new'),
    in_progress: orders.filter(o => o.status === 'in_progress'),
    ready: orders.filter(o => o.status === 'ready')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження замовлень...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-primary-700">
            👨‍🍳 Бариста - Управління замовленнями
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* New Orders */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-blue-700 flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                Нові замовлення ({groupedOrders.new.length})
              </h2>
            </div>
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {groupedOrders.new.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onStatusUpdate={handleStatusUpdate}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                />
              ))}
              {groupedOrders.new.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  Немає нових замовлень
                </p>
              )}
            </div>
          </div>

          {/* In Progress Orders */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-yellow-700 flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                В процесі ({groupedOrders.in_progress.length})
              </h2>
            </div>
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {groupedOrders.in_progress.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onStatusUpdate={handleStatusUpdate}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                />
              ))}
              {groupedOrders.in_progress.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  Немає замовлень в процесі
                </p>
              )}
            </div>
          </div>

          {/* Ready Orders */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-green-700 flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                Готові ({groupedOrders.ready.length})
              </h2>
            </div>
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {groupedOrders.ready.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onStatusUpdate={handleStatusUpdate}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                />
              ))}
              {groupedOrders.ready.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  Немає готових замовлень
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

const OrderCard = ({ order, onStatusUpdate, getStatusColor, getStatusLabel }) => {
  const nextStatusMap = {
    'new': 'in_progress',
    'in_progress': 'ready', 
    'ready': 'completed'
  }

  const nextStatusLabel = {
    'new': 'Почати',
    'in_progress': 'Готово',
    'ready': 'Видано'
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString('uk-UA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">{order.drinkName}</h3>
          <p className="text-gray-600 text-sm">
            {order.userName} • {formatTime(order.createdAt)}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {getStatusLabel(order.status)}
        </span>
      </div>
      
      {order.parametersText && (
        <p className="text-sm text-gray-700 mb-2">
          <span className="font-medium">Параметри:</span> {order.parametersText}
        </p>
      )}
      
      {order.comment && (
        <p className="text-sm text-gray-700 mb-4">
          <span className="font-medium">Коментар:</span> {order.comment}
        </p>
      )}
      
      {nextStatusMap[order.status] && (
        <button
          onClick={() => onStatusUpdate(order.id, nextStatusMap[order.status])}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          {nextStatusLabel[order.status]}
        </button>
      )}
    </div>
  )
}

export default BaristaPage