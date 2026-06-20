import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSearch, FaMapMarkerAlt, FaSyncAlt, FaSun, FaCloudSun, FaMoon } from 'react-icons/fa'

const climateThemes = {
  morning: {
    label: 'Morning',
    subLabel: 'Sustainable Energy',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80',
    filter: 'brightness(1.05) saturate(1.1)',
    title: 'Discover Your',
    highlight: 'Sustainable Estate',
    description: 'Experience the future of net-zero luxury living with advanced solar systems, green design, and natural integration.',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    accentColor: 'text-emerald-400',
    icon: <FaSun className="text-emerald-400" />,
  },
  evening: {
    label: 'Evening',
    subLabel: 'Thermal Resilience',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80',
    filter: 'brightness(0.8) saturate(1.5) sepia(0.35) hue-rotate(-10deg)',
    title: 'Comfortable in',
    highlight: 'Extreme Heat',
    description: 'Our thermal-shielded estates are engineered to remain cool, energy-efficient, and comfortable during peak temperatures.',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    accentColor: 'text-amber-400',
    icon: <FaCloudSun className="text-amber-400" />,
  },
  night: {
    label: 'Night',
    subLabel: 'Extreme Weather Resilience',
    image: '/images/climate_night.png',
    filter: 'brightness(0.9) contrast(1.05) saturate(1.1)',
    title: 'Fortified Against',
    highlight: 'Severe Storms',
    description: 'Rest easy in coastal villas built with storm-resilient engineering, flood protections, and automated backup systems.',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    accentColor: 'text-indigo-400',
    icon: <FaMoon className="text-indigo-400" />,
  }
}

const getInitialTimeOfDay = () => {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 16) {
    return 'morning'
  } else if (hour >= 16 && hour < 19) {
    return 'evening'
  } else {
    return 'night'
  }
}

const Hero = () => {
  const navigate = useNavigate()
  const [location, setLocation] = useState('')
  const [propertyType, setPropertyType] = useState('all')
  const [timeOfDay, setTimeOfDay] = useState(getInitialTimeOfDay())

  // Keep background and theme in sync with the actual current time of day
  useEffect(() => {
    const handleTimeCheck = () => {
      setTimeOfDay(getInitialTimeOfDay())
    }
    // Check immediately on mount
    handleTimeCheck()
    // Setup check every 15 seconds to handle transitions seamlessly
    const interval = setInterval(handleTimeCheck, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const queryParams = new URLSearchParams()
    if (location.trim()) {
      queryParams.append('location', location.trim())
    }
    if (propertyType && propertyType !== 'all') {
      queryParams.append('propertyType', propertyType.toLowerCase())
    }
    navigate(`/properties?${queryParams.toString()}`)
  }

  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images with Cross-Fade */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        <AnimatePresence initial={false}>
          <motion.img
            key={timeOfDay}
            src={climateThemes[timeOfDay].image}
            alt={`${timeOfDay} Climate`}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              filter: climateThemes[timeOfDay].filter
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/40 z-10"></div>
      </div>

      {/* Content */}
      <div className="relative z-20 text-center text-white px-4 max-w-5xl mx-auto flex flex-col justify-center h-full pt-12">
        
        {/* Animated Climate Status & Text */}
        <div className="min-h-[220px] md:min-h-[200px] flex flex-col justify-end mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={timeOfDay}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="w-full"
            >
              {/* Climate Status Badge */}
              <div className={`inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border bg-black/50 backdrop-blur-md text-xs font-bold uppercase tracking-widest ${climateThemes[timeOfDay].badgeColor} transition-colors duration-300`}>
                <span className="animate-pulse">●</span>
                <span>{climateThemes[timeOfDay].label} Mode (Auto-Synced)</span>
                <span className="opacity-40">|</span>
                <span>{climateThemes[timeOfDay].subLabel}</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-elegant mb-4 leading-tight">
                {climateThemes[timeOfDay].title} <span className={`${climateThemes[timeOfDay].accentColor} transition-colors duration-300`}>{climateThemes[timeOfDay].highlight}</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed mb-6">
                {climateThemes[timeOfDay].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Search Bar */}
        <motion.form 
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-white rounded-lg shadow-2xl p-4 max-w-3xl mx-auto w-full"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center border border-gray-200 rounded-lg px-4 py-3 bg-white">
              <FaMapMarkerAlt className="text-gold mr-3 shrink-0" />
              <input 
                type="text" 
                placeholder="Enter location (e.g., Beverly Hills)..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full outline-none text-gray-700 bg-transparent text-sm"
              />
            </div>
            <div className="flex-1 flex items-center border border-gray-200 rounded-lg px-4 py-3 bg-white">
              <select 
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full outline-none text-gray-700 bg-white text-sm cursor-pointer"
              >
                <option value="all">Property Type (All)</option>
                <option value="villa">Villa</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <button type="submit" className="luxury-btn flex items-center justify-center gap-2 text-sm px-6 py-3 font-semibold text-white bg-gold hover:bg-yellow-600 rounded-lg transition-colors shrink-0">
              <FaSearch /> Search
            </button>
          </div>
        </motion.form>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-3 gap-4 md:gap-8 mt-12 border-t border-white/10 pt-8"
        >
          <div>
            <div className="text-2xl md:text-3xl font-bold text-gold">500+</div>
            <div className="text-xs md:text-sm text-gray-300">Resilient Homes</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-gold">100%</div>
            <div className="text-xs md:text-sm text-gray-300">Eco-Certified</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-gold">24/7</div>
            <div className="text-xs md:text-sm text-gray-300">Energy Autonomy</div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Hero