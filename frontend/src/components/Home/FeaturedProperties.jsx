import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PropertyCard from '../Properties/PropertyCard'
import { fetchProperties } from '../../services/api'

const FeaturedProperties = () => {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const res = await fetchProperties('/featured')
        setProperties(res?.data || res || [])
      } catch (error) {
        console.error('Error loading properties:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProperties()
  }, [])

  if (loading) {
    return (
      <div className="py-20 bg-cream flex flex-col justify-center items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
        <p className="text-slate-400 font-medium text-sm">Curating featured properties...</p>
      </div>
    )
  }

  return (
    <section className="py-20 bg-cream">
      <div className="luxury-container">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="section-title">Featured Properties</h2>
          <p className="section-subtitle">
            Discover our most exclusive and luxurious properties available for sale and rent
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property, index) => (
            <motion.div
              key={property._id || property.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <PropertyCard property={property} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedProperties