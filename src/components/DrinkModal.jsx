import { useState } from 'react'
import { useOrder } from '../hooks/useOrder'

const DrinkModal = ({ drink, onClose }) => {
  const { addToOrder } = useOrder()
  const [selectedParameters, setSelectedParameters] = useState({})
  const [comment, setComment] = useState('')
  const [errors, setErrors] = useState({})

  // Initialize parameters with default values
  useState(() => {
    const defaults = {}
    drink.parameters?.forEach(param => {
      if (param.options) {
        const defaultOption = param.options.find(opt => opt.default)
        if (defaultOption) {
          defaults[param.id] = defaultOption.value
        }
      } else if (param.type === 'boolean') {
        defaults[param.id] = param.default || false
      }
    })
    setSelectedParameters(defaults)
  }, [drink])

  const handleParameterChange = (paramId, value) => {
    setSelectedParameters(prev => ({
      ...prev,
      [paramId]: value
    }))
    // Clear error when user makes selection
    if (errors[paramId]) {
      setErrors(prev => ({ ...prev, [paramId]: null }))
    }
  }

  const validateParameters = () => {
    const newErrors = {}
    
    drink.parameters?.forEach(param => {
      if (param.required && !selectedParameters[param.id]) {
        newErrors[param.id] = `${param.name} є обов'язковим`
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddToOrder = () => {
    if (validateParameters()) {
      addToOrder(drink, selectedParameters, comment)
      onClose()
    }
  }

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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {drink.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mt-2">{drink.description}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Highlights Grid */}
          {drink.highlights && Object.keys(drink.highlights).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Характеристики</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(drink.highlights).map(([key, value]) => (
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
            </div>
          )}

          {/* Ingredients */}
          {drink.ingredients && drink.ingredients.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Інгредієнти</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-1">
                  {drink.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mr-3 flex-shrink-0"></span>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Parameters */}
          {drink.parameters && drink.parameters.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Налаштування</h3>
              <div className="space-y-4">
                {drink.parameters.map((param) => (
                  <ParameterInput
                    key={param.id}
                    parameter={param}
                    value={selectedParameters[param.id]}
                    onChange={(value) => handleParameterChange(param.id, value)}
                    error={errors[param.id]}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Comment */}
          <div className="space-y-3">
            <label className="text-lg font-semibold text-gray-900 block">
              Коментар (опціонально)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Додайте коментар до замовлення..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Скасувати
            </button>
            <button
              onClick={handleAddToOrder}
              className="btn-primary flex-1"
            >
              Додати до замовлення
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const ParameterInput = ({ parameter, value, onChange, error }) => {
  if (parameter.type === 'select') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {parameter.name}
          {parameter.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        >
          {!parameter.required && (
            <option value="">Оберіть опцію</option>
          )}
          {parameter.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    )
  }

  if (parameter.type === 'boolean') {
    return (
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id={parameter.id}
          checked={value || false}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
        />
        <label htmlFor={parameter.id} className="text-sm font-medium text-gray-700">
          {parameter.label || parameter.name}
        </label>
      </div>
    )
  }

  return null
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

export default DrinkModal