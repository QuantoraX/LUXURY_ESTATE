import React from 'react'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../hooks/useAuth'
import PropertyCard from '../components/Properties/PropertyCard'
import { Link } from 'react-router-dom'
import { FaHeart } from 'react-icons/fa'

export default function Wishlist() {
  const { wishlist, loading } = useWishlist()
  const { user } = useAuth()

  // Calculate statistics
  const totalProperties = wishlist.length
  const totalValue = wishlist.reduce((sum, item) => sum + (item.price || 0), 0)
  const averagePrice = totalProperties > 0 ? Math.round(totalValue / totalProperties) : 0
  const totalArea = wishlist.reduce((sum, item) => sum + (item.area || 0), 0)
  const avgPricePerSqft = totalArea > 0 ? Math.round(totalValue / totalArea) : 0

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
        <p className="text-slate-400 font-medium text-sm">Retrieving saved estates...</p>
      </div>
    )
  }

  // If user is not logged in, prompt to log in
  if (!user) {
    return (
      <div className="space-y-10 py-6 max-w-xl mx-auto">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-gold uppercase tracking-widest bg-gold/10 px-4 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <FaHeart className="text-[10px]" /> Private Collection
          </span>
          <h1 className="text-4xl font-serif font-bold text-luxury mt-2">Saved Properties</h1>
        </div>
        <div className="text-center py-16 bg-white border border-slate-200 rounded-[32px] p-8 shadow-soft relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -mr-8 -mt-8"></div>
          <div className="w-16 h-16 rounded-full bg-gold/10 text-gold flex items-center justify-center text-2xl shrink-0 mx-auto mb-6">
            <FaHeart />
          </div>
          <h3 className="text-xl font-bold text-luxury">Access Your Curated Portfolio</h3>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-sm mx-auto">
            Log in or sign up to view and manage your handpicked selection of premium architectural masterpieces.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Link to="/login" className="bg-gold hover:bg-yellow-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-md">
              Sign In
            </Link>
            <Link to="/register" className="border border-luxury text-luxury hover:bg-luxury hover:text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300">
              Register
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 py-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-gold uppercase tracking-widest bg-gold/10 px-4 py-1.5 rounded-full inline-flex items-center gap-1.5">
          <FaHeart className="text-[10px]" /> Collection
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-luxury mt-2">Saved Properties</h1>
        <p className="text-slate-500 text-sm font-medium">
          Manage your handpicked selection of premium architectural masterpieces.
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-[32px] p-8 shadow-soft max-w-xl mx-auto">
          <p className="text-slate-500 font-medium">Your wishlist is currently empty.</p>
          <p className="text-slate-400 text-xs mt-1">Explore our exclusive collections and save your favorite listings.</p>
          <Link to="/properties" className="inline-block mt-6 bg-gold hover:bg-yellow-600 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors shadow-sm">
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Analytics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Count */}
            <div className="group rounded-[32px] border border-white bg-white/70 backdrop-blur-md p-6 shadow-soft hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gold/5 rounded-full -mr-4 -mt-4 group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center text-xl shrink-0">
                  <FaHeart />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Saved Estates</p>
                  <h3 className="text-2xl font-bold text-luxury mt-1">{totalProperties}</h3>
                </div>
              </div>
            </div>

            {/* Card 2: Total Value */}
            <div className="group rounded-[32px] border border-white bg-white/70 backdrop-blur-md p-6 shadow-soft hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full -mr-4 -mt-4 group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-serif font-bold shrink-0">
                  $
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Portfolio Value</p>
                  <h3 className="text-2xl font-bold text-luxury mt-1">${totalValue.toLocaleString()}</h3>
                </div>
              </div>
            </div>

            {/* Card 3: Avg Price */}
            <div className="group rounded-[32px] border border-white bg-white/70 backdrop-blur-md p-6 shadow-soft hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-4 -mt-4 group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
                  Avg
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Average Price</p>
                  <h3 className="text-2xl font-bold text-luxury mt-1">${averagePrice.toLocaleString()}</h3>
                </div>
              </div>
            </div>

            {/* Card 4: Price/SqFt */}
            <div className="group rounded-[32px] border border-white bg-white/70 backdrop-blur-md p-6 shadow-soft hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full -mr-4 -mt-4 group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                  $/ft²
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Price / Sq Ft</p>
                  <h3 className="text-2xl font-bold text-luxury mt-1">${avgPricePerSqft.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlist.map((property) => (
              <PropertyCard key={property._id || property.id} property={property} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
