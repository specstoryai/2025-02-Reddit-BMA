import { useState } from 'react'
import { SearchForm } from './components/SearchForm'
import { RestaurantResults } from './components/RestaurantResults'
import { Restaurant, SearchParams } from './types/search'
import axios from 'axios'
import './App.css'

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false // Important for CORS
})

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [error, setError] = useState<string>('')

  const handleSearch = async (params: SearchParams) => {
    try {
      setIsLoading(true)
      setError('')
      const response = await api.post('/api/search', params)
      setRestaurants(response.data)
    } catch (err) {
      setError('Failed to fetch restaurants. Please try again.')
      console.error('Search error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Choose My Dinner</h1>
          <p className="mt-2 text-muted-foreground">
            Let us help you decide where to eat tonight!
          </p>
        </div>

        <div className="flex justify-center">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {error && (
          <div className="text-center text-red-500 font-medium">{error}</div>
        )}

        <RestaurantResults restaurants={restaurants} />
      </div>
    </div>
  )
}

export default App
