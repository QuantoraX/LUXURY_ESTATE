import React from 'react'
import { Link } from 'react-router-dom'
import { useCompare } from '../context/CompareContext'
import { FaTrash, FaCheck, FaTimes, FaBed, FaBath, FaRulerCombined, FaExchangeAlt, FaChevronLeft } from 'react-icons/fa'
import { getImageUrl } from '../services/api'
import { useCurrency } from '../context/CurrencyContext'

export default function Compare() {
  const { compareList, removeFromCompare, clearCompare } = useCompare()
  const { formatPrice } = useCurrency()

  if (compareList.length < 2) {
    return (
      <div className="space-y-8 py-6">
        <Link to="/properties" className="inline-flex items-center gap-2 text-slate-500 hover:text-gold font-semibold text-sm transition-colors">
          <FaChevronLeft className="text-xs" /> Back to Properties
        </Link>

        <section className="text-center py-20 bg-white border border-slate-200 rounded-[32px] p-8 shadow-soft max-w-xl mx-auto my-10">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-gold mx-auto mb-6">
            <FaExchangeAlt className="text-2xl" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-luxury">Insufficient Properties for Comparison</h1>
          <p className="text-slate-500 mt-3 text-sm">
            Please add at least 2 properties to compare specifications side-by-side.
          </p>
          <Link
            to="/properties"
            className="mt-6 inline-flex bg-gold hover:bg-yellow-600 text-white px-6 py-2.5 rounded-xl font-bold transition-colors text-xs shadow-sm"
          >
            Find Properties
          </Link>
        </section>
      </div>
    )
  }

  // Get all unique features across all compared properties to compare them in rows
  const allFeatures = Array.from(
    new Set(compareList.reduce((acc, property) => [...acc, ...(property.features || [])], []))
  )

  return (
    <div className="space-y-8 py-6">
      {/* Navigation and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Link to="/properties" className="inline-flex items-center gap-2 text-slate-500 hover:text-gold font-semibold text-sm transition-colors">
            <FaChevronLeft className="text-xs" /> Back to Properties
          </Link>
          <h1 className="text-3xl font-serif font-bold text-luxury">Property Comparison</h1>
        </div>

        <button
          onClick={clearCompare}
          className="self-start px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-all flex items-center gap-2 border border-red-200"
        >
          <FaTrash className="text-[10px]" /> Clear Comparison
        </button>
      </div>

      {/* Comparison Grid */}
      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                {/* empty corner column */}
                <th className="p-6 text-left w-1/4 min-w-[200px] border-r border-slate-50 font-serif font-bold text-luxury bg-slate-50/50">
                  Specifications
                </th>
                
                {compareList.map((property) => {
                  const id = property._id || property.id
                  const defaultImg = (property.images && property.images[0]) || property.image || ''
                  const isSale = property.listingType === 'sell' || property.listingType === 'sale'
                  return (
                    <th key={id} className="p-6 text-left w-1/4 min-w-[250px] border-r border-slate-50 relative group">
                      <button
                        onClick={() => removeFromCompare(id)}
                        className="absolute top-4 right-4 bg-slate-100 hover:bg-red-500 hover:text-white text-slate-400 rounded-full p-2 transition-all shadow-sm"
                        title="Remove"
                      >
                        <FaTimes className="text-[10px]" />
                      </button>

                      <div className="space-y-4">
                        <div className="h-36 rounded-xl overflow-hidden bg-slate-100">
                          <img src={getImageUrl(defaultImg)} alt={property.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider bg-gold/10 text-gold px-2.5 py-1 rounded-full`}>
                            {property.propertyType}
                          </span>
                          <h4 className="font-serif font-bold text-luxury text-base mt-2 line-clamp-1">{property.title}</h4>
                          <p className="text-slate-400 text-xs mt-1">{property.location}</p>
                        </div>
                      </div>
                    </th>
                  )
                })}
                
                {/* empty filler columns to maintain table width */}
                {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                  <th key={idx} className="p-6 w-1/4 min-w-[250px] border-r border-slate-50 border-dashed bg-slate-50/20 text-slate-300 font-light text-sm">
                    Empty comparison slot
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {/* Price Row */}
              <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                <td className="p-4 border-r border-slate-50 font-bold text-luxury bg-slate-50/30 text-xs uppercase tracking-wider">Price</td>
                {compareList.map((property) => (
                  <td key={property._id || property.id} className="p-4 border-r border-slate-50 font-bold text-lg text-luxury">
                    {formatPrice(property.price)}
                    {property.listingType === 'rent' && <span className="text-slate-400 text-xs font-normal"> / mo</span>}
                  </td>
                ))}
                {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-r border-slate-50 text-slate-300">-</td>
                ))}
              </tr>

              {/* Area Row */}
              <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                <td className="p-4 border-r border-slate-50 font-bold text-luxury bg-slate-50/30 text-xs uppercase tracking-wider">Area (sq ft)</td>
                {compareList.map((property) => (
                  <td key={property._id || property.id} className="p-4 border-r border-slate-50 text-sm font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5"><FaRulerCombined className="text-slate-400" /> {property.area} sq ft</span>
                  </td>
                ))}
                {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-r border-slate-50 text-slate-300">-</td>
                ))}
              </tr>

              {/* Bedrooms Row */}
              <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                <td className="p-4 border-r border-slate-50 font-bold text-luxury bg-slate-50/30 text-xs uppercase tracking-wider">Bedrooms</td>
                {compareList.map((property) => (
                  <td key={property._id || property.id} className="p-4 border-r border-slate-50 text-sm font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5"><FaBed className="text-slate-400" /> {property.bedrooms} Bed</span>
                  </td>
                ))}
                {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-r border-slate-50 text-slate-300">-</td>
                ))}
              </tr>

              {/* Bathrooms Row */}
              <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                <td className="p-4 border-r border-slate-50 font-bold text-luxury bg-slate-50/30 text-xs uppercase tracking-wider">Bathrooms</td>
                {compareList.map((property) => (
                  <td key={property._id || property.id} className="p-4 border-r border-slate-50 text-sm font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5"><FaBath className="text-slate-400" /> {property.bathrooms} Bath</span>
                  </td>
                ))}
                {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-r border-slate-50 text-slate-300">-</td>
                ))}
              </tr>

              {/* Listing Type Row */}
              <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                <td className="p-4 border-r border-slate-50 font-bold text-luxury bg-slate-50/30 text-xs uppercase tracking-wider">Listing Type</td>
                {compareList.map((property) => (
                  <td key={property._id || property.id} className="p-4 border-r border-slate-50 text-sm font-semibold text-slate-700 capitalize">
                    For {property.listingType === 'sell' || property.listingType === 'sale' ? 'Sale' : 'Rent'}
                  </td>
                ))}
                {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-r border-slate-50 text-slate-300">-</td>
                ))}
              </tr>

              {/* Features header section separator */}
              <tr className="border-b border-slate-100 bg-slate-50/40">
                <td colSpan={4} className="p-3 pl-6 font-serif font-bold text-luxury text-sm">
                  Amenities & Facilities
                </td>
              </tr>

              {/* Compare Features one by one */}
              {allFeatures.map((feature, featureIdx) => (
                <tr key={featureIdx} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                  <td className="p-4 border-r border-slate-50 font-medium text-slate-500 bg-slate-50/10 text-xs">{feature}</td>
                  
                  {compareList.map((property) => {
                    const hasFeature = property.features?.includes(feature)
                    return (
                      <td key={property._id || property.id} className="p-4 border-r border-slate-50 text-sm">
                        {hasFeature ? (
                          <span className="flex items-center gap-1 text-emerald-600 font-medium text-xs">
                            <FaCheck className="text-emerald-500 text-[10px]" /> Included
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-300 text-xs">
                            <FaTimes className="text-slate-200 text-[10px]" /> Not available
                          </span>
                        )}
                      </td>
                    )
                  })}
                  
                  {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                    <td key={idx} className="p-4 border-r border-slate-50 text-slate-300">-</td>
                  ))}
                </tr>
              ))}

              {/* Final Actions Row */}
              <tr className="hover:bg-slate-50/30 transition-colors">
                <td className="p-6 border-r border-slate-50 font-bold text-luxury bg-slate-50/30 text-xs uppercase tracking-wider">Action</td>
                {compareList.map((property) => {
                  const id = property._id || property.id
                  return (
                    <td key={id} className="p-6 border-r border-slate-50">
                      <div className="flex flex-col gap-2">
                        <Link
                          to={`/property/${id}`}
                          className="px-4 py-2 bg-luxury hover:bg-black text-white text-xs font-bold rounded-xl text-center transition-all shadow-sm"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => removeFromCompare(id)}
                          className="px-4 py-2 border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-500 text-xs font-bold rounded-xl transition-all"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  )
                })}
                {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                  <td key={idx} className="p-6 border-r border-slate-50 text-slate-300">-</td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
