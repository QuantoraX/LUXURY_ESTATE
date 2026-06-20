import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function FilterSidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  // Parse current params from URL
  const queryParams = new URLSearchParams(location.search)
  const urlLocation = queryParams.get('location') || ''
  const urlType = queryParams.get('propertyType') || 'all'
  const urlListing = queryParams.get('listingType') || 'all'
  const urlMinPrice = queryParams.get('minPrice') || ''
  const urlMaxPrice = queryParams.get('maxPrice') || ''

  const [localLocation, setLocalLocation] = useState(urlLocation)
  const [propertyType, setPropertyType] = useState(urlType)
  const [listingType, setListingType] = useState(urlListing)
  const [minPrice, setMinPrice] = useState(urlMinPrice)
  const [maxPrice, setMaxPrice] = useState(urlMaxPrice)

  // Keep state sync when URL parameters are updated externally
  useEffect(() => {
    setLocalLocation(urlLocation)
    setPropertyType(urlType)
    setListingType(urlListing)
    setMinPrice(urlMinPrice)
    setMaxPrice(urlMaxPrice)
  }, [location.search])

  const applyFilters = (updates = {}) => {
    const nextParams = new URLSearchParams()
    
    const active = {
      location: localLocation,
      propertyType,
      listingType,
      minPrice,
      maxPrice,
      ...updates
    }

    if (active.location.trim()) nextParams.append('location', active.location.trim())
    if (active.propertyType && active.propertyType !== 'all') nextParams.append('propertyType', active.propertyType)
    if (active.listingType && active.listingType !== 'all') nextParams.append('listingType', active.listingType)
    if (active.minPrice) nextParams.append('minPrice', active.minPrice)
    if (active.maxPrice) nextParams.append('maxPrice', active.maxPrice)

    navigate(`/properties?${nextParams.toString()}`)
  }

  const handleClear = () => {
    setLocalLocation('')
    setPropertyType('all')
    setListingType('all')
    setMinPrice('')
    setMaxPrice('')
    navigate('/properties')
  }

  return (
    <aside className="rounded-3xl bg-white p-6 shadow-soft border border-slate-200 space-y-6 shrink-0 h-fit">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-xl font-bold text-luxury">Filter Properties</h2>
        <button onClick={handleClear} className="text-xs text-gold font-semibold hover:underline">
          Clear All
        </button>
      </div>

      <div className="space-y-4 text-xs font-semibold text-slate-700">
        {/* Location Search */}
        <div>
          <label className="block uppercase tracking-wider text-slate-500 mb-2">Location</label>
          <input
            type="text"
            value={localLocation}
            onChange={(e) => {
              setLocalLocation(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyFilters()
            }}
            onBlur={() => applyFilters()}
            placeholder="City, zip, or area..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-gold transition-colors text-sm"
          />
        </div>

        {/* Listing Mode */}
        <div>
          <label className="block uppercase tracking-wider text-slate-500 mb-2">Listing Mode</label>
          <select
            value={listingType}
            onChange={(e) => {
              applyFilters({ listingType: e.target.value })
            }}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-gold transition-colors text-sm cursor-pointer"
          >
            <option value="all">Any listing mode</option>
            <option value="sell">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </div>

        {/* Property Type */}
        <div>
          <label className="block uppercase tracking-wider text-slate-500 mb-2">Property Type</label>
          <select
            value={propertyType}
            onChange={(e) => {
              applyFilters({ propertyType: e.target.value })
            }}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-gold transition-colors text-sm cursor-pointer"
          >
            <option value="all">Any property type</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block uppercase tracking-wider text-slate-500 mb-2">Min Price ($)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={() => applyFilters()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyFilters()
              }}
              placeholder="Any Min"
              className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-gold transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block uppercase tracking-wider text-slate-500 mb-2">Max Price ($)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={() => applyFilters()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyFilters()
              }}
              placeholder="Any Max"
              className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-gold transition-colors text-sm"
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
