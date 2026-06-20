import { useState, useEffect } from 'react'
import { contactApi } from '../../services/api'
import { FaEnvelope, FaClock, FaHome, FaAngleDown, FaAngleUp, FaTag } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function MessageInbox() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const res = await contactApi.getMessages()
      setMessages(res?.data || [])
    } catch (error) {
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
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

  if (messages.length === 0) {
    return (
      <div className="text-center py-16 bg-white border border-slate-200 rounded-[32px] p-8 shadow-soft">
        <p className="text-slate-400 font-medium">You have not received any inquiries yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-[32px] shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-serif font-bold text-luxury">Inquiry Inbox</h3>
          <p className="text-xs text-slate-400 mt-1">Review contact requests, property inquiries, and buy/sell offers.</p>
        </div>

        <div className="divide-y divide-slate-100">
          {messages.map((msg) => {
            const isExpanded = expandedId === (msg._id || msg.id)
            const dateStr = new Date(msg.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })

            return (
              <div 
                key={msg._id || msg.id} 
                className={`transition-colors duration-200 ${isExpanded ? 'bg-slate-50/50' : 'hover:bg-slate-50/30'}`}
              >
                {/* Header row */}
                <div 
                  onClick={() => toggleExpand(msg._id || msg.id)}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
                      <FaEnvelope className="text-sm" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-luxury text-sm">{msg.name}</span>
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-slate-400 text-xs truncate max-w-[200px]">{msg.email}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                          {msg.subject || 'general'}
                        </span>
                        {msg.property && (
                          <span className="flex items-center gap-1 text-gold text-[10px] font-bold uppercase tracking-wider bg-gold/5 px-2 py-0.5 rounded">
                            <FaHome className="text-[10px]" /> Property Inquiry
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                    <div className="text-right text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                      <FaClock className="text-[10px]" /> {dateStr}
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
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Client Message</h4>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{msg.message}</p>
                      </div>

                      {msg.property && (
                        <div className="bg-cream p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200/50">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1"><FaTag className="text-[9px] text-gold" /> Referenced Listing</span>
                            <h5 className="font-semibold text-luxury text-sm mt-0.5">{msg.property.title}</h5>
                            <p className="text-xs text-slate-400 mt-0.5">{msg.property.location}</p>
                          </div>
                          <div className="shrink-0 flex items-center gap-3">
                            <span className="text-sm font-bold text-luxury">${msg.property.price?.toLocaleString()}</span>
                            <a 
                              href={`/property/${msg.property._id || msg.property.id}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="px-4 py-2 bg-luxury hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors"
                            >
                              View Details
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="pt-2 flex items-center gap-3">
                        <a 
                          href={`mailto:${msg.email}?subject=Re: LuxEstate Inquiry (${msg.subject || 'General'})`}
                          className="px-6 py-2.5 bg-gold hover:bg-yellow-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-colors shadow-sm flex items-center gap-2"
                        >
                          <FaEnvelope className="text-[10px]" /> Reply via Email
                        </a>
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
