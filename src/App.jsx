import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { OrderProvider } from './hooks/useOrder'
import { MenuProvider } from './hooks/useMenu'
import { RatingsProvider } from './hooks/useRatings'
import CustomerPage from './pages/CustomerPage'
import BaristaPage from './pages/BaristaPage'
import TVPage from './pages/TVPage'

function App() {
  return (
    <MenuProvider>
      <OrderProvider>
        <RatingsProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/" element={<CustomerPage />} />
                <Route path="/orders-barista" element={<BaristaPage />} />
                <Route path="/orders-tv" element={<TVPage />} />
              </Routes>
            </div>
          </Router>
        </RatingsProvider>
      </OrderProvider>
    </MenuProvider>
  )
}

export default App