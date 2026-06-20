import React, { useState, useEffect } from 'react'
import { FaTimes, FaStar, FaUserCircle, FaPaperPlane } from 'react-icons/fa'
import { userApi, getImageUrl } from '../../services/api'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function AgentReviewsModal({ agent, onClose, onReviewSubmitted }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [text, setText] = useState('')

  const storedUser = window.localStorage.getItem('luxestate-user')
  const user = storedUser ? JSON.parse(storedUser) : null
  const isAgentSelf = user && (user._id === agent._id || user.id === agent._id || user.id === agent.id)

  useEffect(() => {
    fetchReviews()
  }, [agent])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await userApi.getAgentReviews(agent._id || agent.id)
      setReviews(res?.data || [])
    } catch (err) {
      console.error('Failed to load reviews:', err.message)
      toast.error('Failed to load reviews list.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!text.trim() || rating < 1 || rating > 5) return

    try {
      setSubmitting(true)
      const res = await userApi.submitAgentReview(agent._id || agent.id, {
        rating,
        text: text.trim()
      })
      if (res?.success) {
        toast.success('Your review has been submitted successfully!')
        setText('')
        setRating(5)
        
        // Refresh reviews locally
        const updatedReviews = [res.data, ...reviews]
        setReviews(updatedReviews)
        
        const count = updatedReviews.length
        const sum = updatedReviews.reduce((acc, curr) => acc + curr.rating, 0)
        const avg = count > 0 ? parseFloat((sum / count).toFixed(1)) : 0
        
        // Notify parent AgentCard to update averages
        if (onReviewSubmitted) {
          onReviewSubmitted(avg, count)
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (count, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (interactive ? (hoverRating || rating) : count)
          return (
            <button
              key={star}
              type={interactive ? 'button' : 'submit'}
              onClick={interactive ? () => setRating(star) : undefined}
              onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
              onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
              disabled={!interactive}
              className={`text-base ${interactive ? 'cursor-pointer transition-transform hover:scale-110 active:scale-95' : 'pointer-events-none'} ${
                isFilled ? 'text-amber-500' : 'text-slate-200'
              }`}
            >
              <FaStar />
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden w-full max-w-4xl max-h-[85vh] flex flex-col md:flex-row shadow-2xl relative animate-scale-up">
        
        {/* Close Button top-right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 bg-slate-50 hover:bg-slate-100 text-luxury rounded-full border border-slate-200 shadow-sm z-55 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Close Dialog"
        >
          <FaTimes className="text-sm" />
        </button>

        {/* Left Column: Agent Profile & Review Form */}
        <div className="w-full md:w-5/12 border-b md:border-b-0 md:border-r border-slate-100 p-8 flex flex-col justify-between bg-slate-50/50 md:max-h-[85vh] overflow-y-auto">
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <span className="text-[10px] font-bold text-gold uppercase tracking-widest bg-gold/10 px-3 py-1 rounded-full inline-block">
                Advisor Feedback
              </span>
              
              {/* Agent Profile context */}
              <div className="flex flex-col items-center md:items-start gap-3 mt-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 shadow-sm">
                  <img
                    src={getImageUrl(agent.avatar) || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
                    alt={agent.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-luxury text-lg">{agent.name}</h4>
                  <p className="text-[10px] font-bold text-gold uppercase tracking-wider mt-0.5">{agent.role || 'Licensed Estate Broker'}</p>
                </div>
              </div>
            </div>

            {/* Submit Review Form */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Write your Review
              </h4>

              {!user ? (
                <div className="bg-slate-100 border border-slate-200/80 p-4 rounded-2xl text-center text-xs space-y-2">
                  <p className="text-slate-500 font-semibold">Please sign in to rate this advisor.</p>
                  <Link
                    to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}
                    className="inline-block px-4 py-2 bg-gold hover:bg-yellow-600 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] transition-colors"
                  >
                    Go to Sign In
                  </Link>
                </div>
              ) : isAgentSelf ? (
                <div className="bg-slate-100 border border-slate-200/80 p-4 rounded-2xl text-center text-xs text-slate-400 font-semibold">
                  You cannot submit a review for your own profile.
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Stars rating selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Rating</label>
                    <div className="flex items-center gap-2">
                      {renderStars(rating, true)}
                      <span className="text-xs font-bold text-luxury">{rating} / 5</span>
                    </div>
                  </div>

                  {/* Feedback Message */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Message</label>
                    <textarea
                      placeholder="Describe your experience with this advisor..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      required
                      rows={4}
                      maxLength={1000}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-xs resize-none bg-white shadow-xxs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !text.trim()}
                    className="w-full py-3 bg-luxury hover:bg-black text-white rounded-xl font-bold transition-all shadow-md text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <FaPaperPlane className="text-xs" />
                    <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Reviews Feed list */}
        <div className="w-full md:w-7/12 p-8 flex flex-col max-h-[85vh] overflow-y-auto">
          <h3 className="font-serif font-bold text-luxury text-xl border-b border-slate-100 pb-4 flex items-center gap-2">
            Reviews Feed
          </h3>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1 mt-4">
            {loading ? (
              <div className="flex justify-center items-center h-48 py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="h-48 flex flex-col justify-center items-center text-center p-8 text-slate-400 text-xs">
                No verified reviews found for this advisor yet. Be the first to share your experience!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id || rev.id} className="py-4 space-y-2.5">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {rev.reviewer?.avatar ? (
                          <img src={getImageUrl(rev.reviewer.avatar)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <FaUserCircle className="text-slate-400 text-xl" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-luxury text-xs">{rev.reviewer?.name || 'Anonymous Client'}</h4>
                        <div className="mt-0.5">
                          {renderStars(rev.rating)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap font-normal pl-12 bg-slate-50/50 p-3 rounded-xl border border-slate-100/30">
                    {rev.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
