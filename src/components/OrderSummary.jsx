import { useState } from 'react'
import { useOrder } from '../hooks/useOrder'
import { addOrder } from '../firebase/orders'

const OrderSummary = ({ onClose }) => {
  const { orderItems, removeFromOrder, updateOrderItem, clearOrder, currentUser } = useOrder()
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleRemoveItem = (itemId) => {
    removeFromOrder(itemId)
  }

  const handleCommentChange = (itemId, comment) => {
    updateOrderItem(itemId, { comment })
  }

  const handleSubmitOrder = async () => {
    if (orderItems.length === 0) return
    
    setSubmitting(true)
    
    try {
      // Submit each drink as separate order
      const promises = orderItems.map(item => addOrder({
        userId: item.userId,
        userName: item.userName,
        drinkId: item.drinkId,
        drinkName: item.drinkName,
        drinkParameters: item.drinkParameters,
        parametersText: item.parametersText,
        comment: item.comment || ''
      }))
      
      await Promise.all(promises)
      
      setSubmitSuccess(true)
      clearOrder()
      
      // Auto close after success
      setTimeout(() => {
        onClose()
      }, 2000)
      
    } catch (error) {
      console.error('Error submitting order:', error)
      alert('Помилка при відправці замовлення. Спробуйте ще раз.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Замовлення відправлено!
          </h2>
          <p className="text-gray-600">
            Ваше замовлення передано бариста. Слідкуйте за статусом на екрані.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Ваше замовлення
              </h2>
              <p className="text-gray-600 mt-1">
                {currentUser?.name} • {orderItems.length} {orderItems.length === 1 ? 'напій' : 'напоїв'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Order Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {orderItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Замовлення порожнє
              </h3>
              <p className="text-gray-500">
                Додайте напої до замовлення перед відправкою
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {orderItems.map((item, index) => (
                <OrderItem
                  key={item.id}
                  item={item}
                  index={index}
                  onRemove={() => handleRemoveItem(item.id)}
                  onCommentChange={(comment) => handleCommentChange(item.id, comment)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {orderItems.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={clearOrder}
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                Очистити все замовлення
              </button>
              <div className="text-lg font-semibold text-gray-900">
                Всього: {orderItems.length} {orderItems.length === 1 ? 'напій' : 'напоїв'}
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="btn-secondary flex-1"
                disabled={submitting}
              >
                Продовжити вибір
              </button>
              <button
                onClick={handleSubmitOrder}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Відправляємо...</span>
                  </>
                ) : (
                  <>
                    <span>Відправити замовлення</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const OrderItem = ({ item, index, onRemove, onCommentChange }) => {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {index + 1}. {item.drinkName}
            </h3>
            <button
              onClick={onRemove}
              className="text-red-500 hover:text-red-700 ml-4"
              title="Видалити з замовлення"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {item.parametersText && (
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Параметри:</span> {item.parametersText}
            </p>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Коментар до напою (опціонально)
            </label>
            <textarea
              value={item.comment || ''}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Додайте коментар..."
              rows="2"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary