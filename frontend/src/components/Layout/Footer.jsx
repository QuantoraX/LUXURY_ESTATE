import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaMapMarkerAlt, FaPhone, FaEnvelope, FaPaperPlane } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email.trim()) {
      toast.success('Thank you for subscribing to our private portfolio showcase!')
      setEmail('')
    }
  }

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-gold/20 pt-16 pb-8 font-sans">
      <div className="container mx-auto px-4">
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link to="/" className="text-2xl font-serif font-bold text-white tracking-wider block">
              <span className="text-gold font-sans font-bold">LUXURY</span> ESTATE
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Curators of the world's most prestigious properties, architectural masterpieces, and bespoke living spaces. We deliver unmatched real estate services tailored to high-profile clients.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: <FaFacebookF />, url: 'https://facebook.com' },
                { icon: <FaInstagram />, url: 'https://instagram.com' },
                { icon: <FaLinkedinIn />, url: 'https://linkedin.com' },
                { icon: <FaTwitter />, url: 'https://twitter.com' }
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-slate-800 bg-slate-900/50 hover:bg-gold hover:border-gold hover:text-white hover:-translate-y-1 transition-all duration-300 flex items-center justify-center text-xs text-slate-400"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-l-2 border-gold pl-3">
              Explore Collections
            </h4>
            <ul className="space-y-3 text-xs font-medium text-slate-400">
              {[
                { name: 'Featured Estates', path: '/properties' },
                { name: 'Apartments & Penthouses', path: '/properties?propertyType=apartment' },
                { name: 'Luxury Villas', path: '/properties?propertyType=villa' },
                { name: 'Exclusive Houses', path: '/properties?propertyType=house' },
                { name: 'Commercial Spaces', path: '/properties?propertyType=commercial' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="hover:text-gold transition-colors duration-300">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Links */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-l-2 border-gold pl-3">
              Company
            </h4>
            <ul className="space-y-3 text-xs font-medium text-slate-400">
              {[
                { name: 'Elite Advisors', path: '/agents' },
                { name: 'About Our Firm', path: '/about' },
                { name: 'Curated Inquiries', path: '/contact' },
                { name: 'Private Collection', path: '/wishlist' },
                { name: 'Client Dashboard', path: '/dashboard' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="hover:text-gold transition-colors duration-300">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-l-2 border-gold pl-3">
              Private Showcases
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Subscribe to receive private previews and early invitations to off-market estate listings.
            </p>

            <form onSubmit={handleSubscribe} className="relative">
              <input
                type="email"
                placeholder="Enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 focus:border-gold focus:outline-none rounded-xl py-3 pl-4 pr-12 text-xs text-white placeholder-slate-500 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 bg-gold hover:bg-yellow-600 text-white px-3.5 rounded-lg flex items-center justify-center transition-colors"
              >
                <FaPaperPlane className="text-[10px]" />
              </button>
            </form>

            <div className="space-y-3 pt-2 text-[11px] font-medium text-slate-400">
              <p className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-gold" /> Matara,Sri Lanka
              </p>
              <p className="flex items-center gap-2">
                <FaPhone className="text-gold" /> +94761234567
              </p>
              <p className="flex items-center gap-2">
                <FaEnvelope className="text-gold" /> inquire@luxestate.com
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} LUXURY ESTATE. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-gold transition-colors">Privacy Policy</Link>
            <Link to="/about" className="hover:text-gold transition-colors">Terms of Service</Link>
            <button 
              onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(new Event('luxestate-open-cookie-settings'));
              }}
              className="hover:text-gold transition-colors uppercase cursor-pointer"
            >
              Cookie settings
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
