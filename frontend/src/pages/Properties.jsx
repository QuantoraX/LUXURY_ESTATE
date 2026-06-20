import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import FilterSidebar from '../components/Properties/FilterSidebar'
import PropertyGrid from '../components/Properties/PropertyGrid'
import PropertyMap from '../components/Properties/PropertyMap'
import { fetchProperties } from '../services/api'

export default function Properties() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    let mounted = true
    
    const load = () => {
      fetchProperties(location.search || '?limit=12')
        .then((res) => {
          const list = Array.isArray(res) ? res : res?.data || res?.items || []
          if (mounted) setProperties(list)
        })
        .catch(() => {
          if (mounted) setProperties([])
        })
    }

    setLoading(true)
    load()

    // Fetch properties every 5 seconds to keep map and grid updated in real-time
    const interval = setInterval(load, 5000)

    // Clear initial loading state
    fetchProperties(location.search || '?limit=12')
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [location.search])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-luxury">Exclusive Residences</h1>
          <p className="text-slate-500 text-sm mt-1">Discover premium properties handpicked for your standard of living.</p>
        </div>
      </div>

      {/* Main split viewport */}
      <div className="grid gap-8 lg:grid-cols-[280px_1fr_400px]">
        {/* Left: Filter Sidebar */}
        <div className="lg:sticky lg:top-28 h-fit">
          <FilterSidebar />
        </div>

        {/* Center: Properties Grid */}
        <div className="min-w-0">
          <PropertyGrid properties={properties} loading={loading} />
        </div>

        {/* Right: Sticky Leaflet Map */}
        <div className="lg:sticky lg:top-28 h-[400px] lg:h-[calc(100vh-180px)] z-10">
          <PropertyMap properties={properties} />
        </div>
      </div>
    </div>
  )
}
