import React, { useState, useEffect } from 'react'
import { FaCookieBite, FaTimes, FaShieldAlt } from 'react-icons/fa'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState({
    essential: true,
    performance: true,
    marketing: true
  })

  useEffect(() => {
    const consent = window.localStorage.getItem('luxestate-cookie-consent')
    if (!consent) {
      // Delay pop-up slightly for a premium, non-intrusive feel
      const timer = setTimeout(() => {
        setVisible(true)
      }, 1500)
      return () => clearTimeout(timer)
    } else {
      try {
        const parsed = JSON.parse(consent)
        setPreferences(parsed)
      } catch (e) {
        // Fallback
      }
    }
  }, [])

  useEffect(() => {
    const handleOpenSettings = () => {
      setVisible(true)
      setShowSettings(true)
    }
    window.addEventListener('luxestate-open-cookie-settings', handleOpenSettings)
    return () => window.removeEventListener('luxestate-open-cookie-settings', handleOpenSettings)
  }, [])

  const handleAcceptAll = () => {
    const consentVal = { essential: true, performance: true, marketing: true }
    window.localStorage.setItem('luxestate-cookie-consent', JSON.stringify(consentVal))
    setPreferences(consentVal)
    setVisible(false)
  }

  const handleAcceptSelected = () => {
    window.localStorage.setItem('luxestate-cookie-consent', JSON.stringify(preferences))
    setVisible(false)
    setShowSettings(false)
  }

  const handleDeclineAll = () => {
    const consentVal = { essential: true, performance: false, marketing: false }
    window.localStorage.setItem('luxestate-cookie-consent', JSON.stringify(consentVal))
    setPreferences(consentVal)
    setVisible(false)
    setShowSettings(false)
  }

  if (!visible) return null

  return (
    <>
      {/* Cookie Consent Banner */}
      <div className="fixed bottom-6 right-6 z-50 w-full max-w-md px-4 animate-slide-up select-none">
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 p-6 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-white space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gold/15 flex items-center justify-center text-gold shrink-0">
              <FaCookieBite className="text-lg animate-bounce" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-sm text-gold">We Value Your Privacy</h4>
              <p className="text-slate-400 text-xs leading-relaxed font-normal">
                This website uses cookies to enhance your experience, analyze site usage, and deliver personalized marketing offers.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Settings
            </button>
            <button
              onClick={handleDeclineAll}
              className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Reject
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-5 py-2.5 bg-gold hover:bg-yellow-600 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>

      {/* Cookie Settings Modal overlay */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 w-full max-w-md shadow-2xl relative animate-scale-up space-y-6">
            
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-full border border-slate-200 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <FaTimes className="text-xs" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
                <FaShieldAlt className="text-lg" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-luxury text-lg">Cookie Preferences</h3>
                <p className="text-[10px] font-bold text-gold uppercase tracking-wider">Customize privacy settings</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 space-y-4">
              {/* Essential */}
              <div className="flex items-center justify-between gap-4 pt-4">
                <div className="space-y-0.5 flex-1 pr-4">
                  <h4 className="text-xs font-bold text-luxury flex items-center gap-1.5">
                    Essential Cookies
                    <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">Required</span>
                  </h4>
                  <p className="text-slate-450 text-[10px] leading-normal font-normal">Necessary for login sessions, wishlist items, and base page rendering functions.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.essential}
                  disabled
                  className="w-4 h-4 text-gold border-slate-300 focus:ring-gold rounded cursor-not-allowed shrink-0"
                />
              </div>

              {/* Performance */}
              <div className="flex items-center justify-between gap-4 pt-4">
                <div className="space-y-0.5 flex-1 pr-4">
                  <h4 className="text-xs font-bold text-luxury">Performance & Analytics</h4>
                  <p className="text-slate-450 text-[10px] leading-normal font-normal">Collects anonymous usage parameters to help optimize page loading speeds and map controls.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={preferences.performance}
                    onChange={(e) => setPreferences({ ...preferences, performance: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold"></div>
                </label>
              </div>

              {/* Marketing */}
              <div className="flex items-center justify-between gap-4 pt-4">
                <div className="space-y-0.5 flex-1 pr-4">
                  <h4 className="text-xs font-bold text-luxury">Marketing & Personalization</h4>
                  <p className="text-slate-450 text-[10px] leading-normal font-normal">Used to customize your search parameters and store currency configuration preferences globally.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold"></div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={handleDeclineAll}
                className="px-4 py-2.5 text-red-500 hover:bg-red-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptSelected}
                className="px-5 py-2.5 bg-luxury hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
