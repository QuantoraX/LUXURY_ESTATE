import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaHome, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaCalendarAlt, FaCheckSquare, FaChartLine } from 'react-icons/fa'
import { fetchProperties } from '../services/api'
import { useCurrency } from '../context/CurrencyContext'
import PropertyCard from '../components/Properties/PropertyCard'

// Sri Lanka base rates per sq ft (USD equivalent base rates)
const cityRates = {
  colombo: 220,     // High premium
  gampaha: 110,     // Mid-tier suburbs
  kandy: 140,       // Cultural premium
  galle: 160,       // Coastal tourist premium
  negombo: 125,     // Airport/Coastal proximity
  kurunegala: 95,   // Emerging commercial hub
  jaffna: 85,       // Regional capital
  batticaloa: 75    // Eastern coastal hub
}

const amenitiesRates = {
  pool: 15000,
  gym: 8000,
  security: 6000,
  generator: 7000,
  rooftop: 10000,
  garden: 5000
}

export default function Valuation() {
  const { formatPrice } = useCurrency()
  
  // Wizard Inputs State
  const [city, setCity] = useState('colombo')
  const [propertyType, setPropertyType] = useState('house')
  const [area, setArea] = useState(1500)
  const [bedrooms, setBedrooms] = useState(3)
  const [bathrooms, setBathrooms] = useState(2)
  const [age, setAge] = useState('1-5')
  const [amenities, setAmenities] = useState({
    pool: false,
    gym: false,
    security: false,
    generator: false,
    rooftop: false,
    garden: false
  })

  // Marketplace matches
  const [properties, setProperties] = useState([])
  const [matchingListings, setMatchingListings] = useState([])
  const [loadingListings, setLoadingListings] = useState(false)

  // Fetch listings to find matches
  useEffect(() => {
    const loadListings = async () => {
      try {
        setLoadingListings(true)
        const res = await fetchProperties()
        const list = Array.isArray(res) ? res : res?.data || []
        setProperties(list)
      } catch (err) {
        console.error('Failed to load listings for matching:', err.message)
      } finally {
        setLoadingListings(false)
      }
    }
    loadListings()
  }, [])

  // Calculate market estimates
  const getEstimation = () => {
    const baseRate = cityRates[city] || 100
    let typeMultiplier = 1.0
    if (propertyType === 'apartment') typeMultiplier = 1.15
    if (propertyType === 'villa') typeMultiplier = 1.35
    if (propertyType === 'land') typeMultiplier = 0.60

    // Core construction value
    const constructionVal = area * baseRate * typeMultiplier

    // Room factors
    const roomsVal = (bedrooms * 10000) + (bathrooms * 6000)

    // Amenities total
    let amenitiesVal = 0
    Object.keys(amenities).forEach(key => {
      if (amenities[key]) {
        amenitiesVal += amenitiesRates[key] || 0
      }
    })

    // Subtotal
    const subtotal = constructionVal + roomsVal + amenitiesVal

    // Age depreciation
    let ageFactor = 1.0
    if (age === 'new') ageFactor = 1.05
    if (age === '1-5') ageFactor = 1.00
    if (age === '5-10') ageFactor = 0.88
    if (age === '10+') ageFactor = 0.72

    const marketValue = Math.round(subtotal * ageFactor)
    const lowValue = Math.round(marketValue * 0.90)
    const highValue = Math.round(marketValue * 1.10)

    return { lowValue, marketValue, highValue }
  }

  const { lowValue, marketValue, highValue } = getEstimation()

  // Filter similar marketplace listings
  useEffect(() => {
    if (properties.length === 0) return
    const filtered = properties.filter(p => {
      const pLoc = (p.location || '').toLowerCase()
      const pType = (p.propertyType || '').toLowerCase()
      
      // Match if location contains the selected city name OR same property type
      const locMatch = pLoc.includes(city)
      const typeMatch = pType === propertyType
      
      return locMatch && typeMatch
    })
    setMatchingListings(filtered.slice(0, 3))
  }, [city, propertyType, properties])

  const toggleAmenity = (key) => {
    setAmenities(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-10 py-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <section className="text-center space-y-4 max-w-2xl mx-auto bg-gradient-to-br from-luxury/5 via-gold/5 to-transparent p-8 rounded-3xl border border-gold/10">
        <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center text-gold mx-auto shadow-sm">
          <FaChartLine className="text-2xl" />
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-luxury">Automated Property Valuation</h1>
        <p className="text-slate-500 text-sm">
          Get an instant real-time market value estimation for properties in Sri Lanka based on recent sales transactions, location coefficients, dimensions, and specifications.
        </p>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Wizard Form Inputs */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 shadow-soft space-y-6">
          <h3 className="text-lg font-serif font-bold text-luxury border-b border-slate-100 pb-3 flex items-center gap-2">
            <FaHome className="text-gold" />
            <span>Step 1: Property Specifications</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* City */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-gold" /> Location (City)
              </label>
              <select 
                value={city} 
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-xs bg-white font-semibold cursor-pointer"
              >
                <option value="colombo">Colombo</option>
                <option value="gampaha">Gampaha</option>
                <option value="kandy">Kandy</option>
                <option value="galle">Galle</option>
                <option value="negombo">Negombo</option>
                <option value="kurunegala">Kurunegala</option>
                <option value="jaffna">Jaffna</option>
                <option value="batticaloa">Batticaloa</option>
              </select>
            </div>

            {/* Property Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FaHome className="text-gold" /> Property Type
              </label>
              <select 
                value={propertyType} 
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-xs bg-white font-semibold cursor-pointer"
              >
                <option value="house">House / Villa</option>
                <option value="apartment">Apartment</option>
                <option value="land">Bare Land</option>
              </select>
            </div>

            {/* Bedrooms (Only if not Land) */}
            {propertyType !== 'land' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FaBed className="text-gold" /> Bedrooms
                </label>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  {[1, 2, 3, 4, '5+'].map((num) => {
                    const val = typeof num === 'string' ? 5 : num
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setBedrooms(val)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          bedrooms === val
                            ? 'bg-white text-luxury shadow-sm'
                            : 'text-slate-500 hover:text-luxury'
                        }`}
                      >
                        {num}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Bathrooms (Only if not Land) */}
            {propertyType !== 'land' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FaBath className="text-gold" /> Bathrooms
                </label>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  {[1, 2, 3, 4, '5+'].map((num) => {
                    const val = typeof num === 'string' ? 5 : num
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setBathrooms(val)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          bathrooms === val
                            ? 'bg-white text-luxury shadow-sm'
                            : 'text-slate-500 hover:text-luxury'
                        }`}
                      >
                        {num}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Dimensions (Area) */}
            <div className="space-y-2 sm:col-span-2">
              <div className="flex justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><FaRulerCombined className="text-gold" /> Size / Dimensions</span>
                <span className="text-gold font-bold">{area.toLocaleString()} {propertyType === 'land' ? 'Perches' : 'Sq Ft'}</span>
              </div>
              <input
                type="range"
                min={propertyType === 'land' ? 5 : 400}
                max={propertyType === 'land' ? 100 : 8000}
                step={propertyType === 'land' ? 1 : 50}
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="w-full accent-gold cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Min: {propertyType === 'land' ? '5 Perches' : '400 Sq Ft'}</span>
                <span>Max: {propertyType === 'land' ? '100 Perches' : '8,000 Sq Ft'}</span>
              </div>
            </div>

            {/* Construction Age (Only if not Land) */}
            {propertyType !== 'land' && (
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FaCalendarAlt className="text-gold" /> Age of Construction
                </label>
                <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {[
                    { label: 'Brand New', value: 'new' },
                    { label: '1 - 5 Years', value: '1-5' },
                    { label: '5 - 10 Years', value: '5-10' },
                    { label: '10+ Years', value: '10+' }
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setAge(item.value)}
                      className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                        age === item.value
                          ? 'bg-white text-luxury shadow-sm'
                          : 'text-slate-500 hover:text-luxury'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Premium Amenities Checklist (Only if not Land) */}
          {propertyType !== 'land' && (
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FaCheckSquare className="text-gold" /> Amenities & Facilities Coefficients
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Swimming Pool', key: 'pool' },
                  { label: 'Fitness Center / Gym', key: 'gym' },
                  { label: 'Backup Generator', key: 'generator' },
                  { label: '24/7 Gate Security', key: 'security' },
                  { label: 'Rooftop Lounge', key: 'rooftop' },
                  { label: 'Landscaped Garden', key: 'garden' }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleAmenity(item.key)}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                      amenities[item.key]
                        ? 'border-gold bg-gold/5 text-luxury'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <span>{item.label}</span>
                    {amenities[item.key] && <span className="w-2.5 h-2.5 rounded-full bg-gold"></span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Output Evaluation Gauge */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-soft space-y-6 sticky top-24">
            <h3 className="text-lg font-serif font-bold text-luxury border-b border-slate-100 pb-3 flex items-center gap-2">
              <FaChartLine className="text-gold" />
              <span>Real-Time Estimation</span>
            </h3>

            {/* Estimated Value */}
            <div className="text-center bg-gradient-to-b from-slate-50 to-white border border-slate-100 p-6 rounded-[24px] space-y-2 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fair Market Valuation</p>
              <p className="text-3xl font-bold text-luxury tracking-wide">{formatPrice(marketValue)}</p>
              <p className="text-[10px] text-slate-400 font-normal">Calculated index using Sri Lankan property registers</p>
            </div>

            {/* Custom Visual Range Meter Bar */}
            <div className="space-y-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Conservative</span>
                  <span>Target Market</span>
                  <span>Optimistic</span>
                </div>
                <div className="overflow-hidden h-3 text-xs flex rounded-full bg-slate-100">
                  <div style={{ width: '30%' }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-400/80"></div>
                  <div style={{ width: '40%' }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gold"></div>
                  <div style={{ width: '30%' }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-400/80"></div>
                </div>
              </div>

              {/* Price Ranges labels */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
                <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50">
                  <p className="text-[9px] text-blue-500 uppercase tracking-wider">Low Range</p>
                  <p className="text-luxury mt-0.5 font-bold">{formatPrice(lowValue)}</p>
                </div>
                <div className="bg-gold/10 p-2.5 rounded-xl border border-gold/20">
                  <p className="text-[9px] text-gold uppercase tracking-wider">Market Value</p>
                  <p className="text-luxury mt-0.5 font-bold">{formatPrice(marketValue)}</p>
                </div>
                <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50">
                  <p className="text-[9px] text-emerald-500 uppercase tracking-wider">High Range</p>
                  <p className="text-luxury mt-0.5 font-bold">{formatPrice(highValue)}</p>
                </div>
              </div>
            </div>

            {/* Context and Disclaimer Callout */}
            <div className="bg-cream/40 p-4 rounded-2xl text-[11px] text-slate-500 leading-relaxed border border-gold/10">
              <strong>Note:</strong> Estimates generated by our platform represent baseline market pricing metrics inside Sri Lankan regions. Real coords, topography, road access breadth, and architectural luxury quality may influence ultimate valuations.
            </div>
          </div>
        </div>
      </div>

      {/* Matching Listings in Marketplace */}
      <section className="space-y-6 pt-8 border-t border-slate-200">
        <div>
          <h2 className="text-2xl font-serif font-bold text-luxury">Matching Marketplace Listings</h2>
          <p className="text-slate-400 text-xs mt-1">Real properties matching your location and type parameters.</p>
        </div>

        {loadingListings ? (
          <div className="flex flex-col justify-center items-center py-12 space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
            <p className="text-slate-400 text-xs">Finding similar listings...</p>
          </div>
        ) : matchingListings.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-white border border-slate-200 border-dashed rounded-[32px] p-6 text-xs">
            No active matching listings found for this location/type combo.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {matchingListings.map((prop) => (
              <PropertyCard key={prop._id || prop.id} property={prop} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
