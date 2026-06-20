import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { contactApi, userApi, chatApi } from '../services/api'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane, FaBriefcase, FaQuestionCircle, FaComments } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function Contact() {
  const navigate = useNavigate()
  const [startingChat, setStartingChat] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChatWithAdmin = async () => {
    const storedUser = window.localStorage.getItem('luxestate-user')
    if (!storedUser) {
      toast.error('Please sign in to start a support chat.')
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }

    try {
      setStartingChat(true)
      const adminRes = await userApi.getAdmin()
      const adminId = adminRes?.data?._id || adminRes?.data?.id
      
      if (!adminId) {
        toast.error('Admin support accounts are currently offline.')
        return
      }

      const parsedUser = JSON.parse(storedUser)
      const currentUserId = parsedUser?._id || parsedUser?.id
      if (currentUserId === adminId) {
        toast.error('You are logged in as the Administrator.')
        return
      }

      const res = await chatApi.startConversation({
        recipientId: adminId
      })

      if (res?.success) {
        toast.success('Support conversation initialized!')
        navigate('/dashboard?tab=inbox')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to start support conversation.')
    } finally {
      setStartingChat(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      // Call the contact message API
      await contactApi.sendMessage({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      })
      toast.success('Thank you! Your message has been sent successfully. Our team will contact you shortly.')
      setFormData({ name: '', email: '', subject: 'general', message: '' })
    } catch (error) {
      toast.error(error.message || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-12 py-8">
      {/* Intro Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-gold uppercase tracking-widest bg-gold/10 px-4 py-1.5 rounded-full">
          Get In Touch
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-luxury mt-2">Connect With Luxury Estate</h1>
        <p className="text-slate-500 text-sm font-medium">
          Have inquiries about listed properties, buying opportunities, or selling your home? Our elite client managers are here to guide you.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Info Column (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Contact info */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-soft space-y-6">
            <h3 className="text-xl font-serif font-bold text-luxury border-b border-slate-100 pb-4">Our Offices</h3>
            
            <div className="space-y-5 text-sm font-semibold text-slate-700">
              {/* Address */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h4 className="font-bold text-luxury text-sm">Headquarters</h4>
                  <p className="text-slate-500 text-xs font-normal mt-0.5">700 Wilshire Blvd, Beverly Hills, CA 90210</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
                  <FaPhone />
                </div>
                <div>
                  <h4 className="font-bold text-luxury text-sm">Direct Line</h4>
                  <p className="text-slate-500 text-xs font-normal mt-0.5">+1 (310) 555-0199</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
                  <FaEnvelope />
                </div>
                <div>
                  <h4 className="font-bold text-luxury text-sm">Concierge Email</h4>
                  <p className="text-slate-500 text-xs font-normal mt-0.5">concierge@luxuryestate.com</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
                  <FaClock />
                </div>
                <div>
                  <h4 className="font-bold text-luxury text-sm">Availability</h4>
                  <p className="text-slate-500 text-xs font-normal mt-0.5">Mon - Sat: 9:00 AM - 6:00 PM PST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder Map Card */}
          <div className="bg-slate-950 text-white rounded-[32px] p-6 shadow-soft relative overflow-hidden h-[180px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-44 h-44 bg-gold/5 rounded-full -mr-10 -mt-10"></div>
            <div>
              <span className="text-gold text-xs font-bold uppercase tracking-wider">Office Map Location</span>
              <h4 className="font-serif font-bold text-lg mt-2 leading-tight">Beverly Hills Financial District</h4>
              <p className="text-slate-400 text-xs mt-1">Conveniently located near Rodeo Drive.</p>
            </div>
            <a 
              href="https://maps.google.com" 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs text-gold font-bold hover:underline inline-flex items-center gap-1.5"
            >
              Get Directions on Map <FaPaperPlane className="text-[10px]" />
            </a>
          </div>

          {/* Live Support Chat Card */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-soft relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full -mr-6 -mt-6"></div>
            <div className="space-y-2">
              <span className="text-gold text-xs font-bold uppercase tracking-wider bg-gold/10 px-3 py-1 rounded-full w-fit block">Live Platform Help</span>
              <h4 className="font-serif font-bold text-lg text-luxury mt-2">Chat with Admin Support</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Need immediate assistance? Initiate a live chat session directly on the platform with our system administrators.
              </p>
            </div>
            <button
              type="button"
              onClick={handleChatWithAdmin}
              disabled={startingChat}
              className="w-full mt-4 py-3 bg-gold hover:bg-yellow-600 text-white rounded-xl font-bold transition-all shadow-md text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <FaComments className="text-sm animate-pulse" />
              <span>{startingChat ? 'Connecting...' : 'Start Support Chat'}</span>
            </button>
          </div>
        </div>

        {/* Form Column (Right 3 cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-[32px] p-8 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-xl font-serif font-bold text-luxury">Submit Inquiry</h3>
              <p className="text-slate-400 text-xs mt-1">Please provide details about your inquiry and we will pair you with the correct partner agent.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Your Name</label>
                <input
                  type="text"
                  placeholder="E.g., John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Your Email</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-sm"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Inquiry Type / Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-gold bg-white cursor-pointer text-sm"
              >
                <option value="general">General Inquiry</option>
                <option value="buy">Buying a Luxury Property</option>
                <option value="sell">Selling / Listing my Estate</option>
                <option value="management">Property Management Request</option>
                <option value="media">Press or Media Relations</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Detailed Message</label>
              <textarea
                placeholder="Please describe your parameters, desired regions, budget ranges, or questions..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-sm resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-luxury hover:bg-black text-white rounded-xl font-bold transition-all shadow-sm text-sm disabled:bg-slate-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending Inquiry...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane className="text-xs" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
