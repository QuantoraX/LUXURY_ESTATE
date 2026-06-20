import { useState } from 'react'
import PropertyManagement from './PropertyManagement'
import MessageInbox from './MessageInbox'
import UserManagement from './UserManagement'
import Inbox from './Inbox'
import { FaBuilding, FaTags, FaCalculator, FaCoins } from 'react-icons/fa'

export default function AdminDashboard() {
  const [properties, setProperties] = useState([])
  
  // Calculate dynamic stats
  const handlePropertiesLoad = (loadedList) => {
    setProperties(loadedList)
  }

  const totalCount = properties.length
  const sellCount = properties.filter(p => p.listingType === 'sell' || p.listingType === 'sale').length
  const rentCount = properties.filter(p => p.listingType === 'rent').length
  
  const totalValue = properties.reduce((acc, p) => acc + (p.price || 0), 0)
  const averagePrice = totalCount > 0 ? Math.round(totalValue / totalCount) : 0

  // Count by types
  const typeCounts = {
    villa: properties.filter(p => p.propertyType === 'villa').length,
    apartment: properties.filter(p => p.propertyType === 'apartment').length,
    house: properties.filter(p => p.propertyType === 'house').length,
    land: properties.filter(p => p.propertyType === 'land').length,
    commercial: properties.filter(p => p.propertyType === 'commercial').length
  }

  const maxTypeCount = Math.max(...Object.values(typeCounts), 1)

  // Donut chart calculations
  const sellPercentage = totalCount > 0 ? (sellCount / totalCount) * 100 : 0
  const rentPercentage = totalCount > 0 ? (rentCount / totalCount) * 100 : 0
  const strokeDasharraySell = `${sellPercentage} ${100 - sellPercentage}`
  const strokeDashoffsetRent = 100 - sellPercentage // start rent where sell ends

  return (
    <div className="space-y-10 py-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Listings */}
        <div className="group rounded-[32px] border border-white bg-white/70 backdrop-blur-md p-6 shadow-soft hover:shadow-lg transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center text-xl shrink-0">
              <FaBuilding />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Listings</p>
              <h3 className="text-2xl font-bold text-luxury mt-1">{totalCount}</h3>
            </div>
          </div>
        </div>

        {/* Card 2: Sales vs Rents */}
        <div className="group rounded-[32px] border border-white bg-white/70 backdrop-blur-md p-6 shadow-soft hover:shadow-lg transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
              <FaTags />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Sales / Rents</p>
              <h3 className="text-2xl font-bold text-luxury mt-1">
                {sellCount} <span className="text-slate-300 text-base font-normal">/</span> {rentCount}
              </h3>
            </div>
          </div>
        </div>

        {/* Card 3: Total Portfolio Value */}
        <div className="group rounded-[32px] border border-white bg-white/70 backdrop-blur-md p-6 shadow-soft hover:shadow-lg transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-luxury/5 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl shrink-0">
              <FaCoins />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Portfolio Valuation</p>
              <h3 className="text-2xl font-bold text-luxury mt-1">${totalValue.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Card 4: Avg Price */}
        <div className="group rounded-[32px] border border-white bg-white/70 backdrop-blur-md p-6 shadow-soft hover:shadow-lg transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shrink-0">
              <FaCalculator />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Average Price</p>
              <h3 className="text-2xl font-bold text-luxury mt-1">${averagePrice.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Row */}
      {totalCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chart 1: Donut Distribution (Rent vs Sell) */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-soft flex flex-col justify-between items-center text-center">
            <div>
              <h4 className="font-bold text-luxury text-sm uppercase tracking-wider">Listing Allocation</h4>
              <p className="text-xs text-slate-400 mt-1">Comparison of properties for sale vs rent.</p>
            </div>
            
            {/* SVG Donut */}
            <div className="relative w-40 h-40 my-6 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3.2" />
                
                {/* Sell Ring */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#c6a43f"
                  strokeWidth="3.2"
                  strokeDasharray={strokeDasharraySell}
                  strokeDashoffset="0"
                />
                
                {/* Rent Ring */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="3.2"
                  strokeDasharray={`${rentPercentage} ${100 - rentPercentage}`}
                  strokeDashoffset={-strokeDashoffsetRent}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold text-luxury">{totalCount}</span>
                <span className="text-xxs font-semibold uppercase tracking-wider text-slate-400">Listings</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex gap-6 justify-center w-full border-t border-slate-100 pt-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-luxury">
                <span className="w-3 h-3 rounded-full bg-gold shrink-0"></span>
                <span>Sale ({Math.round(sellPercentage)}%)</span>
              </div>
              <div className="flex items-center gap-1.5 text-luxury">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                <span>Rent ({Math.round(rentPercentage)}%)</span>
              </div>
            </div>
          </div>

          {/* Chart 2: Property Type Breakdown */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-soft col-span-1 md:col-span-2 flex flex-col justify-between">
            <div className="mb-4">
              <h4 className="font-bold text-luxury text-sm uppercase tracking-wider">Type Segmentation</h4>
              <p className="text-xs text-slate-400 mt-1">Listing volume split by architectural structural types.</p>
            </div>

            {/* Horizontal Bar Chart */}
            <div className="space-y-3.5 flex-1 flex flex-col justify-center">
              {Object.entries(typeCounts).map(([type, val]) => {
                const percentage = Math.round((val / maxTypeCount) * 100);
                const displayPercentage = totalCount > 0 ? Math.round((val / totalCount) * 100) : 0;
                const barColor = type === 'villa' ? 'bg-gold' : 
                                 type === 'apartment' ? 'bg-slate-800' :
                                 type === 'house' ? 'bg-indigo-600' :
                                 type === 'land' ? 'bg-amber-600' : 'bg-rose-500';
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold text-luxury">
                      <span className="capitalize">{type}</span>
                      <span className="text-slate-400">{val} ({displayPercentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Message Inbox Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-luxury">Global Inquiries</h2>
          <p className="text-slate-500 mt-1">Monitor all contact requests and inquiries across the platform.</p>
        </div>
        <MessageInbox />
      </div>

      {/* Property Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-luxury">Property Portfolio</h2>
          <p className="text-slate-500 mt-1">Add, update, search, and delete property listings globally.</p>
        </div>
        <PropertyManagement isAdmin={true} onLoad={handlePropertiesLoad} />
      </div>

      {/* Direct Messages Section */}
      <div className="pt-4">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-luxury">Direct Messages</h2>
          <p className="text-slate-500 mt-1">Chat directly with clients and agents on the platform in real-time.</p>
        </div>
        <Inbox />
      </div>

      {/* User Section */}
      <UserManagement />
    </div>
  )
}
