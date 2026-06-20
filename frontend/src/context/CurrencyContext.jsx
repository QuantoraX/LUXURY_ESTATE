import React, { createContext, useContext, useState, useEffect } from 'react'

const CurrencyContext = createContext()

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return window.localStorage.getItem('luxestate-currency') || 'USD'
  })

  useEffect(() => {
    window.localStorage.setItem('luxestate-currency', currency)
  }, [currency])

  const rates = {
    USD: 1,
    LKR: 334,
    EUR: 0.92
  }

  const formatPrice = (usdPrice) => {
    if (usdPrice === null || usdPrice === undefined) return ''
    const converted = usdPrice * rates[currency]
    
    if (currency === 'LKR') {
      return `Rs. ${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    } else if (currency === 'EUR') {
      return `€${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    } else {
      return `$${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    }
  }

  const getRawConvertedPrice = (usdPrice) => {
    if (usdPrice === null || usdPrice === undefined) return 0
    return usdPrice * rates[currency]
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, getRawConvertedPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
