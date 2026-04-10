import { useState, useEffect } from 'react'
import { subscribeToActiveOrders } from '../firebase/orders'

const TVPage = () => {
  const [orders, setOrders] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const unsubscribe = subscribeToActiveOrders((snapshot) => {
      const ordersData = []
      snapshot.forEach((doc) => {
        ordersData.push({ id: doc.id, ...doc.data() })
      })
      setOrders(ordersData)
    })

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      unsubscribe()
      clearInterval(timeInterval)
    }
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'bg-green-500 animate-pulse'
      case 'in_progress': return 'bg-yellow-500'
      case 'new': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ready': return 'ГОТОВО ДО ВИДАЧІ'
      case 'in_progress': return 'В ПРОЦЕСІ'
      case 'new': return 'НОВЕ ЗАМОВЛЕННЯ'
      default: return status.toUpperCase()
    }
  }

  // Sort orders: Ready first, then In Progress, then New
  const sortedOrders = [...orders].sort((a, b) => {
    const statusPriority = { 'ready': 0, 'in_progress': 1, 'new': 2 }
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status]
    }
    // If same status, sort by creation time
    const timeA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0)
    const timeB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0)
    return timeA - timeB
  })

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const groupedOrders = {
    ready: sortedOrders.filter(o => o.status === 'ready'),
    in_progress: sortedOrders.filter(o => o.status === 'in_progress'),
    new: sortedOrders.filter(o => o.status === 'new')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-primary-900 p-8 text-center">
        <h1 className="text-8xl font-bold text-white mb-4">
          🍹 Новосілля у Рокси та Івана! 🎉
        </h1>
        <div className="text-3xl font-mono text-primary-200">
          {currentTime.toLocaleTimeString('uk-UA')} • {currentTime.toLocaleDateString('uk-UA')}
        </div>
      </header>

      {/* Orders Grid */}
      <main className="p-8">
        {sortedOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-8">😴</div>
            <h2 className="text-5xl font-bold text-gray-400 mb-4">
              Немає активних замовлень
            </h2>
            <p className="text-2xl text-gray-500">
              Всі замовлення оброблені!
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Ready Orders - Highest Priority */}
            {groupedOrders.ready.length > 0 && (
              <section>
                <h2 className="text-4xl font-bold text-green-400 mb-6 text-center animate-pulse">
                  🎉 ГОТОВО ДО ВИДАЧІ ({groupedOrders.ready.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {groupedOrders.ready.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      getStatusColor={getStatusColor}
                      getStatusLabel={getStatusLabel}
                      formatTime={formatTime}
                      isReady={true}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* In Progress Orders */}
            {groupedOrders.in_progress.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
                  ⏳ В ПРОЦЕСІ ({groupedOrders.in_progress.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {groupedOrders.in_progress.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      getStatusColor={getStatusColor}
                      getStatusLabel={getStatusLabel}
                      formatTime={formatTime}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* New Orders */}
            {groupedOrders.new.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-blue-400 mb-6 text-center">
                  📋 НОВІ ЗАМОВЛЕННЯ ({groupedOrders.new.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {groupedOrders.new.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      getStatusColor={getStatusColor}
                      getStatusLabel={getStatusLabel}
                      formatTime={formatTime}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

const OrderCard = ({ order, getStatusColor, getStatusLabel, formatTime, isReady = false }) => {
  return (
    <div className={`
      rounded-2xl p-6 border-4 transition-all duration-300 
      ${isReady 
        ? 'bg-green-900 border-green-400 shadow-2xl shadow-green-500/50 animate-bounce' 
        : 'bg-gray-800 border-gray-600'
      }
    `}>
      {/* Status Badge */}
      <div className={`
        text-center py-2 px-4 rounded-full mb-4 font-bold text-sm
        ${getStatusColor(order.status)} text-white
      `}>
        {getStatusLabel(order.status)}
      </div>

      {/* Customer Name - Large */}
      <div className="text-center mb-4">
        <h3 className={`font-bold ${isReady ? 'text-4xl text-green-100' : 'text-2xl text-white'}`}>
          {order.userName}
        </h3>
      </div>

      {/* Drink Name */}
      <div className="text-center mb-3">
        <h4 className={`font-semibold ${isReady ? 'text-2xl text-green-200' : 'text-xl text-gray-100'}`}>
          {order.drinkName}
        </h4>
      </div>

      {/* Parameters */}
      {order.parametersText && (
        <div className="text-center mb-3">
          <p className={`text-sm ${isReady ? 'text-green-300' : 'text-gray-300'}`}>
            {order.parametersText}
          </p>
        </div>
      )}

      {/* Order Time */}
      <div className="text-center">
        <p className={`text-xs font-mono ${isReady ? 'text-green-400' : 'text-gray-500'}`}>
          {formatTime(order.createdAt)}
        </p>
      </div>

      {/* Special indicator for ready orders */}
      {isReady && (
        <div className="text-center mt-3">
          <div className="text-3xl animate-bounce">🔔</div>
        </div>
      )}
    </div>
  )
}

export default TVPage
