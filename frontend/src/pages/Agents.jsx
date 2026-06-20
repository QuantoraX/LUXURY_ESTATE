import React, { useState } from 'react'
import AgentsList from '../components/Agents/AgentsList'
import { FaSearch, FaUserShield } from 'react-icons/fa'

export default function Agents() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="space-y-10 py-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-gold uppercase tracking-widest bg-gold/10 px-4 py-1.5 rounded-full inline-flex items-center gap-1.5">
          <FaUserShield className="text-[10px]" /> Expertise
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-luxury mt-2">Our Elite Advisors</h1>
        <p className="text-slate-500 text-sm font-medium">
          Meet the dedicated, certified professionals who represent some of the world's most premier estates.
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search agents by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-md text-luxury placeholder-slate-400 border border-slate-200 rounded-2xl focus:outline-none focus:bg-white focus:border-gold focus:ring-1 focus:ring-gold transition-all text-sm shadow-soft"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
            <FaSearch className="text-sm" />
          </div>
        </div>
      </div>

      {/* Agents List Grid */}
      <AgentsList searchQuery={searchQuery} />
    </div>
  )
}
