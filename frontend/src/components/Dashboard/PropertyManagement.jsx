import { useState, useEffect } from 'react'
import { fetchProperties, propertyApi, uploadImages, getImageUrl } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { FaEdit, FaTrash, FaPlus, FaTh, FaList, FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaTimes, FaSearch, FaCheck } from 'react-icons/fa'
import toast from 'react-hot-toast'

const DEFAULT_FEATURES = [
  'Swimming Pool',
  'Private Gym',
  '24/7 Security',
  'Spacious Garage',
  'Central HVAC',
  'Gourmet Kitchen',
  'Smart Home System',
  'Private Garden',
  'Elevator',
  'Ocean View'
]

export default function PropertyManagement({ isAdmin = false, onLoad }) {
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [listingFilter, setListingFilter] = useState('all')
  const [viewMode, setViewMode] = useState('table') // 'table' or 'grid'

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    location: '',
    propertyType: 'apartment',
    listingType: 'sell',
    images: [],
    features: [],
    featured: false,
    virtualTourUrl: '',
    videoUrl: '',
    lat: '',
    lng: ''
  })

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    try {
      setLoading(true)
      // If owner (not admin), we filter properties by agent in the backend
      const queryParam = isAdmin 
        ? '?adminView=true&limit=100' 
        : `?agent=${user?.id || user?._id}&limit=100`
      
      const data = await fetchProperties(queryParam)
      const list = Array.isArray(data) ? data : data?.data || []
      setProperties(list)
      if (onLoad) {
        onLoad(list)
      }
    } catch (error) {
      toast.error('Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveProperty = async (id) => {
    try {
      await propertyApi.updateProperty(id, { isApproved: true })
      toast.success('Property listing approved!')
      loadProperties()
    } catch (error) {
      toast.error(error.message || 'Failed to approve property')
    }
  }

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      bedrooms: '',
      bathrooms: '',
      area: '',
      location: '',
      propertyType: 'apartment',
      listingType: 'sell',
      images: [],
      features: [],
      featured: false,
      virtualTourUrl: '',
      videoUrl: '',
      lat: '',
      lng: ''
    })
    setIsEditing(false)
    setEditingId(null)
    setShowForm(true)
  }

  const handleGeocode = async () => {
    if (!formData.location.trim()) {
      toast.error('Please enter a location address first.')
      return
    }
    try {
      setGeocoding(true)
      const query = encodeURIComponent(formData.location.trim())
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=lk`)
      const data = await response.json()
      
      if (data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          lat: parseFloat(data[0].lat).toFixed(6),
          lng: parseFloat(data[0].lon).toFixed(6)
        }))
        toast.success(`Coordinates auto-detected: ${parseFloat(data[0].lat).toFixed(4)}, ${parseFloat(data[0].lon).toFixed(4)}`)
      } else {
        toast.error('Could not auto-locate this address within Sri Lanka. Please type coordinates manually.')
      }
    } catch (err) {
      toast.error('Geocoding service unavailable. Please type coordinates manually.')
    } finally {
      setGeocoding(false)
    }
  }

  const handleOpenEdit = (prop) => {
    setFormData({
      title: prop.title || '',
      description: prop.description || '',
      price: prop.price || '',
      bedrooms: prop.bedrooms || '',
      bathrooms: prop.bathrooms || '',
      area: prop.area || '',
      location: prop.location || '',
      propertyType: prop.propertyType || 'apartment',
      listingType: prop.listingType || 'sell',
      images: prop.images || [],
      features: prop.features || [],
      featured: prop.featured || false,
      virtualTourUrl: prop.virtualTourUrl || '',
      videoUrl: prop.videoUrl || '',
      lat: prop.coordinates?.lat || '',
      lng: prop.coordinates?.lng || ''
    })
    setIsEditing(true)
    setEditingId(prop._id || prop.id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.images.length === 0) {
      toast.error('Please upload at least one image.')
      return
    }

    // Validate manual coordinates if provided (must be within Sri Lanka boundaries)
    if (formData.lat || formData.lng) {
      const latVal = Number(formData.lat)
      const lngVal = Number(formData.lng)
      if (isNaN(latVal) || latVal < 5.5 || latVal > 10.0) {
        toast.error('Latitude must be a valid number within Sri Lanka boundaries (5.5 to 10.0).')
        return
      }
      if (isNaN(lngVal) || lngVal < 79.0 || lngVal > 82.5) {
        toast.error('Longitude must be a valid number within Sri Lanka boundaries (79.0 to 82.5).')
        return
      }
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms || 0),
        bathrooms: Number(formData.bathrooms || 0),
        area: Number(formData.area),
        location: formData.location,
        propertyType: formData.propertyType,
        listingType: formData.listingType,
        images: formData.images,
        features: formData.features,
        featured: formData.featured,
        virtualTourUrl: formData.virtualTourUrl,
        videoUrl: formData.videoUrl,
        coordinates: {
          lat: formData.lat ? Number(formData.lat) : undefined,
          lng: formData.lng ? Number(formData.lng) : undefined
        }
      }

      if (isEditing) {
        await propertyApi.updateProperty(editingId, payload)
        toast.success('Property updated successfully')
      } else {
        await propertyApi.addProperty(payload)
        toast.success('Property added successfully')
      }
      setShowForm(false)
      loadProperties()
    } catch (error) {
      toast.error(error.message || 'Failed to save property')
    }
  }

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    if (formData.images.length + files.length > 5) {
      toast.error('You can upload a maximum of 5 images.')
      return
    }

    const uploadData = new FormData()
    files.forEach((file) => {
      uploadData.append('images', file)
    })

    try {
      setUploading(true)
      const res = await uploadImages(uploadData)
      if (res.success && res.urls) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...res.urls]
        }))
        toast.success('Images uploaded successfully')
      }
    } catch (error) {
      toast.error(error.message || 'Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }))
  }

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) return
    try {
      await propertyApi.deleteProperty(id)
      toast.success('Property deleted successfully')
      loadProperties()
    } catch (error) {
      toast.error('Failed to delete property')
    }
  }

  // Filter listings locally for real-time search & filters
  const filteredProperties = properties.filter(prop => {
    const matchesSearch = prop.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prop.location?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || prop.propertyType === typeFilter
    const matchesListing = listingFilter === 'all' || prop.listingType === listingFilter
    return matchesSearch && matchesType && matchesListing
  })

  return (
    <section className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-soft">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-gold focus:bg-white transition-all text-sm"
            />
            <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-gold focus:bg-white transition-all text-sm text-slate-600 font-medium cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
          </select>

          {/* Listing Type Filter */}
          <select
            value={listingFilter}
            onChange={(e) => setListingFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-gold focus:bg-white transition-all text-sm text-slate-600 font-medium cursor-pointer"
          >
            <option value="all">All Modes</option>
            <option value="sell">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggles */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-sm transition-all ${
                viewMode === 'table' ? 'bg-white shadow-sm text-gold' : 'text-slate-500 hover:text-luxury'
              }`}
            >
              <FaList />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-sm transition-all ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-gold' : 'text-slate-500 hover:text-luxury'
              }`}
            >
              <FaTh />
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-luxury hover:bg-black text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors text-sm"
          >
            <FaPlus className="text-xs" /> Add Property
          </button>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white border border-slate-100 rounded-3xl">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold"></div>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl">
          <p className="text-slate-500 font-medium">No properties match your active filters.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white border border-slate-200 rounded-3xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th className="py-4 px-6">Property</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Type & Listing</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProperties.map((prop) => (
                  <tr key={prop.id || prop._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(prop.images?.[0] || '')}
                          alt={prop.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                        />
                        <div>
                          <p className="font-semibold text-luxury">{prop.title}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium">
                            <span>{prop.area} sq ft</span>
                            <span>•</span>
                            <span>{prop.bedrooms} Bed / {prop.bathrooms} Bath</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{prop.location}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-semibold capitalize">
                          {prop.propertyType}
                        </span>
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold capitalize ${
                          prop.listingType === 'sell' ? 'bg-gold/10 text-gold' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          For {prop.listingType === 'sell' ? 'Sale' : 'Rent'}
                        </span>
                        {prop.featured && (
                          <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs font-semibold">
                            Featured
                          </span>
                        )}
                        {prop.isApproved ? (
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-xs font-semibold">
                            Approved
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-md text-xs font-semibold animate-pulse">
                            Pending Approval
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-luxury">
                      ${prop.price?.toLocaleString()}
                      {prop.listingType === 'rent' && <span className="text-slate-400 text-xs font-normal"> / mo</span>}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isAdmin && !prop.isApproved && (
                          <button
                            onClick={() => handleApproveProperty(prop.id || prop._id)}
                            className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                            title="Approve Listing"
                          >
                            <FaCheck className="text-base" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(prop)}
                          className="p-2 hover:bg-slate-100 text-slate-600 hover:text-gold rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit className="text-base" />
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(prop.id || prop._id)}
                          className="p-2 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((prop) => (
            <div key={prop.id || prop._id} className="group bg-white border border-slate-200 rounded-3xl shadow-soft overflow-hidden hover:shadow-lg transition-all">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={getImageUrl(prop.images?.[0] || '')}
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                  <div className="flex gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
                      prop.listingType === 'sell' ? 'bg-gold text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      For {prop.listingType === 'sell' ? 'Sale' : 'Rent'}
                    </span>
                    {prop.featured && (
                      <span className="bg-purple-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                        Featured
                      </span>
                    )}
                  </div>
                  {!prop.isApproved && (
                    <span className="bg-amber-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm animate-pulse capitalize">
                      Pending Approval
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gold uppercase tracking-wider">{prop.propertyType}</span>
                    <span className="text-lg font-bold text-luxury">
                      ${prop.price?.toLocaleString()}
                      {prop.listingType === 'rent' && <span className="text-slate-400 text-xs font-normal">/mo</span>}
                    </span>
                  </div>
                  <h3 className="font-semibold text-luxury mt-1 group-hover:text-gold transition-colors text-base truncate">{prop.title}</h3>
                  <div className="flex items-center gap-1 text-slate-500 text-xs mt-1.5 font-medium">
                    <FaMapMarkerAlt className="text-slate-400 shrink-0" />
                    <span className="truncate">{prop.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-slate-600 text-xs font-medium">
                  <span className="flex items-center gap-1.5"><FaBed className="text-slate-400" /> {prop.bedrooms} Bed</span>
                  <span className="flex items-center gap-1.5"><FaBath className="text-slate-400" /> {prop.bathrooms} Bath</span>
                  <span className="flex items-center gap-1.5"><FaRulerCombined className="text-slate-400" /> {prop.area} sq ft</span>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-50">
                  {isAdmin && !prop.isApproved && (
                    <button
                      onClick={() => handleApproveProperty(prop.id || prop._id)}
                      className="py-2 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all flex items-center justify-center gap-1"
                    >
                      <FaCheck /> Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenEdit(prop)}
                    className="flex-1 py-2 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProperty(prop.id || prop._id)}
                    className="py-2 px-3 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Slide-over Glassmorphism Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-luxury/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowForm(false)}
          ></div>

          {/* Modal Content Drawer */}
          <div className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-slide-in">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-luxury">{isEditing ? 'Edit Property' : 'Add Property'}</h2>
                <p className="text-xs text-slate-500 mt-1">Provide premium property specifications for listing.</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-luxury"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} id="property-form" className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Property Title</label>
                <input
                  type="text"
                  placeholder="E.g., Luxurious Villa with Infinity Pool"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Description</label>
                <textarea
                  placeholder="Describe the details, architectural specs, local neighborhood highlights..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Price ($ USD)</label>
                  <input
                    type="number"
                    placeholder="Price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="1"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Area (Sq Ft)</label>
                  <input
                    type="number"
                    placeholder="Area"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    required
                    min="1"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Bedrooms</label>
                  <input
                    type="number"
                    placeholder="E.g., 3"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    required
                    min="0"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Bathrooms</label>
                  <input
                    type="number"
                    placeholder="E.g., 2"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    required
                    min="0"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Location Address</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="E.g., Beverly Hills, CA"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleGeocode}
                    disabled={geocoding}
                    className="px-4 py-2.5 bg-[#c6a43f] hover:bg-yellow-600 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-75"
                  >
                    {geocoding ? 'Detecting...' : 'Auto-Locate'}
                  </button>
                </div>
              </div>



              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Property Type</label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold bg-white cursor-pointer text-sm"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="land">Land</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Listing Type</label>
                  <select
                    value={formData.listingType}
                    onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold bg-white cursor-pointer text-sm"
                  >
                    <option value="sell">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">3D Virtual Tour URL</label>
                  <input
                    type="url"
                    placeholder="Matterport or iframe URL link"
                    value={formData.virtualTourUrl || ''}
                    onChange={(e) => setFormData({ ...formData, virtualTourUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Video Walkthrough URL</label>
                  <input
                    type="url"
                    placeholder="YouTube, Vimeo, or video URL"
                    value={formData.videoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Property Images (Up to 5)
                </label>
                
                <div className="relative border-2 border-dashed border-slate-200 hover:border-gold rounded-2xl p-6 transition-colors flex flex-col items-center justify-center bg-slate-50 cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading || formData.images.length >= 5}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <FaPlus className="text-2xl text-slate-400 mb-2" />
                  <p className="text-xs text-slate-500 font-semibold">
                    {uploading ? 'Uploading...' : 'Click or Drag images to upload'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    PNG, JPG, JPEG, WEBP up to 5MB (Max 5 images)
                  </p>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-5 gap-3 mt-4">
                    {formData.images.map((url, idx) => (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
                        <img
                          src={getImageUrl(url)}
                          alt={`Upload preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        >
                          <FaTrash className="text-sm text-red-400 hover:text-red-300" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Property Features */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Amenities & Key Features
                </label>
                
                {/* Predefined Features Grid */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {DEFAULT_FEATURES.map((feature) => {
                    const isSelected = formData.features?.includes(feature)
                    return (
                      <button
                        type="button"
                        key={feature}
                        onClick={() => {
                          if (isSelected) {
                            setFormData(prev => ({
                              ...prev,
                              features: prev.features.filter(f => f !== feature)
                            }))
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              features: [...(prev.features || []), feature]
                            }))
                          }
                        }}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-gold bg-gold/10 text-gold font-semibold'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {feature}
                      </button>
                    )
                  })}
                </div>

                {/* Custom Features */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom feature (e.g., Wine Cellar)"
                    id="custom-feature-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const val = e.target.value.trim()
                        if (val && !formData.features?.includes(val)) {
                          setFormData(prev => ({
                            ...prev,
                            features: [...(prev.features || []), val]
                          }))
                          e.target.value = ''
                        }
                      }
                    }}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-gold text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('custom-feature-input')
                      const val = input?.value?.trim()
                      if (val && !formData.features?.includes(val)) {
                        setFormData(prev => ({
                          ...prev,
                          features: [...(prev.features || []), val]
                        }))
                        input.value = ''
                      }
                    }}
                    className="px-4 py-2 bg-gold hover:bg-yellow-600 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Custom tags chosen display */}
                {formData.features?.filter(f => !DEFAULT_FEATURES.includes(f)).length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Custom Added Features:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.features
                        .filter(f => !DEFAULT_FEATURES.includes(f))
                        .map((feature) => (
                          <span
                            key={feature}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {feature}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  features: prev.features.filter(f => f !== feature)
                                }))
                              }}
                              className="text-[10px] text-slate-400 hover:text-red-500 font-bold ml-1"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="featured-checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-gold border-slate-300 rounded focus:ring-gold"
                  />
                  <label htmlFor="featured-checkbox" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                    Feature this listing on Home Page
                  </label>
                </div>
              )}
            </form>

            {/* Footer buttons */}
            <div className="p-6 border-t border-slate-100 flex items-center gap-3 bg-slate-50">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 text-center border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-semibold transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="property-form"
                className="flex-1 py-3 bg-luxury hover:bg-black text-white rounded-xl font-semibold transition-colors shadow-sm text-sm"
              >
                {isEditing ? 'Save Changes' : 'Create Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
