import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEnvelope, FaPhone, FaAward, FaWhatsapp, FaComments } from 'react-icons/fa'
import { getImageUrl, chatApi } from '../../services/api'
import toast from 'react-hot-toast'
import AgentReviewsModal from './AgentReviewsModal'

export default function AgentCard({ agent }) {
  const navigate = useNavigate()
  const [startingChat, setStartingChat] = useState(false)
  const [showReviewsModal, setShowReviewsModal] = useState(false)

  const [averageRating, setAverageRating] = useState(agent?.averageRating || 0)
  const [reviewCount, setReviewCount] = useState(agent?.reviewCount || 0)

  useEffect(() => {
    if (agent) {
      setAverageRating(agent.averageRating || 0)
      setReviewCount(agent.reviewCount || 0)
    }
  }, [agent])

  if (!agent) return null;
  const { name, role, email, phone, avatar, sales, propertyCount } = agent

  const getWhatsAppNumber = (phoneStr) => {
    if (!phoneStr) return '';
    let cleaned = phoneStr.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '94' + cleaned.substring(1);
    } else if (cleaned.length === 9 && !cleaned.startsWith('94')) {
      cleaned = '94' + cleaned;
    }
    return cleaned;
  }

  const getIsOwnProfile = () => {
    const storedUser = window.localStorage.getItem('luxestate-user')
    if (!storedUser) return false
    try {
      const parsed = JSON.parse(storedUser)
      const currentUserId = parsed?._id || parsed?.id
      const agentId = agent._id || agent.id
      return currentUserId && agentId && currentUserId === agentId
    } catch (e) {
      return false
    }
  }

  const isOwnProfile = getIsOwnProfile()

  const handleChatOnPlatform = async () => {
    const storedUser = window.localStorage.getItem('luxestate-user')
    if (!storedUser) {
      toast.error('Please sign in to chat on the platform.')
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }

    try {
      setStartingChat(true)
      const recipientId = agent._id || agent.id

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

  return (
    <article className="rounded-[32px] bg-white p-6 shadow-soft border border-slate-200/80 hover:shadow-lg transition-all text-center flex flex-col justify-between h-[460px] group relative overflow-hidden">
      {/* Background soft light accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-all duration-500"></div>
      
      <div>
        <div className="relative mx-auto mb-4 h-28 w-28 rounded-full overflow-hidden border-2 border-gold/15 p-1 group-hover:border-gold transition-all duration-300">
          <img 
            src={getImageUrl(avatar) || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'} 
            alt={name} 
            className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <h3 className="text-xl font-serif font-bold text-luxury">{name}</h3>
        
        {/* Rating Stars row */}
        <div className="flex items-center justify-center gap-1.5 mt-1 text-xs">
          {reviewCount > 0 ? (
            <div className="flex items-center gap-1">
              <span className="text-amber-500 text-sm">★</span>
              <span className="font-bold text-luxury">{averageRating}</span>
              <span className="text-slate-400">({reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'})</span>
            </div>
          ) : (
            <span className="text-slate-400 font-medium">No reviews yet</span>
          )}
        </div>

        {/* View Reviews / Write Review Link */}
        <div className="mt-0.5">
          <button
            type="button"
            onClick={() => setShowReviewsModal(true)}
            className="text-[11px] font-bold text-gold hover:text-yellow-600 underline transition-colors cursor-pointer"
          >
            {reviewCount > 0 ? 'View Reviews' : 'Write a Review'}
          </button>
        </div>

        <p className="text-xs font-bold text-gold uppercase tracking-wider mt-2">{role || 'Licensed Real Estate Broker'}</p>
        
        {/* Achievements Badge */}
        {propertyCount !== undefined ? (
          <p className="text-[11px] text-slate-400 font-semibold mt-2.5 flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-100 rounded-full py-1 px-3 w-fit mx-auto">
            <FaAward className="text-gold text-[10px]" /> {propertyCount} {propertyCount === 1 ? 'Active Listing' : 'Active Listings'}
          </p>
        ) : sales ? (
          <p className="text-[11px] text-slate-400 font-semibold mt-2.5 flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-100 rounded-full py-1 px-3 w-fit mx-auto">
            <FaAward className="text-gold text-[10px]" /> {sales}
          </p>
        ) : (
          <p className="text-[11px] text-slate-400 font-semibold mt-2.5 flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-100 rounded-full py-1 px-3 w-fit mx-auto">
            <FaAward className="text-gold text-[10px]" /> Verified Agent
          </p>
        )}
      </div>

      <div className="space-y-2.5 mt-4 pt-4 border-t border-slate-100 text-xs font-medium text-slate-500">
        {email && (
          <a href={`mailto:${email}`} className="flex items-center justify-center gap-2 text-slate-500 hover:text-gold transition-colors truncate">
            <FaEnvelope className="shrink-0" />
            <span className="truncate">{email}</span>
          </a>
        )}
        {phone && (
          <div className="flex items-center justify-center gap-4 mt-1">
            <a href={`tel:${phone}`} className="flex items-center gap-1.5 text-slate-500 hover:text-gold transition-colors">
              <FaPhone className="text-[10px] shrink-0" />
              <span>{phone}</span>
            </a>
            <a 
              href={`https://wa.me/${getWhatsAppNumber(phone)}?text=${encodeURIComponent(`Hi, I'm contacting you via Luxury Estate platform.`)}`}
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold transition-all hover:scale-105"
              title="Chat on WhatsApp"
            >
              <FaWhatsapp className="text-sm shrink-0" />
              <span>WhatsApp</span>
            </a>
          </div>
        )}
        
        {/* Chat on Platform Button */}
        <button
          type="button"
          onClick={handleChatOnPlatform}
          disabled={startingChat || isOwnProfile}
          className="w-full mt-2 py-2 border border-gold text-gold hover:bg-gold hover:text-white rounded-xl font-bold transition-all shadow-sm text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-100 hover:scale-[1.02] active:scale-[0.98]"
        >
          <FaComments className="text-sm animate-pulse" /> 
          <span>{isOwnProfile ? 'You' : (startingChat ? 'Connecting...' : 'Chat on Platform')}</span>
        </button>
      </div>

      {/* Agent Reviews Modal */}
      {showReviewsModal && (
        <AgentReviewsModal
          agent={{ ...agent, averageRating, reviewCount }}
          onClose={() => setShowReviewsModal(false)}
          onReviewSubmitted={(newAvg, newCount) => {
            setAverageRating(newAvg)
            setReviewCount(newCount)
          }}
        />
      )}
    </article>
  )
}
