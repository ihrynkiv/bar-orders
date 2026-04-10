import { useState } from 'react'
import { useMenu } from '../hooks/useMenu'
import { useOrder } from '../hooks/useOrder'
import UserSelector from '../components/UserSelector'
import CategoryGrid from '../components/CategoryGrid'
import DrinksList from '../components/DrinksList'
import OrderSummary from '../components/OrderSummary'
import DrinkModal from '../components/DrinkModal'

const CustomerPage = () => {
  const { loading } = useMenu()
  const { currentUser, orderItems } = useOrder()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)
  const [selectedDrink, setSelectedDrink] = useState(null)
  const [showOrderSummary, setShowOrderSummary] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження меню...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🍹 Новосілля
            </h1>
            <p className="text-gray-600">
              Вітаємо, оберіть себе зі списку, щоб почати замовлення!
            </p>
          </div>
          <UserSelector />
        </div>
      </div>
    )
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
    setSelectedSubcategory(null)
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setSelectedSubcategory(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4" onClick={handleBackToCategories}>
              <h1 className="text-2xl font-bold text-primary-700">
                🍹 Бар меню
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {orderItems.length > 0 && (
                <button
                  onClick={() => setShowOrderSummary(true)}
                  className="relative bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Замовлення
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                    {orderItems.length}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!selectedCategory ? (
          <CategoryGrid onCategorySelect={handleCategorySelect} />
        ) : (
          <DrinksList
            category={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onSubcategoryChange={setSelectedSubcategory}
            onDrinkSelect={setSelectedDrink}
          />
        )}
      </main>

      {/* Modals */}
      {selectedDrink && (
        <DrinkModal
          drink={selectedDrink}
          onClose={() => setSelectedDrink(null)}
        />
      )}

      {showOrderSummary && (
        <OrderSummary onClose={() => setShowOrderSummary(false)} />
      )}
    </div>
  )
}

export default CustomerPage
