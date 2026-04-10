import { useMenu } from '../hooks/useMenu'
import { useRatings } from '../hooks/useRatings'
import { useEffect } from 'react'
import StarRating from './StarRating'

const DrinksList = ({ category, selectedSubcategory, onSubcategoryChange, onDrinkSelect }) => {
  const { getDrinksByCategory } = useMenu()
  const { loadRatingsStats } = useRatings()
  
  const drinks = getDrinksByCategory(category.id, selectedSubcategory)

  // Load ratings stats when drinks change
  useEffect(() => {
    if (drinks && drinks.length > 0) {
      const drinkIds = drinks.map(drink => drink.id)
      loadRatingsStats(drinkIds)
    }
  }, [drinks, loadRatingsStats])
  
  const getHighlightColor = (key) => {
    const colorMap = {
      'flavor': 'blue',
      'origin': 'green', 
      'caffeine': 'amber',
      'alcohol_content': 'red',
      'taste_profile': 'purple',
      'strength': 'orange'
    }
    return colorMap[key] || 'gray'
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Category Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <span className="text-4xl mr-4">{category.icon}</span>
          {category.name}
        </h2>
        <p className="text-gray-600">
          Оберіть напій зі списку нижче
        </p>
      </div>

      {/* Subcategory Filter */}
      {category.subcategories && category.subcategories.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onSubcategoryChange(null)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                !selectedSubcategory 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Всі
            </button>
            {category.subcategories.map((subcategory) => (
              <button
                key={subcategory.id}
                onClick={() => onSubcategoryChange(subcategory.id)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedSubcategory === subcategory.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {subcategory.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Drinks Grid */}
      {drinks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😕</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Нічого не знайдено
          </h3>
          <p className="text-gray-500">
            Спробуйте вибрати іншу підкатегорію
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drinks.map((drink) => (
            <DrinkCard 
              key={drink.id} 
              drink={drink} 
              onSelect={onDrinkSelect}
              getHighlightColor={getHighlightColor}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const DrinkCard = ({ drink, onSelect, getHighlightColor }) => {
  const { getRatingStats, hasRatings } = useRatings()
  const topHighlights = Object.entries(drink.highlights || {}).slice(0, 2)
  const ratingStats = getRatingStats(drink.id)

  return (
    <div className="card hover:shadow-lg transition-all duration-200 cursor-pointer group"
         onClick={() => onSelect(drink)}>
      
      {/* Drink Name */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors flex-1">
            {drink.name}
          </h3>
          {hasRatings(drink.id) && (
            <div className="ml-2 flex-shrink-0">
              <StarRating
                rating={ratingStats.averageRating}
                size="sm"
                readonly={true}
                showLabel={false}
              />
            </div>
          )}
        </div>
        <p className="text-gray-600 text-sm line-clamp-2">
          {drink.description}
        </p>
        {hasRatings(drink.id) && (
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              {ratingStats.averageRating.toFixed(1)} ⭐ ({ratingStats.totalRatings} {ratingStats.totalRatings === 1 ? 'оцінка' : 'оцінок'})
            </p>
          </div>
        )}
      </div>

      {/* Top Highlights */}
      {topHighlights.length > 0 && (
        <div className="mb-4 space-y-2">
          {topHighlights.map(([key, value]) => (
            <div key={key} className={`highlight-card ${getHighlightColor(key)}`}>
              <div className="flex-shrink-0">
                <HighlightIcon type={key} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  {getHighlightLabel(key)}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Parameters indicator */}
      {drink.parameters && drink.parameters.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            Налаштування доступні
          </div>
        </div>
      )}

      {/* Click to view button */}
      <div className="mt-auto pt-4 border-t border-gray-100">
        <div className="btn-primary w-full text-center">
          Переглянути деталі
        </div>
      </div>
    </div>
  )
}

const HighlightIcon = ({ type }) => {
  const icons = {
    'flavor': '👅',
    'origin': '🌍', 
    'caffeine': '☕',
    'alcohol_content': '🔥',
    'taste_profile': '🎯',
    'strength': '💪',
    'temperature': '🌡️',
    'antioxidants': '🌿',
    'vitamins': '💊',
    'calories': '⚡'
  }
  
  return (
    <span className="text-lg">
      {icons[type] || '📋'}
    </span>
  )
}

const getHighlightLabel = (key) => {
  const labels = {
    'flavor': 'Смак',
    'origin': 'Походження',
    'caffeine': 'Кофеїн', 
    'alcohol_content': 'Алкоголь',
    'taste_profile': 'Профіль',
    'strength': 'Міцність',
    'temperature': 'Температура',
    'antioxidants': 'Антиоксиданти',
    'vitamins': 'Вітаміни',
    'calories': 'Калорії'
  }
  
  return labels[key] || key
}

export default DrinksList