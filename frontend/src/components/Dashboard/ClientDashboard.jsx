import { useState, useEffect } from 'react'
import { contactApi, getImageUrl } from '../../services/api'
import { useWishlist } from '../../context/WishlistContext'
import { FaHeart, FaEnvelope, FaClock, FaTrashAlt, FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaExternalLinkAlt, FaAngleDown, FaAngleUp, FaCalendarAlt } from 'react-icons/fa'
import { Link, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import BookingList from './BookingList'
import Inbox from './Inbox'

export default function ClientDashboard() {
  const { wishlist, toggleWishlist, loading: wishlistLoading } = useWishlist()
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  
  const location = useLocation()
  const queryTab = new URLSearchParams(location.search).get('tab')
  const [activeTab, setActiveTab] = useState(queryTab || 'wishlist')

  useEffect(() => {
    if (queryTab) {
      setActiveTab(queryTab)
    }
  }, [queryTab])
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const inquiriesRes = await contactApi.getMessages()
      setInquiries(inquiriesRes?.data || [])
    } catch (error) {
      toast.error('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }


  const handleRemoveFromWishlist = async (propertyId) => {
    try {
      await toggleWishlist(propertyId)
    } catch (error) {
      toast.error('Failed to remove property from wishlist')
    }
  }

  const toggleExpandInquiry = (id) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  if (loading || wishlistLoading) {
    return (
      <div className="flex justify-center items-center py-20 bg-white border border-slate-200 rounded-[32px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Client Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Wishlist */}
        <div className="group rounded-[32px] border border-white bg-white/70 backdrop-blur-md p-6 shadow-soft hover:shadow-lg transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center text-xl shrink-0">
              <FaHeart />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Saved Properties</p>
              <h3 className="text-2xl font-bold text-luxury mt-1">{wishlist.length}</h3>
            </div>
          </div>
        </div>

        {/* Card 2: Inquiries */}
        <div className="group rounded-[32px] border border-white bg-white/70 backdrop-blur-md p-6 shadow-soft hover:shadow-lg transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
              <FaEnvelope />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Inquiries Sent</p>
              <h3 className="text-2xl font-bold text-luxury mt-1">{inquiries.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'wishlist' 
              ? 'border-gold text-gold' 
              : 'border-transparent text-slate-500 hover:text-luxury'
          }`}
        >
          My Wishlist ({wishlist.length})
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'inquiries' 
              ? 'border-gold text-gold' 
              : 'border-transparent text-slate-500 hover:text-luxury'
          }`}
        >
          Sent Inquiries ({inquiries.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'bookings' 
              ? 'border-gold text-gold' 
              : 'border-transparent text-slate-500 hover:text-luxury'
          }`}
        >
          My Viewings
        </button>
        <button
          onClick={() => setActiveTab('inbox')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'inbox' 
              ? 'border-gold text-gold' 
              : 'border-transparent text-slate-500 hover:text-luxury'
          }`}
        >
          Messages Inbox
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'wishlist' ? (
        wishlist.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-[32px] p-8 shadow-soft">
            <p className="text-slate-400 font-medium">Your wishlist is currently empty.</p>
            <Link to="/properties" className="inline-block mt-4 bg-gold hover:bg-yellow-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors">
              Explore Properties
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((prop) => {
              const id = prop._id || prop.id
              const isSale = prop.listingType === 'sell' || prop.listingType === 'sale'
              return (
                <div key={id} className="group bg-white border border-slate-200 rounded-[32px] shadow-soft overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between">
                  <div>
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <img
                        src={getImageUrl(prop.images?.[0] || '')}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm text-white ${
                          isSale ? 'bg-gold' : 'bg-emerald-600'
                        }`}>
                          For {isSale ? 'Sale' : 'Rent'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5 space-y-3">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-gold uppercase tracking-wider">{prop.propertyType}</span>
                          <span className="text-base font-bold text-luxury">${prop.price?.toLocaleString()}</span>
                        </div>
                        <h4 className="font-semibold text-luxury mt-1 truncate">{prop.title}</h4>
                        <div className="flex items-center gap-1 text-slate-400 text-xs mt-1.5 font-medium">
                          <FaMapMarkerAlt className="text-[10px] text-gold" />
                          <span className="truncate">{prop.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-slate-500 text-xs font-semibold">
                        <span className="flex items-center gap-1"><FaBed className="text-slate-400" /> {prop.bedrooms} Bed</span>
                        <span className="flex items-center gap-1"><FaBath className="text-slate-400" /> {prop.bathrooms} Bath</span>
                        <span className="flex items-center gap-1"><FaRulerCombined className="text-slate-400" /> {prop.area} sq ft</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex gap-2">
                    <Link 
                      to={`/property/${id}`} 
                      className="flex-1 py-2.5 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <FaExternalLinkAlt className="text-[10px]" /> Details
                    </Link>
                    <button
                      onClick={() => handleRemoveFromWishlist(id)}
                      className="p-2.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                      title="Remove from Wishlist"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : activeTab === 'inquiries' ? (
        inquiries.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-[32px] p-8 shadow-soft">
            <p className="text-slate-400 font-medium">You have not submitted any inquiries yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[32px] shadow-soft overflow-hidden">
            <div className="divide-y divide-slate-100">
              {inquiries.map((inq) => {
                const isExpanded = expandedId === (inq._id || inq.id)
                const dateStr = new Date(inq.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })

                return (
                  <div key={inq._id || inq.id} className="transition-colors duration-200 hover:bg-slate-50/20">
                    <div 
                      onClick={() => toggleExpandInquiry(inq._id || inq.id)}
                      className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <FaEnvelope className="text-sm" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-luxury text-sm">Inquiry regarding listing</span>
                            {inq.property && (
                              <span className="bg-gold/10 text-gold px-2 py-0.5 rounded text-[10px] font-bold">
                                {inq.property.title}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 text-xs mt-1">Message subject: <span className="capitalize">{inq.subject || 'general'}</span></p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                        <div className="text-right text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                          <FaClock className="text-[10px]" /> {dateStr}
                        </div>
                        <div>
                          {isExpanded ? <FaAngleUp className="text-slate-400" /> : <FaAngleDown className="text-slate-400" />}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 border-t border-slate-50 space-y-4">
                        <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl space-y-3">
                          <div className="space-y-1">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">My Message</h4>
                            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{inq.message}</p>
                          </div>
                          {inq.property && (
                            <div className="pt-3 border-t border-slate-200 flex justify-between items-center gap-4">
                              <div>
                                <h5 className="font-semibold text-luxury text-xs">{inq.property.title}</h5>
                                <p className="text-[10px] text-slate-400 mt-0.5">{inq.property.location}</p>
                              </div>
                              <Link 
                                to={`/property/${inq.property._id || inq.property.id}`} 
                                className="px-4 py-2 bg-luxury hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors"
                              >
                                View Listing
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      ) : activeTab === 'bookings' ? (
        <BookingList role="user" />
      ) : (
        <Inbox />
      )}
    </div>
  )
}
