import { useState } from 'react'
import { useOrder } from '../hooks/useOrder'
import { submitRating } from '../firebase/ratings'
import StarRating from './StarRating'

const RatingModal = ({ drink, onClose, onRatingSubmitted, existingRating = null }) => {
  const { currentUser } = useOrder()
  const [rating, setRating] = useState(existingRating?.rating || 0)
  const [comment, setComment] = useState(existingRating?.comment || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!currentUser) {
      setError('Потрібно обрати користувача для оцінки')
      return
    }
    
    if (rating === 0) {
      setError('Оберіть оцінку від 1 до 5 зірок')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await submitRating(drink.id, currentUser.id, currentUser.name, rating, comment)
      
      // Notify parent component
      if (onRatingSubmitted) {
        onRatingSubmitted()
      }
      
      onClose()
    } catch (error) {
      console.error('Error submitting rating:', error)
      setError('Помилка при збереженні оцінки. Спробуйте ще раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {existingRating ? 'Змінити оцінку' : 'Оцінити напій'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>

          {/* Drink Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg text-gray-900 mb-1">
              {drink.name}
            </h3>
            <p className="text-sm text-gray-600">
              {drink.description}
            </p>
          </div>

          {/* Rating Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ваша оцінка *
              </label>
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size="xl"
                showLabel={false}
              />
              {rating > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {rating} з 5 зірок
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Коментар (необов'язково)
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Поділіться своїми враженнями про цей напій..."
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                disabled={isSubmitting}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {comment.length}/500
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Скасувати
              </button>
              <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Збереження...' : (existingRating ? 'Оновити оцінку' : 'Надіслати оцінку')}
              </button>
            </div>
          </form>

          {/* User Info */}
          {currentUser && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Оцінка буде збережена як {currentUser.name}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RatingModal