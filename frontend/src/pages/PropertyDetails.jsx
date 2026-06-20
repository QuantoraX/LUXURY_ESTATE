import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchProperty, fetchProperties, contactApi, getImageUrl, bookingApi, chatApi } from '../services/api'
import { useWishlist } from '../context/WishlistContext'
import { useCurrency } from '../context/CurrencyContext'
import PropertyCard from '../components/Properties/PropertyCard'
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaEnvelope, FaPhone, FaUser, FaHeart, FaChevronLeft, FaChevronRight, FaArrowLeft, FaCheck, FaWhatsapp, FaImages, FaTimes, FaPlayCircle, FaCube, FaExpand, FaSearchPlus, FaSearchMinus, FaPrint, FaComments } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function PropertyDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [similar, setSimilar] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Image Viewer State
  const [activeImage, setActiveImage] = useState('')
  const { toggleWishlist, isInWishlist } = useWishlist()
  const isLiked = isInWishlist(id)

  const { formatPrice } = useCurrency()

  // Mortgage Calculator State
  const [downPaymentPct, setDownPaymentPct] = useState(20)
  const [interestRate, setInterestRate] = useState(4.5)
  const [loanTerm, setLoanTerm] = useState(30)
  
  const [startingChat, setStartingChat] = useState(false)
  
  // Media Tabs State
  const [mediaTab, setMediaTab] = useState('photos')

  // Redesigned Image Viewer States
  const [galleryView, setGalleryView] = useState('collage') // 'collage' or 'slider'
  const [activeSliderIndex, setActiveSliderIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)

  // Touch Swipe Gesture State
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  // Lightbox State
  const [showLightbox, setShowLightbox] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Check viewport on mount and resize for responsive mobile viewer
  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkViewport()
    window.addEventListener('resize', checkViewport)
    return () => window.removeEventListener('resize', checkViewport)
  }, [])

  const openLightbox = (index) => {
    setLightboxIndex(index)
    setShowLightbox(true)
    setIsZoomed(false)
  }

  const closeLightbox = () => {
    setShowLightbox(false)
    setIsZoomed(false)
  }

  // Touch Swipe Handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = (callbackNext, callbackPrev) => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    if (isLeftSwipe) {
      callbackNext()
    } else if (isRightSwipe) {
      callbackPrev()
    }
    setTouchStart(0)
    setTouchEnd(0)
  }

  // Derived properties safely defined before early returns
  const isSale = property ? (property.listingType === 'sell' || property.listingType === 'sale') : false
  const rawUrls = property ? (property.images && property.images.length > 0 ? property.images : [property.image].filter(Boolean)) : []
  const imageUrls = rawUrls.map(img => getImageUrl(img))
  const isOwnListing = (() => {
    const storedUser = window.localStorage.getItem('luxestate-user')
    if (!storedUser || !property?.agent) return false
    try {
      const parsed = JSON.parse(storedUser)
      const currentUserId = parsed?._id || parsed?.id
      const agentId = property.agent._id || property.agent.id
      return currentUserId && agentId && currentUserId === agentId
    } catch (e) {
      return false
    }
  })()

  // Mortgage calculations
  const calculateMortgage = () => {
    const priceVal = property?.price || 0
    const principal = priceVal * (1 - downPaymentPct / 100)
    const monthlyRate = (interestRate / 100) / 12
    const totalPayments = loanTerm * 12
    
    let monthlyPayment = 0
    if (monthlyRate === 0) {
      monthlyPayment = principal / totalPayments
    } else {
      monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1)
    }
    
    return {
      monthlyPayment: Math.round(monthlyPayment),
      loanAmount: Math.round(principal),
      downPaymentAmount: Math.round(priceVal * (downPaymentPct / 100))
    }
  }

  const { monthlyPayment, loanAmount, downPaymentAmount } = calculateMortgage()

  const nextLightbox = () => {
    if (imageUrls.length === 0) return
    setLightboxIndex((prev) => (prev + 1) % imageUrls.length)
    setIsZoomed(false)
  }

  const prevLightbox = () => {
    if (imageUrls.length === 0) return
    setLightboxIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length)
    setIsZoomed(false)
  }

  // Handle Lightbox Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showLightbox) return
      if (e.key === 'ArrowRight') {
        nextLightbox()
      } else if (e.key === 'ArrowLeft') {
        prevLightbox()
      } else if (e.key === 'Escape') {
        closeLightbox()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showLightbox, lightboxIndex, imageUrls])
  
  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '10:00 AM',
    tourType: 'in-person'
  })
  const [bookingSubmitting, setBookingSubmitting] = useState(false)

  useEffect(() => {
    loadPropertyDetails()
  }, [id])

  const loadPropertyDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetchProperty(id)
      const data = res?.data || res
      if (!data) throw new Error('Property details could not be loaded.')
      
      setProperty(data)
      const defaultImg = (data.images && data.images[0]) || data.image || ''
      setActiveImage(getImageUrl(defaultImg))
      setActiveSliderIndex(0)
      
      // Load similar properties
      const typeParam = `?propertyType=${data.propertyType}&limit=4`
      const simRes = await fetchProperties(typeParam)
      const simList = Array.isArray(simRes) ? simRes : simRes?.data || []
      // Filter out the current property
      setSimilar(simList.filter(p => (p._id || p.id) !== (data._id || data.id)).slice(0, 3))
      
    } catch (err) {
      setError(err.message || 'Failed to retrieve property details.')
      toast.error('Failed to load property details.')
    } finally {
      setLoading(false)
    }
  }

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await contactApi.sendMessage({
        ...contactForm,
        propertyId: id,
        agentId: property?.agent?._id || property?.agent?.id
      })
      toast.success('Your message has been sent to the agent!')
      setContactForm({ name: '', email: '', message: '' })
    } catch (err) {
      toast.error(err.message || 'Failed to send message.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChatOnPlatform = async () => {
    const storedUser = window.localStorage.getItem('luxestate-user')
    if (!storedUser) {
      toast.error('Please sign in to chat on the platform.')
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }

    try {
      setStartingChat(true)
      const recipientId = property?.agent?._id || property?.agent?.id
      if (!recipientId) {
        toast.error('Agent details are missing for this property.')
        return
      }

      const res = await chatApi.startConversation({
        recipientId,
        propertyId: id
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

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    try {
      setBookingSubmitting(true)
      await bookingApi.createBooking({
        ...bookingForm,
        propertyId: id,
        agentId: property?.agent?._id || property?.agent?.id || '60c72b2f9b1d8b2badfa1111'
      })
      toast.success('Viewing request scheduled! The agent will contact you shortly.')
      setBookingForm({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '10:00 AM',
        tourType: 'in-person'
      })
    } catch (err) {
      toast.error(err.message || 'Failed to schedule viewing.')
    } finally {
      setBookingSubmitting(false)
    }
  }

  const getEmbedUrl = (url) => {
    if (!url) return '';
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return url;
  }

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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
        <p className="text-slate-400 font-medium text-sm">Retrieving luxury estate details...</p>
      </div>
    )
  }

  if (error || !property) {
    return (
      <section className="text-center py-20 bg-white border border-slate-200 rounded-[32px] p-8 shadow-soft max-w-xl mx-auto my-10">
        <h1 className="text-3xl font-semibold text-luxury">Property Not Found</h1>
        <p className="text-slate-500 mt-3 text-sm">
          {error || 'The property you are looking for does not exist or has been removed.'}
        </p>
        <button
          onClick={() => navigate('/properties')}
          className="mt-6 bg-gold hover:bg-yellow-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors text-sm shadow-sm flex items-center gap-2 mx-auto"
        >
          <FaArrowLeft /> Back to Listings
        </button>
      </section>
    )
  }


  return (
    <div className="space-y-8 py-6">
      {/* Back & Print Buttons */}
      <div className="flex justify-between items-center no-print">
        <Link to="/properties" className="inline-flex items-center gap-2 text-slate-500 hover:text-gold font-semibold text-sm transition-colors">
          <FaChevronLeft className="text-xs" /> Back to Properties
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handleChatOnPlatform}
            disabled={startingChat || isOwnListing}
            className="px-4 py-2.5 bg-gold hover:bg-yellow-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer uppercase tracking-wider disabled:bg-slate-300"
          >
            <FaComments className="text-sm animate-pulse" /> {isOwnListing ? 'Your Listing' : (startingChat ? 'Connecting...' : 'Chat with Agent')}
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 border border-gold hover:bg-gold text-gold hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
          >
            <FaPrint className="text-sm" /> Download PDF Brochure
          </button>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Images & Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Image Gallery & Media Switcher */}
          <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden p-6 shadow-soft space-y-4">
            
            {/* Fallback default urls for interactive demos if database doesn't have embeds yet */}
            {(() => {
              const virtualTour = property.virtualTourUrl || 'https://my.matterport.com/show/?m=SXg95q11VFs';
              const videoWalkthrough = property.videoUrl || 'https://www.youtube.com/watch?v=QX2K-lq0k8M';

              // Helper for rendering Photos layout (Collage vs Slider)
              const renderPhotosContent = () => {
                if (isMobile || galleryView === 'slider') {
                  return (
                    <div className="space-y-4">
                      {/* Interactive Slideshow */}
                      <div 
                        className="relative h-[450px] w-full bg-slate-950 rounded-3xl overflow-hidden group border border-slate-100 select-none"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={() => handleTouchEnd(
                          () => setActiveSliderIndex((prev) => (prev + 1) % imageUrls.length),
                          () => setActiveSliderIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length)
                        )}
                      >
                        {/* Main Slide Image */}
                        <div 
                          className="w-full h-full cursor-pointer flex items-center justify-center bg-slate-900"
                          onClick={() => openLightbox(activeSliderIndex)}
                        >
                          <img 
                            src={imageUrls[activeSliderIndex]} 
                            alt={property.title} 
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                          />
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all flex items-center justify-center">
                            <FaExpand className="text-white text-3xl opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 bg-gold/80 p-2.5 rounded-full shadow-lg cursor-pointer" />
                          </div>
                        </div>

                        {/* Navigation Arrows */}
                        <button
                          type="button"
                          onClick={() => setActiveSliderIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white text-luxury rounded-full shadow-md hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 z-10"
                        >
                          <FaChevronLeft className="text-sm" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSliderIndex((prev) => (prev + 1) % imageUrls.length)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white text-luxury rounded-full shadow-md hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 z-10"
                        >
                          <FaChevronRight className="text-sm" />
                        </button>

                        {/* Slide Indicator Count badge */}
                        <div className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white font-semibold text-[10px] tracking-wider uppercase">
                          Photo {activeSliderIndex + 1} / {imageUrls.length}
                        </div>

                        {/* Wishlist Button floating over Slide */}
                        <button
                          type="button"
                          onClick={() => toggleWishlist(id)}
                          className="absolute top-4 right-4 z-10 bg-white hover:bg-slate-50 text-luxury rounded-full p-3 shadow-lg hover:scale-110 active:scale-95 transition-all"
                        >
                          <FaHeart className={`text-lg ${isLiked ? 'text-red-500' : 'text-slate-400'}`} />
                        </button>

                        {/* Sale/Rent Tag floating */}
                        <div className="absolute top-4 left-4 z-10">
                          <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-md text-white ${
                            isSale ? 'bg-gold' : 'bg-emerald-600'
                          }`}>
                            For {isSale ? 'Sale' : 'Rent'}
                          </span>
                        </div>
                      </div>

                      {/* Slider Thumbnail Bar below */}
                      {imageUrls.length > 1 && (
                        <div className="flex gap-2.5 overflow-x-auto py-1 max-w-full scrollbar-hide select-none">
                          {imageUrls.map((img, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveSliderIndex(idx)}
                              className={`w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                                activeSliderIndex === idx 
                                  ? 'border-gold scale-95 opacity-100 shadow-md' 
                                  : 'border-transparent opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // Default Collage Grid Layout
                return (
                  <div className="relative rounded-3xl overflow-hidden shadow-soft group border border-slate-100 bg-slate-950">
                    {imageUrls.length === 1 ? (
                      // Single Image Layout
                      <div 
                        className="h-[450px] w-full overflow-hidden cursor-pointer"
                        onClick={() => openLightbox(0)}
                      >
                        <img src={imageUrls[0]} alt={property.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                      </div>
                    ) : imageUrls.length === 2 ? (
                      // 2-Split Layout
                      <div className="grid grid-cols-2 gap-2 h-[450px] w-full">
                        {imageUrls.map((img, idx) => (
                          <div key={idx} className="overflow-hidden cursor-pointer h-full" onClick={() => openLightbox(idx)}>
                            <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                          </div>
                        ))}
                      </div>
                    ) : imageUrls.length === 3 ? (
                      // 3-Split Layout: 1 Large Left, 2 Stacked Right
                      <div className="grid grid-cols-3 gap-2 h-[450px] w-full">
                        <div className="col-span-2 overflow-hidden cursor-pointer h-full" onClick={() => openLightbox(0)}>
                          <img src={imageUrls[0]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                        </div>
                        <div className="grid grid-rows-2 gap-2 h-full">
                          {imageUrls.slice(1, 3).map((img, idx) => (
                            <div key={idx} className="overflow-hidden cursor-pointer h-full" onClick={() => openLightbox(idx + 1)}>
                              <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      // 4+ Image Layout: 1 Large Left, 4 Grid Right
                      <div className="grid grid-cols-4 gap-2 h-[480px] w-full">
                        {/* Featured Large */}
                        <div className="col-span-2 overflow-hidden cursor-pointer h-full" onClick={() => openLightbox(0)}>
                          <img src={imageUrls[0]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                        </div>
                        
                        {/* Right Grid (2 columns of 2 rows) */}
                        <div className="col-span-2 grid grid-cols-2 gap-2 h-full">
                          {imageUrls.slice(1, 5).map((img, idx) => (
                            <div key={idx} className="overflow-hidden cursor-pointer h-full relative" onClick={() => openLightbox(idx + 1)}>
                              <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                              {idx === 3 && imageUrls.length > 5 && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-xxs flex items-center justify-center text-white font-bold text-lg pointer-events-none">
                                  +{imageUrls.length - 5} More
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Wishlist Button floating over Collage */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(id)}
                      className="absolute top-4 right-4 z-20 bg-white hover:bg-slate-50 text-luxury rounded-full p-3 shadow-lg hover:scale-110 active:scale-95 transition-all"
                    >
                      <FaHeart className={`text-lg ${isLiked ? 'text-red-500' : 'text-slate-400'}`} />
                    </button>

                    {/* Sale/Rent Tag floating */}
                    <div className="absolute top-4 left-4 z-20">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-md text-white ${
                        isSale ? 'bg-gold' : 'bg-emerald-600'
                      }`}>
                        For {isSale ? 'Sale' : 'Rent'}
                      </span>
                    </div>

                    {/* Show All Photos Button floating in Bottom Right */}
                    <button
                      type="button"
                      onClick={() => openLightbox(0)}
                      className="absolute bottom-4 right-4 z-20 bg-white/95 hover:bg-white text-luxury px-4 py-2.5 rounded-xl text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-slate-200"
                    >
                      <FaImages className="text-sm text-gold" />
                      <span>All Photos ({imageUrls.length})</span>
                    </button>
                  </div>
                );
              };

              return (
                <>
                  {/* Media Tabs with Icons */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMediaTab('photos')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          mediaTab === 'photos'
                            ? 'bg-luxury text-white shadow-sm'
                            : 'text-slate-500 hover:text-luxury hover:bg-slate-50'
                        }`}
                      >
                        <FaImages className="text-sm text-gold" />
                        <span>Photos</span>
                      </button>
                      <button
                        onClick={() => setMediaTab('tour')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          mediaTab === 'tour'
                            ? 'bg-luxury text-white shadow-sm'
                            : 'text-slate-500 hover:text-luxury hover:bg-slate-50'
                        }`}
                      >
                        <FaCube className="text-sm text-gold" />
                        <span>3D Virtual Tour</span>
                      </button>
                      <button
                        onClick={() => setMediaTab('video')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          mediaTab === 'video'
                            ? 'bg-luxury text-white shadow-sm'
                            : 'text-slate-500 hover:text-luxury hover:bg-slate-50'
                        }`}
                      >
                        <FaPlayCircle className="text-sm text-gold" />
                        <span>Video Walkthrough</span>
                      </button>
                    </div>

                    {/* Gallery View Toggle (Photos Tab Only on desktop) */}
                    {mediaTab === 'photos' && imageUrls.length > 1 && !isMobile && (
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setGalleryView('collage')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                            galleryView === 'collage'
                              ? 'bg-white text-luxury shadow-sm'
                              : 'text-slate-500 hover:text-luxury'
                          }`}
                        >
                          Grid Collage
                        </button>
                        <button
                          type="button"
                          onClick={() => setGalleryView('slider')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                            galleryView === 'slider'
                              ? 'bg-white text-luxury shadow-sm'
                              : 'text-slate-500 hover:text-luxury'
                          }`}
                        >
                          Slideshow
                        </button>
                      </div>
                    )}
                  </div>

                  {mediaTab === 'photos' ? (
                    renderPhotosContent()
                  ) : mediaTab === 'tour' ? (
                    <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-slate-200 shadow-soft bg-slate-900">
                      <iframe
                        src={virtualTour}
                        title="3D Virtual Tour"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        allow="xr-spatial-tracking"
                      ></iframe>
                    </div>
                  ) : (
                    <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-slate-200 shadow-soft bg-slate-900">
                      <iframe
                        src={getEmbedUrl(videoWalkthrough)}
                        title="Video Walkthrough"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      ></iframe>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Details & Specs */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-soft space-y-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gold uppercase tracking-wider bg-gold/10 px-3 py-1 rounded-full">{property.propertyType}</span>
                {property.featured && (
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">Featured Premium</span>
                )}
              </div>
              <h1 className="text-3xl font-serif font-bold text-luxury mt-3">{property.title}</h1>
              <div className="flex items-center gap-1.5 text-slate-400 mt-2 text-sm font-medium">
                <FaMapMarkerAlt className="text-gold" />
                <span>{property.location}</span>
              </div>
            </div>

            {/* Price & Specs row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-50 rounded-2xl">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Price</p>
                <p className="text-xl font-bold text-luxury mt-1">
                  {formatPrice(property.price)}
                  {!isSale && <span className="text-slate-400 text-xs font-normal"> / mo</span>}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Bedrooms</p>
                <p className="text-lg font-bold text-luxury mt-1 flex items-center gap-1.5"><FaBed className="text-slate-400" /> {property.bedrooms}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Bathrooms</p>
                <p className="text-lg font-bold text-luxury mt-1 flex items-center gap-1.5"><FaBath className="text-slate-400" /> {property.bathrooms}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Area</p>
                <p className="text-lg font-bold text-luxury mt-1 flex items-center gap-1.5"><FaRulerCombined className="text-slate-400" /> {property.area} sq ft</p>
              </div>
            </div>

            {/* Quick Agent Connection Row */}
            <div className="flex flex-wrap gap-4 no-print pt-2">
              <button
                type="button"
                onClick={handleChatOnPlatform}
                disabled={startingChat || isOwnListing}
                className="flex-1 min-w-[200px] py-3.5 bg-gold hover:bg-yellow-600 text-white rounded-2xl font-bold transition-all shadow-md text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <FaComments className="text-base animate-pulse" />
                <span>{isOwnListing ? 'Your Listing' : (startingChat ? 'Connecting...' : 'Chat with Agent')}</span>
              </button>
              {property.agent?.phone && (
                <a
                  href={`https://wa.me/${getWhatsAppNumber(property.agent.phone)}?text=${encodeURIComponent(
                    `Hi, I'm interested in the property "${property.title}" (${window.location.href}). Please provide more details.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[200px] py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-md text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <FaWhatsapp className="text-base" />
                  <span>Chat on WhatsApp</span>
                </a>
              )}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-lg font-serif font-bold text-luxury border-b border-slate-100 pb-3">Overview & Description</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            {/* Features & Amenities */}
            {property.features && property.features.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <h3 className="text-lg font-serif font-bold text-luxury pb-2">Amenities & Key Features</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {property.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-slate-700 text-sm font-medium">
                      <FaCheck className="text-gold text-xs shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Google Map Section */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h3 className="text-lg font-serif font-bold text-luxury pb-2">Property Location</h3>
              <div className="w-full h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-soft">
                <iframe
                  title="Property Location Map"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(property.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Contact Agent */}
        <div className="space-y-8">
          {/* Agent Card */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-soft space-y-6 no-print">
            <h3 className="text-lg font-serif font-bold text-luxury border-b border-slate-100 pb-3">Listed By Agent</h3>
            
            {(() => {
              const agentInfo = property.agent || {
                name: 'Luxury Partner Support',
                role: 'Standard Listings Representative',
                email: 'support@luxuryestate.com',
                phone: '+1 (800) 555-0199',
                avatar: null
              };

              return (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-luxury text-lg uppercase overflow-hidden shrink-0">
                      {agentInfo.avatar ? (
                        <img src={agentInfo.avatar} alt={agentInfo.name} className="w-full h-full object-cover" />
                      ) : (
                        agentInfo.name?.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-luxury text-base">{agentInfo.name}</h4>
                      <p className="text-slate-400 text-xs font-medium capitalize mt-0.5">{agentInfo.role}</p>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="space-y-3 text-xs font-semibold text-slate-700 pt-2 border-t border-slate-100">
                    {agentInfo.email && (
                      <div className="flex items-center gap-3">
                        <FaEnvelope className="text-gold text-sm shrink-0" />
                        <a 
                          href={`mailto:${agentInfo.email}`} 
                          className="hover:text-gold transition-colors break-all"
                        >
                          {agentInfo.email}
                        </a>
                      </div>
                    )}
                    {agentInfo.phone && (
                      <div className="flex items-center gap-3">
                        <FaPhone className="text-gold text-sm shrink-0" />
                        <a 
                          href={`tel:${agentInfo.phone}`} 
                          className="hover:text-gold transition-colors"
                        >
                          {agentInfo.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-2 space-y-2.5">
                    {agentInfo.phone && (
                      <a 
                        href={`https://wa.me/${getWhatsAppNumber(agentInfo.phone)}?text=${encodeURIComponent(
                          `Hi, I'm interested in the property "${property.title}" (${window.location.href}). Please provide more details.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-sm text-xs flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <FaWhatsapp className="text-sm group-hover:scale-110 transition-transform" /> 
                        <span>Chat on WhatsApp</span>
                      </a>
                    )}
                    
                    <button
                      type="button"
                      onClick={handleChatOnPlatform}
                      disabled={startingChat || isOwnListing}
                      className="w-full py-2.5 border border-gold text-gold hover:bg-gold hover:text-white rounded-xl font-bold transition-all shadow-sm text-xs flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-100 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <FaComments className="text-sm animate-pulse" /> 
                      <span>{isOwnListing ? 'Your Listing' : (startingChat ? 'Connecting...' : 'Chat on Platform')}</span>
                    </button>
                  </div>
                </>
              );
            })()}

            {/* Inquiry Form */}
            <form onSubmit={handleContactSubmit} className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Request Information</h4>
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-xs"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your Email Address"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-xs"
                />
              </div>
              <div>
                <textarea
                  placeholder="I am interested in this listing and would like to schedule a viewing or request more details..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-xs resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-luxury hover:bg-black text-white rounded-xl font-bold transition-all shadow-sm text-xs disabled:bg-slate-300"
              >
                {submitting ? 'Sending Request...' : 'Submit Inquiry'}
              </button>
            </form>
          </div>

          {/* Mortgage Calculator Widget */}
          {isSale && (
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-soft space-y-6 no-print">
              <h3 className="text-lg font-serif font-bold text-luxury border-b border-slate-100 pb-3">Mortgage Calculator</h3>
              
              <div className="space-y-4">
                {/* Down Payment % Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Down Payment ({downPaymentPct}%)</span>
                    <span className="text-gold">{formatPrice(downPaymentAmount)}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={downPaymentPct}
                    onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                    className="w-full accent-gold cursor-pointer"
                  />
                </div>

                {/* Interest Rate Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Interest Rate</span>
                    <span className="text-gold">{interestRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full accent-gold cursor-pointer"
                  />
                </div>

                {/* Loan Term Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Loan Term</label>
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl">
                    {[10, 15, 20, 30].map((years) => (
                      <button
                        key={years}
                        type="button"
                        onClick={() => setLoanTerm(years)}
                        className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                          loanTerm === years
                            ? 'bg-white text-luxury shadow-sm'
                            : 'text-slate-500 hover:text-luxury'
                        }`}
                      >
                        {years} Yrs
                      </button>
                    ))}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs font-semibold text-slate-700">
                  <div className="flex justify-between">
                    <span>Property Price:</span>
                    <span>{formatPrice(property.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loan Amount:</span>
                    <span>{formatPrice(loanAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Down Payment:</span>
                    <span>{formatPrice(downPaymentAmount)}</span>
                  </div>
                </div>

                {/* Dynamic Monthly Payment Callout */}
                <div className="bg-gold/10 border border-gold/20 p-4 rounded-2xl text-center space-y-1">
                  <p className="text-[10px] font-bold text-gold uppercase tracking-widest">Estimated Monthly Payment</p>
                  <p className="text-2xl font-bold text-luxury">{formatPrice(monthlyPayment)}</p>
                  <p className="text-[10px] text-slate-400 font-normal">Principal &amp; Interest only</p>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Viewing Widget */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-soft space-y-6 no-print">
            <h3 className="text-lg font-serif font-bold text-luxury border-b border-slate-100 pb-3">Schedule a Viewing</h3>
            
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Tour Type Select */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setBookingForm({ ...bookingForm, tourType: 'in-person' })}
                  className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    bookingForm.tourType === 'in-person'
                      ? 'bg-white text-luxury shadow-sm'
                      : 'text-slate-500 hover:text-luxury'
                  }`}
                >
                  In-Person
                </button>
                <button
                  type="button"
                  onClick={() => setBookingForm({ ...bookingForm, tourType: 'virtual' })}
                  className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    bookingForm.tourType === 'virtual'
                      ? 'bg-white text-luxury shadow-sm'
                      : 'text-slate-500 hover:text-luxury'
                  }`}
                >
                  Virtual Video
                </button>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={bookingForm.name}
                  onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-xs"
                />
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Your Email"
                  value={bookingForm.email}
                  onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-xs"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Your Phone Number"
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Select Date</label>
                  <input
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-xs cursor-pointer bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Time Slot</label>
                  <select
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-xs cursor-pointer bg-white"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={bookingSubmitting}
                className="w-full py-3 bg-gold hover:bg-yellow-600 text-white rounded-xl font-bold transition-all shadow-md text-xs disabled:bg-slate-300 flex items-center justify-center gap-2"
              >
                {bookingSubmitting ? 'Scheduling...' : 'Request Appointment'}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Similar Properties Section */}
      {similar.length > 0 && (
        <section className="space-y-6 pt-8 border-t border-slate-200 no-print">
          <div>
            <h2 className="text-2xl font-serif font-bold text-luxury">Similar Properties</h2>
            <p className="text-slate-400 text-xs mt-1">Explore other listings in the same category type.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {similar.map((prop) => (
              <PropertyCard key={prop._id || prop.id} property={prop} />
            ))}
          </div>
        </section>
      )}
      {/* Premium Lightbox Modal */}
      {showLightbox && (
        <div 
          className="fixed inset-0 bg-black/98 z-[100] flex flex-col justify-between p-6 select-none animate-fade-in font-sans"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeLightbox();
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => handleTouchEnd(nextLightbox, prevLightbox)}
        >
          {/* Header */}
          <div className="flex justify-between items-center text-white pb-3 border-b border-white/10 z-50">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold tracking-widest bg-white/10 px-3 py-1 rounded-full uppercase w-max">
                Photo {lightboxIndex + 1} of {imageUrls.length}
              </span>
              <span className="text-xs font-medium text-slate-400 mt-1 hidden sm:inline">{property.title}</span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Zoom Button */}
              {imageUrls.length > 0 && (
                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all"
                  title={isZoomed ? "Zoom Out" : "Zoom In"}
                >
                  {isZoomed ? <FaSearchMinus className="text-sm text-gold" /> : <FaSearchPlus className="text-sm text-gold" />}
                  <span>{isZoomed ? "Zoom Out" : "Zoom In"}</span>
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="flex items-center gap-1.5 px-4 py-2 bg-gold hover:bg-yellow-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer uppercase tracking-wider"
                title="Close Gallery"
              >
                <FaTimes className="text-sm" />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Main Stage */}
          <div 
            className="flex-1 flex items-center justify-between gap-4 py-4 relative z-45"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeLightbox();
              }
            }}
          >
            {/* Prev Button */}
            <button
              onClick={prevLightbox}
              className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 shrink-0 z-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={imageUrls.length <= 1}
            >
              <FaChevronLeft className="text-xl" />
            </button>

            {/* Active Image Container */}
            <div 
              className="flex-1 flex items-center justify-center h-full max-h-[70vh] overflow-hidden"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeLightbox();
                }
              }}
            >
              <div 
                className={`relative transition-all duration-300 max-w-[85vw] ${
                  isZoomed ? 'overflow-auto max-h-[70vh] p-4 cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <img
                  src={imageUrls[lightboxIndex]}
                  alt=""
                  className={`mx-auto object-contain rounded-xl shadow-2xl transition-all duration-300 ${
                    isZoomed ? 'scale-150 max-h-[90vh]' : 'max-h-[70vh] scale-100'
                  }`}
                />
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={nextLightbox}
              className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 shrink-0 z-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={imageUrls.length <= 1}
            >
              <FaChevronRight className="text-xl" />
            </button>
          </div>

          {/* Thumbnail Strip Footer */}
          {imageUrls.length > 1 && (
            <div className="flex justify-center gap-3 overflow-x-auto pb-4 max-w-[80vw] mx-auto scrollbar-hide z-50">
              {imageUrls.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={`w-20 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    lightboxIndex === idx ? 'border-gold scale-95 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
