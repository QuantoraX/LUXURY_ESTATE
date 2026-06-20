import { createContext, useState, useEffect } from 'react'
import { authApi } from '../services/api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const storedData = window.localStorage.getItem('luxestate-user')
    if (storedData) {
      const parsed = JSON.parse(storedData)
      setUser(parsed.user)
    }
    setAuthLoading(false)
  }, [])

  const login = async (credentials) => {
    const response = await authApi.login(credentials)
    setUser(response.user)
    window.localStorage.setItem('luxestate-user', JSON.stringify(response))
    return response.user
  }

  const register = async (payload) => {
    const response = await authApi.register(payload)
    setUser(response.user)
    window.localStorage.setItem('luxestate-user', JSON.stringify(response))
    return response.user
  }

  const logout = () => {
    setUser(null)
    window.localStorage.removeItem('luxestate-user')
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    const storedData = window.localStorage.getItem('luxestate-user')
    if (storedData) {
      const parsed = JSON.parse(storedData)
      parsed.user = updatedUser
      window.localStorage.setItem('luxestate-user', JSON.stringify(parsed))
    }
  }

  return (
    <AuthContext.Provider value={{ user, authLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
