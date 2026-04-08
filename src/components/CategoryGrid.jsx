import { useMenu } from '../hooks/useMenu'

const CategoryGrid = ({ onCategorySelect }) => {
  const { categories } = useMenu()

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
        Оберіть категорію
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category)}
            className="card hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center p-8 group"
          >
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-200">
              {category.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {category.name}
            </h3>
            <p className="text-gray-600 text-sm">
              {category.drinks?.length || 0} напоїв
            </p>
            
            {/* Subcategories preview */}
            {category.subcategories && category.subcategories.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap justify-center gap-2">
                  {category.subcategories.slice(0, 3).map((sub) => (
                    <span 
                      key={sub.id}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                    >
                      {sub.name}
                    </span>
                  ))}
                  {category.subcategories.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{category.subcategories.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategoryGrid