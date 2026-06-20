import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  (config) => {
    const storedUser = window.localStorage.getItem('luxestate-user')
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      if (parsed && parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export const authApi = {
  login: (payload) => axiosInstance.post('/auth/login', payload).then((response) => response.data),
  register: (payload) => axiosInstance.post('/auth/register', payload).then((response) => response.data),
  logout: () => axiosInstance.post('/auth/logout').then((response) => response.data),
  profile: () => axiosInstance.get('/auth/profile').then((response) => response.data),
}

export const propertyApi = {
  getProperties: (params = '') => axiosInstance.get(`/properties${params}`).then((response) => response.data),
  getProperty: (id) => axiosInstance.get(`/properties/${id}`).then((response) => response.data),
  addProperty: (payload) => axiosInstance.post('/properties', payload).then((response) => response.data),
  updateProperty: (id, payload) => axiosInstance.put(`/properties/${id}`, payload).then((response) => response.data),
  deleteProperty: (id) => axiosInstance.delete(`/properties/${id}`).then((response) => response.data),
}

export const userApi = {
  getUsers: () => axiosInstance.get('/users').then((response) => response.data),
  updateUserRole: (id, role) => axiosInstance.put(`/users/${id}`, { role }).then((response) => response.data),
  deleteUser: (id) => axiosInstance.delete(`/users/${id}`).then((response) => response.data),
  getAgents: () => axiosInstance.get('/users/agents').then((response) => response.data),
  getAdmin: () => axiosInstance.get('/users/admin').then((response) => response.data),
  updateProfile: (payload) => axiosInstance.put('/users/me', payload).then((response) => response.data),
  getAgentReviews: (agentId) => axiosInstance.get(`/users/agents/${agentId}/reviews`).then((response) => response.data),
  submitAgentReview: (agentId, payload) => axiosInstance.post(`/users/agents/${agentId}/reviews`, payload).then((response) => response.data),
}

export const contactApi = {
  sendMessage: (payload) => axiosInstance.post('/contact', payload).then((response) => response.data),
  getMessages: () => axiosInstance.get('/contact').then((response) => response.data),
}

export const bookingApi = {
  createBooking: (payload) => axiosInstance.post('/bookings', payload).then((response) => response.data),
  getBookings: () => axiosInstance.get('/bookings').then((response) => response.data),
  updateBookingStatus: (id, status) => axiosInstance.put(`/bookings/${id}`, { status }).then((response) => response.data),
}

export const wishlistApi = {
  getWishlist: () => axiosInstance.get('/wishlist').then((response) => response.data),
  addToWishlist: (propertyId) => axiosInstance.post(`/wishlist/${propertyId}`).then((response) => response.data),
}

export const notificationApi = {
  getNotifications: () => axiosInstance.get('/notifications').then((response) => response.data),
  markAsRead: (id) => axiosInstance.put(`/notifications/${id}/read`).then((response) => response.data),
  markAllAsRead: () => axiosInstance.put('/notifications/read-all').then((response) => response.data),
  deleteNotification: (id) => axiosInstance.delete(`/notifications/${id}`).then((response) => response.data),
  clearAllNotifications: () => axiosInstance.delete('/notifications').then((response) => response.data),
}

export const chatApi = {
  getConversations: () => axiosInstance.get('/chats').then((response) => response.data),
  startConversation: (payload) => axiosInstance.post('/chats', payload).then((response) => response.data),
  getMessages: (chatId) => axiosInstance.get(`/chats/${chatId}/messages`).then((response) => response.data),
  sendMessage: (chatId, text) => axiosInstance.post(`/chats/${chatId}/messages`, { text }).then((response) => response.data),
  deleteConversation: (chatId) => axiosInstance.delete(`/chats/${chatId}`).then((response) => response.data),
}

export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath
  }
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const serverBase = apiBase.replace('/api', '')
  return `${serverBase}${imagePath}`
}

export const uploadImages = (formData) => {
  return axiosInstance.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(response => response.data)
}

export default axiosInstance

// Convenience named exports used across the app
export const fetchProperties = (params) => propertyApi.getProperties(params)
export const fetchProperty = (id) => propertyApi.getProperty(id)

export const loginUser = (payload) => authApi.login(payload)
export const registerUser = (payload) => authApi.register(payload)
export const logoutUser = () => authApi.logout()
export const getProfile = () => authApi.profile()
