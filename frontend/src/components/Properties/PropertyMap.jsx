import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import { getImageUrl } from '../../services/api'

// Leaflet default CSS overrides
import 'leaflet/dist/leaflet.css'

// Custom gold marker icon matching the brand guidelines
const goldIcon = L.divIcon({
  html: `<div class="w-8 h-8 rounded-full bg-[#c6a43f] border-2 border-white flex items-center justify-center shadow-md transition-all hover:scale-110">
           <div class="w-3.5 h-3.5 rounded-full bg-[#111827]"></div>
         </div>`,
  className: 'custom-gold-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
})

// Component to dynamically fit map boundaries to active markers
function ChangeView({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords && coords.length > 0) {
      if (coords.length === 1) {
        map.setView(coords[0], 12)
      } else {
        const bounds = L.latLngBounds(coords)
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
      }
    }
  }, [coords, map])
  return null
}

export default function PropertyMap({ properties }) {
  // Get coordinates directly from the database (no fuzzy fallbacks) and validate Sri Lanka boundaries
  const getCoords = (property) => {
    const lat = Number(property.coordinates?.lat)
    const lng = Number(property.coordinates?.lng)
    
    if (
      !isNaN(lat) && 
      !isNaN(lng) && 
      lat >= 5.5 && 
      lat <= 10.0 && 
      lng >= 79.0 && 
      lng <= 82.5
    ) {
      return [lat, lng]
    }
    return null
  }

  const validMarkers = properties
    .map(p => {
      const coords = getCoords(p)
      if (!coords) return null
      return {
        property: p,
        coords
      }
    })
    .filter(Boolean)

  const allCoords = validMarkers.map(m => m.coords)
  // Default to Colombo, Sri Lanka if no properties have real coordinates yet
  const defaultCenter = allCoords[0] || [6.9271, 79.8612]

  return (
    <div className="w-full h-full min-h-[350px] lg:min-h-[500px] rounded-3xl overflow-hidden border border-slate-200 shadow-soft relative z-10">
      <MapContainer
        center={defaultCenter}
        zoom={8}
        className="w-full h-full"
        scrollWheelZoom={true}
        minZoom={7}
        maxZoom={18}
        maxBounds={[[5.5, 79.0], [10.0, 82.5]]}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {validMarkers.map(({ property, coords }) => {
          const id = property.id || property._id
          const rawImage = (property.images && property.images[0]) || property.image || ''
          const price = property.price?.toLocaleString() || 0
          
          return (
            <Marker key={id} position={coords} icon={goldIcon}>
              <Popup className="custom-leaflet-popup">
                <div className="w-48 overflow-hidden rounded-xl bg-white text-xs font-sans">
                  <img 
                    src={getImageUrl(rawImage)} 
                    alt={property.title} 
                    className="w-full h-24 object-cover" 
                  />
                  <div className="p-3 space-y-1">
                    <h4 className="font-bold text-luxury truncate">{property.title}</h4>
                    <p className="text-slate-500 font-medium truncate">{property.location}</p>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[#c6a43f] font-bold text-sm">${price}</span>
                      <Link 
                        to={`/property/${id}`} 
                        className="text-[10px] font-bold bg-[#111827] text-white px-2 py-1 rounded hover:bg-black transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
        
        <ChangeView coords={allCoords} />
      </MapContainer>
    </div>
  )
}
