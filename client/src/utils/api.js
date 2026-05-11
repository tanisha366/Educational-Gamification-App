import axios from 'axios'
import { mockRegister, mockLogin, mockGetUserStats } from '../mocks/authMock'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
})

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Mock auth interceptor for when backend is unavailable
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (USE_MOCKS && error.config.url?.includes('/api/auth/')) {
      const { url, method, data } = error.config
      const parsedData = JSON.parse(data || '{}')
      
      if (url.includes('/register') && method === 'post') {
        return Promise.resolve(mockRegister(parsedData))
      }
      if (url.includes('/login') && method === 'post') {
        return Promise.resolve(mockLogin(parsedData))
      }
    }
    
    if (USE_MOCKS && error.config.url?.includes('/api/users/me/stats')) {
      return Promise.resolve(mockGetUserStats())
    }
    
    return Promise.reject(error)
  }
)

export default api
