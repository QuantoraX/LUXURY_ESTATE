import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useWishlist } from '../context/WishlistContext'
import { userApi, propertyApi, bookingApi, contactApi, uploadImages, getImageUrl } from '../services/api'
import { FaUser, FaEnvelope, FaPhone, FaLock, FaCamera, FaUserShield, FaBuilding, FaCalendarCheck, FaHeart, FaEnvelopeOpenText } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { wishlist } = useWishlist()
  const navigate = useNavigate()

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatar, setAvatar] = useState('')

  // Statistics states
  const [stats, setStats] = useState({
    propertiesCount: 0,
    bookingsCount: 0,
    inquiriesCount: 0,
    totalUsersCount: 0, // Admin only
  })

  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    // Prefill form
    setName(user.name || '')
    setEmail(user.email || '')
    setPhone(user.phone || '')
    setAvatar(user.avatar || '')

    loadProfileStats()
  }, [user])

  const loadProfileStats = async () => {
    try {
      setLoading(true)
      let propertiesCount = 0
      let bookingsCount = 0
      let inquiriesCount = 0
      let totalUsersCount = 0

      if (user.role === 'admin') {
        const [usersRes, propsRes, bookingsRes] = await Promise.all([
          userApi.getUsers(),
          propertyApi.getProperties('?limit=1'),
          bookingApi.getBookings(),
        ])
        totalUsersCount = usersRes?.count || usersRes?.data?.length || 0
        propertiesCount = propsRes?.total || propsRes?.data?.length || 0
        bookingsCount = bookingsRes?.data?.length || 0
      } else if (user.role === 'agent') {
        const [propsRes, bookingsRes, inquiriesRes] = await Promise.all([
          propertyApi.getProperties(`?agent=${user.id || user._id}&limit=100`),
          bookingApi.getBookings(),
          contactApi.getMessages(),
        ])
        propertiesCount = propsRes?.data?.length || propsRes?.length || 0
        bookingsCount = bookingsRes?.data?.length || 0
        inquiriesCount = inquiriesRes?.data?.length || 0
      } else {
        // Client / User
        const [bookingsRes] = await Promise.all([
          bookingApi.getBookings(),
        ])
        bookingsCount = bookingsRes?.data?.length || 0
      }

      setStats({
        propertiesCount,
        bookingsCount,
        inquiriesCount,
        totalUsersCount,
      })
    } catch (error) {
      console.error('Failed to load profile statistics', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('images', file)

    try {
      setUploading(true)
      const res = await uploadImages(formData)
      if (res.success && res.urls && res.urls.length > 0) {
        setAvatar(res.urls[0])
        toast.success('Avatar uploaded successfully. Save changes to apply.')
      }
    } catch (error) {
      toast.error(error.message || 'Avatar upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    try {
      setUpdating(true)
      const payload = { name, email, phone, avatar }
      if (password) {
        payload.password = password
      }

      const res = await userApi.updateProfile(payload)
      if (res.success) {
        updateUser(res.data)
        setPassword('')
        setConfirmPassword('')
        toast.success('Profile updated successfully.')
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setUpdating(false)
    }
  }

  if (!user) return null

  const isAdmin = user.role === 'admin'
  const isAgent = user.role === 'agent'
  const isClient = user.role === 'user'

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6">
      {/* Title */}
      <div>
        <h1 className="text-4xl font-serif font-bold text-luxury">My Account Profile</h1>
        <p className="text-slate-500 mt-1 text-sm">Manage your personal credentials, profile picture, and view listing statistics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Avatar and Statistics */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Avatar Glassmorphism Box */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-soft text-center flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gold"></div>
            
            {/* Avatar Image Frame */}
            <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-md my-4 bg-slate-50">
              <img
                src={getImageUrl(avatar)}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs cursor-pointer">
                <FaCamera className="text-xl mb-1.5" />
                <span>{uploading ? 'Uploading...' : 'Change Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Profile Info */}
            <h3 className="text-xl font-serif font-bold text-luxury">{user.name}</h3>
            
            {/* Role Badge */}
            <div className="mt-2.5">
              <span className={`px-4 py-1.5 rounded-full text-xxs font-bold tracking-widest uppercase flex items-center gap-1.5 border ${
                isAdmin 
                  ? 'bg-red-50 text-red-600 border-red-200' 
                  : isAgent 
                  ? 'bg-gold/15 text-gold border-gold/30' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                <FaUserShield className="text-[10px]" /> {isAdmin ? 'SYSTEM ADMIN' : isAgent ? 'PROPERTY OWNER' : 'CLIENT MEMBER'}
              </span>
            </div>
            
            <p className="text-slate-400 text-xs mt-3 font-medium">Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
          </div>

          {/* Quick Statistics Panels */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-soft space-y-4">
            <h4 className="font-serif font-bold text-luxury text-sm border-b border-slate-100 pb-3 uppercase tracking-wider">Account Metrics</h4>
            
            <div className="space-y-3">
              {isAdmin && (
                <>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2.5 text-slate-500 font-semibold text-xs">
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><FaUserShield className="text-xs" /></div>
                      Total Platform Users
                    </div>
                    <span className="font-bold text-luxury text-base">{stats.totalUsersCount}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2.5 text-slate-500 font-semibold text-xs">
                      <div className="w-8 h-8 rounded-lg bg-gold/15 text-gold flex items-center justify-center"><FaBuilding className="text-xs" /></div>
                      Total Listings Live
                    </div>
                    <span className="font-bold text-luxury text-base">{stats.propertiesCount}</span>
                  </div>
                </>
              )}

              {isAgent && (
                <>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2.5 text-slate-500 font-semibold text-xs">
                      <div className="w-8 h-8 rounded-lg bg-gold/15 text-gold flex items-center justify-center"><FaBuilding className="text-xs" /></div>
                      My Live Listings
                    </div>
                    <span className="font-bold text-luxury text-base">{stats.propertiesCount}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2.5 text-slate-500 font-semibold text-xs">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><FaCalendarCheck className="text-xs" /></div>
                      Scheduled Viewings
                    </div>
                    <span className="font-bold text-luxury text-base">{stats.bookingsCount}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2.5 text-slate-500 font-semibold text-xs">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><FaEnvelopeOpenText className="text-xs" /></div>
                      Inquiry Inbox Messages
                    </div>
                    <span className="font-bold text-luxury text-base">{stats.inquiriesCount}</span>
                  </div>
                </>
              )}

              {isClient && (
                <>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2.5 text-slate-500 font-semibold text-xs">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center"><FaHeart className="text-xs" /></div>
                      Properties Wishlisted
                    </div>
                    <span className="font-bold text-luxury text-base">{wishlist.length}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2.5 text-slate-500 font-semibold text-xs">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><FaCalendarCheck className="text-xs" /></div>
                      Viewings Requested
                    </div>
                    <span className="font-bold text-luxury text-base">{stats.bookingsCount}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Account Credentials Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-soft">
            <h4 className="font-serif font-bold text-luxury text-xl border-b border-slate-100 pb-4 mb-6">Profile Settings</h4>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-gold focus:bg-white bg-slate-50/50 text-sm font-medium"
                    placeholder="Enter your full name"
                  />
                  <FaUser className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-gold focus:bg-white bg-slate-50/50 text-sm font-medium"
                    placeholder="Enter your email address"
                  />
                  <FaEnvelope className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Phone Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-gold focus:bg-white bg-slate-50/50 text-sm font-medium"
                    placeholder={isAgent ? "E.g., +1 (800) 555-0199 (Required for clients to call you)" : "E.g., +1 (800) 555-0199"}
                  />
                  <FaPhone className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h5 className="font-semibold text-luxury text-sm">Security / Change Password</h5>
                <p className="text-slate-400 text-xxs leading-relaxed">Leave password fields blank if you do not wish to modify your current login password credentials.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength="6"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-gold focus:bg-white bg-slate-50/50 text-sm"
                        placeholder="Enter new password"
                      />
                      <FaLock className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        minLength="6"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-gold focus:bg-white bg-slate-50/50 text-sm"
                        placeholder="Confirm new password"
                      />
                      <FaLock className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-luxury hover:bg-black text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-md transition-all hover:scale-102 flex items-center justify-center gap-2 disabled:opacity-75 disabled:pointer-events-none"
                >
                  {updating ? 'Saving Profile Changes...' : 'Save Settings'}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
