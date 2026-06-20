import React from 'react'
import { Link } from 'react-router-dom'
import { useCompare } from '../../context/CompareContext'
import { FaTrash, FaExchangeAlt, FaTimes } from 'react-icons/fa'
import { getImageUrl } from '../../services/api'

export default function CompareDrawer() {
  const { compareList, removeFromCompare, clearCompare } = useCompare()

  if (compareList.length === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-slide-up">
      <div className="bg-white/95 border border-slate-200 p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Properties list */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gold/15 flex items-center justify-center text-gold shrink-0">
            <FaExchangeAlt className="text-sm" />
          </div>
          <div className="flex gap-2">
            {compareList.map((property) => {
              const id = property._id || property.id
              const defaultImg = (property.images && property.images[0]) || property.image || ''
              return (
                <div key={id} className="relative group w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img src={getImageUrl(defaultImg)} alt={property.title} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeFromCompare(id)}
                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <FaTimes className="text-[8px]" />
                  </button>
                </div>
              )
            })}
            
            {/* Empty slots placeholders */}
            {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
              <div key={idx} className="w-14 h-14 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-xs font-bold">
                +
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={clearCompare}
            className="px-4 py-2 hover:bg-slate-50 text-slate-500 hover:text-luxury text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
          >
            <FaTrash className="text-[10px]" /> Clear
          </button>
          
          <Link
            to="/compare"
            className={`px-5 py-2.5 bg-luxury hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 ${
              compareList.length < 2 ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            Compare Now ({compareList.length})
          </Link>
        </div>
      </div>
    </div>
  )
}
