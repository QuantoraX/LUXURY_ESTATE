import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaHeart, FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaExchangeAlt } from 'react-icons/fa'
import { getImageUrl } from '../../services/api'
import { useWishlist } from '../../context/WishlistContext'
import { useCompare } from '../../context/CompareContext'
import { useCurrency } from '../../context/CurrencyContext'

const PropertyCard = ({ property }) => {
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { addToCompare, removeFromCompare, isCompared } = useCompare()
  const { formatPrice } = useCurrency()
  const [imageLoaded, setImageLoaded] = useState(false)

  const id = property._id || property.id
  const { title, price, location, bedrooms, bathrooms, area } = property
  const rawImage = (property.images && property.images[0]) || property.image || ''
  const image = getImageUrl(rawImage)
  const type = property.listingType || property.type
  const isLiked = isInWishlist(id)
  const isComparedProp = isCompared(id)

  const isSale = type === 'sale' || type === 'sell'

  return (
    <motion.div 
      className="luxury-card group cursor-pointer"
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative overflow-hidden">
        <div className="relative h-64 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
          )}
          <img 
            src={image}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300"></div>
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            toggleWishlist(id)
          }}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all"
        >
          <FaHeart className={`text-xl ${isLiked ? 'text-red-500' : 'text-gray-400'} transition-colors`} />
        </button>

        <button 
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            isComparedProp ? removeFromCompare(id) : addToCompare(property)
          }}
          className={`absolute top-16 right-4 z-10 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
            isComparedProp ? 'bg-gold text-white' : 'bg-white text-gray-400 hover:text-gold'
          }`}
          title="Compare Property"
        >
          <FaExchangeAlt className="text-lg" />
        </button>

        <div className="absolute top-4 left-4 z-10">
          <span className="bg-gold text-white px-3 py-1 text-sm font-semibold">
            {isSale ? 'FOR SALE' : 'FOR RENT'}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="text-white">
            <div className="text-2xl font-bold">{formatPrice(price)}</div>
            {type === 'rent' && <div className="text-sm">per month</div>}
          </div>
        </div>
      </div>

      <div className="p-6">
        <Link to={`/property/${id}`}>
          <h3 className="text-xl font-elegant text-luxury mb-2 hover:text-gold transition-colors line-clamp-1">
            {title}
          </h3>
        </Link>
        
        <div className="flex items-center text-gray-500 mb-4">
          <FaMapMarkerAlt className="text-gold mr-2 text-sm" />
          <span className="text-sm">{location}</span>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <FaBed className="text-gold" />
              <span className="text-sm text-gray-600">{bedrooms} beds</span>
            </div>
            <div className="flex items-center gap-1">
              <FaBath className="text-gold" />
              <span className="text-sm text-gray-600">{bathrooms} baths</span>
            </div>
            <div className="flex items-center gap-1">
              <FaRulerCombined className="text-gold" />
              <span className="text-sm text-gray-600">{area} sq ft</span>
            </div>
          </div>
        </div>

        <Link to={`/property/${id}`}>
          <button className="w-full mt-6 px-4 py-2 border border-gold text-gold hover:bg-gold hover:text-white transition-all duration-300">
            View Details
          </button>
        </Link>
      </div>
    </motion.div>
  )
}

export default PropertyCard