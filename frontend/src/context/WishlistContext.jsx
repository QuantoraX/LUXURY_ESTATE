import React, { createContext, useContext, useState, useEffect } from 'react'
import { wishlistApi } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const WishlistContext = createContext()

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(false)

  const loadWishlist = async () => {
    if (!user) {
      setWishlist([])
      return
    }
    try {
      setLoading(true)
      const res = await wishlistApi.getWishlist()
      const data = (res?.data || []).filter(p => p !== null && p !== undefined)
      setWishlist(data)
    } catch (error) {
      console.error('Failed to load wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWishlist()
  }, [user])

  const toggleWishlist = async (propertyId) => {
    if (!user) {
      toast.error('Please log in to save properties.')
      return
    }
    const isExist = wishlist.some(p => (p?._id || p?.id) === propertyId)
    try {
      if (isExist) {
        await wishlistApi.removeFromWishlist(propertyId)
        setWishlist(prev => prev.filter(p => p && (p._id || p.id) !== propertyId))
        toast.success('Removed from wishlist')
      } else {
        await wishlistApi.addToWishlist(propertyId)
        const res = await wishlistApi.getWishlist()
        const data = (res?.data || []).filter(p => p !== null && p !== undefined)
        setWishlist(data)
        toast.success('Added to wishlist')
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error)
      toast.error('Failed to update wishlist')
    }
  }

  const isInWishlist = (propertyId) => {
    return wishlist.some(p => (p._id || p.id) === propertyId)
  }

  return (
    <WishlistContext.Provider value={{ wishlist, loading, toggleWishlist, isInWishlist, refreshWishlist: loadWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
