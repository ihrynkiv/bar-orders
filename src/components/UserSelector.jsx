import { useMenu } from '../hooks/useMenu'
import { useOrder } from '../hooks/useOrder'

const UserSelector = () => {
  const { users } = useMenu()
  const { selectUser } = useOrder()

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
        Хто замовляє?
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => selectUser(user)}
            className="card hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-center p-6"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {user.name}
            </h3>
          </button>
        ))}
      </div>
      
      <div className="text-center mt-8">
        <p className="text-gray-600 text-sm">
          Натисніть на своє ім'я, щоб почати замовлення
        </p>
      </div>
    </div>
  )
}

export default UserSelector