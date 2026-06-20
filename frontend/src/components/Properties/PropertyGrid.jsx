import React from 'react'
import PropertyCard from './PropertyCard'
import Pagination from './Pagination'

export default function PropertyGrid({ properties, loading }) {
  if (loading) return <div className="py-20 text-center text-slate-500 font-semibold">Loading properties...</div>

  if (!properties || !properties.length) {
    return <div className="py-20 text-center text-slate-500 font-semibold">No properties found.</div>
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 md:grid-cols-1 xl:grid-cols-2">
        {properties.map((p) => (
          <PropertyCard key={p.id || p._id} property={p} />
        ))}
      </div>
      <Pagination />
    </section>
  )
}
