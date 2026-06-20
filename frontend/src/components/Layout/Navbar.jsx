import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaSearch, FaUser, FaHeart, FaBars, FaTimes, FaSun, FaMoon, FaBell, FaGlobe } from 'react-icons/fa'
import { useAuth } from '../../hooks/useAuth'
import { useWishlist } from '../../context/WishlistContext'
import { useTheme } from '../../context/ThemeContext'
import { useCurrency } from '../../context/CurrencyContext'
import { notificationApi } from '../../services/api'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, logout } = useAuth()
  const { wishlist } = useWishlist()
  const { theme, toggleTheme } = useTheme()
  const { currency, setCurrency } = useCurrency()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Notifications State
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  
  const isHome = location.pathname === '/'
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Load and poll notifications
  useEffect(() => {
    if (!user) return
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [user])

  // Close notifications dropdown on click outside
  useEffect(() => {
    if (!showNotifications) return
    const closeMenu = (e) => {
      if (!e.target.closest('.notifications-bell-container')) {
        setShowNotifications(false)
      }
    }
    window.addEventListener('click', closeMenu)
    return () => window.removeEventListener('click', closeMenu)
  }, [showNotifications])

  const loadNotifications = async () => {
    try {
      const res = await notificationApi.getNotifications()
      const list = res?.data || res || []
      setNotifications(list)
      setUnreadCount(list.filter(n => !n.isRead).length)
    } catch (err) {
      console.error('Failed to load notifications:', err.message)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err.message)
    }
  }

  const handleMarkSingleRead = async (id, link) => {
    try {
      await notificationApi.markAsRead(id)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
      if (link) {
        setShowNotifications(false)
        navigate(link)
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err.message)
    }
  }

  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation()
    try {
      await notificationApi.deleteNotification(id)
      setNotifications(prev => {
        const target = prev.find(n => n._id === id)
        const updated = prev.filter(n => n._id !== id)
        if (target && !target.isRead) {
          setUnreadCount(u => Math.max(0, u - 1))
        }
        return updated
      })
    } catch (err) {
      console.error('Failed to delete notification:', err.message)
    }
  }

  const handleClearAll = async () => {
    try {
      await notificationApi.clearAllNotifications()
      setNotifications([])
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to clear all notifications:', err.message)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/properties?search=${searchQuery}`)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Properties', path: '/properties' },
    { name: 'Valuation', path: '/valuation' },
    { name: 'Agents', path: '/agents' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ]

  // Decide classes based on homepage scroll state
  const isTransparent = isHome && !isScrolled

  const navClass = isTransparent
    ? 'fixed top-0 left-0 right-0 bg-transparent text-white z-50 transition-all duration-300 h-24 flex items-center'
    : 'fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 shadow-sm text-luxury transition-all duration-300 h-20 flex items-center'

  const logoClass = isTransparent
    ? 'text-2xl font-serif font-bold text-white tracking-wider'
    : 'text-2xl font-serif font-bold text-luxury tracking-wider'

  const linkClass = isTransparent
    ? 'text-white/95 hover:text-gold transition-colors duration-300 font-medium text-sm tracking-wide uppercase'
    : 'text-luxury hover:text-gold transition-colors duration-300 font-medium text-sm tracking-wide uppercase'

  const searchInputClass = isTransparent
    ? 'pl-4 pr-10 py-2 bg-white/10 text-white placeholder-white/60 border border-white/20 rounded-full focus:outline-none focus:bg-white/20 focus:border-gold transition-all text-sm w-48 focus:w-60'
    : 'pl-4 pr-10 py-2 bg-slate-50 text-luxury placeholder-gray-400 border border-gray-200 rounded-full focus:outline-none focus:bg-white focus:border-gold transition-all text-sm w-48 focus:w-60'

  const iconClass = isTransparent
    ? 'text-xl text-white/90 hover:text-gold transition-colors'
    : 'text-xl text-gray-600 hover:text-gold transition-colors'

  const searchIconClass = isTransparent
    ? 'text-white/60 hover:text-gold transition-colors'
    : 'text-gray-400 hover:text-gold transition-colors'

  const registerBtnClass = isTransparent
    ? 'border border-white/80 text-white hover:bg-white hover:text-luxury px-5 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-300'
    : 'border border-gold text-gold hover:bg-gold hover:text-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-300'

  const signInBtnClass = isTransparent
    ? 'bg-gold hover:bg-yellow-600 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-300 shadow-lg shadow-gold/20'
    : 'bg-luxury hover:bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-300 shadow-md'

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={navClass}
    >
      <div className="container mx-auto px-4 flex justify-between items-center w-full">
        {/* Logo */}
        <Link to="/" className={logoClass}>
          <span className="text-gold font-sans font-bold">LUXURY</span> ESTATE
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => {
                if (location.pathname === link.path) {
                  if (link.path === '/properties') {
                    navigate(`/properties?t=${Date.now()}`)
                  }
                }
              }}
              className={linkClass}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="hidden lg:flex items-center space-x-6">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={searchInputClass}
            />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <FaSearch className={searchIconClass} />
            </button>
          </form>
          
          <Link to="/wishlist" className="relative p-1">
            <FaHeart className={iconClass} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gold text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Real-time Notifications Bell */}
          {user && (
            <div className="relative notifications-bell-container">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1 hover:text-gold transition-colors cursor-pointer flex items-center justify-center"
                title="Notifications"
              >
                <FaBell className={iconClass} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center border border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl border border-slate-100 rounded-2xl overflow-hidden z-50 animate-fade-in text-luxury">
                  <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <span className="text-xs font-bold text-luxury">Notifications</span>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllRead}
                          className="text-[10px] font-bold text-gold hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button 
                          onClick={handleClearAll}
                          className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer border-l border-slate-200 pl-2"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-slate-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif._id}
                          onClick={() => handleMarkSingleRead(notif._id, notif.link)}
                          className={`px-4 py-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors relative group ${
                            !notif.isRead ? 'bg-gold/5 font-semibold border-l-2 border-gold text-luxury' : 'text-slate-500'
                          }`}
                        >
                          <div className="pr-4">
                            <p className="leading-normal">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block font-normal">
                              {new Date(notif.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          
                          {/* Dismiss button */}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteNotification(notif._id, e)}
                            className="absolute right-2.5 top-3 text-[10px] text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                            title="Delete Notification"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Currency Switcher */}
          <div className="relative group">
            <button 
              className="flex items-center gap-1.5 p-1 hover:text-gold transition-colors text-xs font-bold select-none cursor-pointer"
              title="Change Currency"
            >
              <FaGlobe className={iconClass} />
              <span className={isTransparent ? 'text-white' : 'text-gray-600'}>{currency}</span>
            </button>
            <div className="absolute right-0 mt-2 w-28 bg-white shadow-xl border border-slate-100 rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              <button onClick={() => setCurrency('USD')} className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors hover:bg-cream text-slate-700 ${currency === 'USD' ? 'text-gold font-bold' : ''}`}>USD ($)</button>
              <button onClick={() => setCurrency('LKR')} className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors hover:bg-cream text-slate-700 ${currency === 'LKR' ? 'text-gold font-bold' : ''}`}>LKR (Rs.)</button>
              <button onClick={() => setCurrency('EUR')} className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors hover:bg-cream text-slate-700 ${currency === 'EUR' ? 'text-gold font-bold' : ''}`}>EUR (€)</button>
            </div>
          </div>
 
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-1 hover:text-gold transition-colors focus:outline-none flex items-center justify-center"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <FaMoon className={iconClass} />
            ) : (
              <FaSun className="text-xl text-yellow-400 hover:text-gold transition-colors" />
            )}
          </button>
 
          {user ? (
            <div className="relative group">
              <button className="flex items-center space-x-2 p-1">
                <FaUser className={iconClass} />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl border border-slate-100 rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                  <p className="text-xs font-bold text-luxury truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 capitalize truncate mt-0.5">{user.role}</p>
                </div>
                <Link to="/profile" className="block px-4 py-2.5 text-xs font-semibold hover:bg-cream text-slate-700 transition-colors">My Profile</Link>
                <Link to="/dashboard" className="block px-4 py-2.5 text-xs font-semibold hover:bg-cream text-slate-700 transition-colors">Dashboard</Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-cream text-red-600 border-t border-slate-50 transition-colors">Logout</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/register">
                <button className={registerBtnClass}>Register</button>
              </Link>
              <Link to="/login">
                <button className={signInBtnClass}>Sign In</button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} className={`lg:hidden p-2 rounded-lg ${isTransparent ? 'text-white' : 'text-luxury'}`}>
          {isOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 bg-white border-t border-slate-100 shadow-xl py-4 px-6 flex flex-col lg:hidden space-y-3 z-50"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => {
                setIsOpen(false)
                if (location.pathname === link.path) {
                  if (link.path === '/properties') {
                    navigate(`/properties?t=${Date.now()}`)
                  }
                }
              }}
              className="py-2.5 text-sm font-semibold text-luxury border-b border-slate-50 hover:text-gold transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 space-y-3">
            {/* Mobile Currency Switcher */}
            <div className="flex items-center justify-between py-2.5 border-b border-slate-100/50">
              <span className="text-sm font-semibold text-luxury">Currency</span>
              <div className="flex gap-1.5 bg-slate-50 p-1 border border-slate-200/60 rounded-xl">
                {['USD', 'LKR', 'EUR'].map((cur) => (
                  <button
                    key={cur}
                    onClick={() => setCurrency(cur)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      currency === cur
                        ? 'bg-white text-luxury shadow-sm'
                        : 'text-slate-500 hover:text-luxury'
                    }`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Theme Toggle */}
            <div className="flex items-center justify-between py-2.5 border-b border-slate-100/50">
              <span className="text-sm font-semibold text-luxury">Theme Mode</span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2 text-xs font-bold text-luxury hover:bg-slate-100"
              >
                {theme === 'light' ? (
                  <>
                    <FaMoon className="text-gray-600" /> Dark Mode
                  </>
                ) : (
                  <>
                    <FaSun className="text-yellow-500" /> Light Mode
                  </>
                )}
              </button>
            </div>

            {user ? (
              <>
                <div className="px-1 py-2">
                  <p className="text-xs font-bold text-luxury">{user.name}</p>
                  <p className="text-[10px] text-slate-400 capitalize mt-0.5">{user.role}</p>
                </div>
                <Link to="/profile" className="block py-2 text-sm font-semibold text-slate-700 hover:text-gold border-b border-slate-50" onClick={() => setIsOpen(false)}>My Profile</Link>
                <Link to="/dashboard" className="block py-2 text-sm font-semibold text-slate-700 hover:text-gold border-b border-slate-50" onClick={() => setIsOpen(false)}>
                  Dashboard {unreadCount > 0 && <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[9px] rounded-full font-bold">{unreadCount}</span>}
                </Link>
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left py-2 text-sm font-semibold text-red-600">Logout</button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  <button className="w-full border border-gold text-gold hover:bg-gold hover:text-white py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-300">Register</button>
                </Link>
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <button className="w-full bg-luxury hover:bg-black text-white py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-300">Sign In</button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}

export default Navbar