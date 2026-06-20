import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingApi, getImageUrl, chatApi } from '../../services/api'
import { FaCalendarAlt, FaClock, FaHome, FaAngleDown, FaAngleUp, FaCheckCircle, FaTimesCircle, FaUser, FaPhone, FaEnvelope, FaComments } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function BookingList({ role = 'user' }) {
  const navigate = useNavigate()
  const [startingChat, setStartingChat] = useState(false)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  const handleChatWithParticipant = async (recipientId) => {
    if (!recipientId) {
      toast.error('Recipient account details not found.')
      return
    }

    try {
      setStartingChat(true)
      const res = await chatApi.startConversation({
        recipientId
      })

      if (res?.success) {
        toast.success('Conversation thread initialized!')
        navigate('/dashboard?tab=inbox')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to start conversation thread.')
    } finally {
      setStartingChat(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const res = await bookingApi.getBookings()
      setBookings(res?.data || [])
    } catch (error) {
      toast.error('Failed to load viewing bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      await bookingApi.updateBookingStatus(id, status)
      toast.success(`Booking ${status} successfully`)
      loadBookings()
    } catch (error) {
      toast.error(error.message || `Failed to update booking status to ${status}`)
    }
  }

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 bg-white border border-slate-200 rounded-[32px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold"></div>
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16 bg-white border border-slate-200 rounded-[32px] p-8 shadow-soft">
        <p className="text-slate-400 font-medium">No viewing schedules found.</p>
      </div>
    )
  }

  const isAgent = role === 'agent'
  const isAdmin = role === 'admin'

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-[32px] shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-serif font-bold text-luxury">Viewing Bookings</h3>
          <p className="text-xs text-slate-400 mt-1">
            {isAgent 
              ? 'Manage viewing schedules and virtual tour requests from potential buyers.' 
              : 'Review and track status of viewing schedules you requested.'}
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {bookings.map((booking) => {
            const isExpanded = expandedId === (booking._id || booking.id)
            const dateStr = new Date(booking.date).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })

            const statusColors = {
              pending: 'bg-yellow-50 text-yellow-600 border border-yellow-200',
              confirmed: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
              cancelled: 'bg-red-50 text-red-600 border border-red-200'
            }

            return (
              <div 
                key={booking._id || booking.id} 
                className={`transition-colors duration-200 ${isExpanded ? 'bg-slate-50/50' : 'hover:bg-slate-50/30'}`}
              >
                {/* Header row */}
                <div 
                  onClick={() => toggleExpand(booking._id || booking.id)}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
                      <FaCalendarAlt className="text-sm" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-luxury text-sm">
                          {isAgent ? booking.name : `Viewing Request`}
                        </span>
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                          {booking.tourType || 'in-person'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${statusColors[booking.status || 'pending']}`}>
                          {booking.status || 'pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {booking.property && (
                          <span className="flex items-center gap-1 text-gold text-[10px] font-bold uppercase tracking-wider bg-gold/5 px-2 py-0.5 rounded">
                            <FaHome className="text-[10px]" /> {booking.property.title}
                          </span>
                        )}
                        <span className="text-slate-400 text-xs flex items-center gap-1 font-medium">
                          <FaClock className="text-[10px]" /> {booking.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                    <div className="text-right text-xs text-slate-400 font-semibold">
                      {dateStr}
                    </div>
                    <div>
                      {isExpanded ? (
                        <FaAngleUp className="text-slate-400" />
                      ) : (
                        <FaAngleDown className="text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-50 animate-fade-in space-y-4">
                    <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-4 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contact Information</h4>
                          <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                            <p className="flex items-center gap-2"><FaUser className="text-slate-400" /> <span className="font-bold text-luxury">{booking.name}</span></p>
                            <p className="flex items-center gap-2"><FaEnvelope className="text-slate-400" /> {booking.email}</p>
                            {booking.phone && <p className="flex items-center gap-2"><FaPhone className="text-slate-400" /> {booking.phone}</p>}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Schedule Details</h4>
                          <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                            <p><span className="text-slate-400">Date:</span> {dateStr}</p>
                            <p><span className="text-slate-400">Time Slot:</span> {booking.time}</p>
                            <p><span className="text-slate-400">Mode:</span> <span className="capitalize">{booking.tourType || 'in-person'}</span></p>
                          </div>
                        </div>
                      </div>

                      {booking.property && (
                        <div className="bg-cream p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200/50">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1"><FaHome className="text-[9px] text-gold" /> Listing Details</span>
                            <h5 className="font-semibold text-luxury text-sm mt-0.5">{booking.property.title}</h5>
                            <p className="text-xs text-slate-400 mt-0.5">{booking.property.location}</p>
                          </div>
                          <div className="shrink-0 flex items-center gap-3">
                            <span className="text-sm font-bold text-luxury">${booking.property.price?.toLocaleString()}</span>
                            <a 
                              href={`/property/${booking.property._id || booking.property.id}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="px-4 py-2 bg-luxury hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors"
                            >
                              View Details
                            </a>
                          </div>
                        </div>
                      )}

                      {(isAgent || isAdmin) && booking.status === 'pending' && (
                        <div className="pt-2 flex items-center gap-3">
                          <button
                            onClick={() => handleUpdateStatus(booking._id || booking.id, 'confirmed')}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <FaCheckCircle className="text-sm" /> Confirm Viewing
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(booking._id || booking.id, 'cancelled')}
                            className="px-5 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5"
                          >
                            <FaTimesCircle className="text-sm" /> Cancel
                          </button>
                        </div>
                      )}

                      {/* Direct Platform Chat Action */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
                        {isAgent ? (
                          // Agent wants to chat with the client (user)
                          booking.user ? (
                            <button
                              type="button"
                              onClick={() => handleChatWithParticipant(booking.user._id || booking.user.id)}
                              disabled={startingChat}
                              className="px-4 py-2 bg-gold hover:bg-yellow-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:bg-slate-300 hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <FaComments className="text-sm" /> Chat with Client
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-semibold italic">Client booked as visitor (offline chat unavailable)</span>
                          )
                        ) : (
                          // Client wants to chat with the listing agent
                          booking.agent && (
                            <button
                              type="button"
                              onClick={() => handleChatWithParticipant(booking.agent._id || booking.agent.id)}
                              disabled={startingChat}
                              className="px-4 py-2 bg-gold hover:bg-yellow-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:bg-slate-300 hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <FaComments className="text-sm" /> Chat with Listing Agent
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
