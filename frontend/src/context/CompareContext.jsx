import React, { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const CompareContext = createContext()

export const useCompare = () => {
  const context = useContext(CompareContext)
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider')
  }
  return context
}

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([])

  // Load initial compared properties from LocalStorage if available
  useEffect(() => {
    const stored = window.localStorage.getItem('luxestate-compare')
    if (stored) {
      try {
        setCompareList(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse compared properties', e)
      }
    }
  }, [])

  // Save to local storage whenever list changes
  const saveToStorage = (list) => {
    setCompareList(list)
    window.localStorage.setItem('luxestate-compare', JSON.stringify(list))
  }

  const addToCompare = (property) => {
    // Check if already in list
    if (compareList.some(p => (p._id || p.id) === (property._id || property.id))) {
      toast.error('Property is already added to comparison.')
      return
    }

    // Limit to maximum of 3 properties
    if (compareList.length >= 3) {
      toast.error('You can compare a maximum of 3 properties side-by-side.')
      return
    }

    const newList = [...compareList, property]
    saveToStorage(newList)
    toast.success(`"${property.title}" added to comparison.`)
  }

  const removeFromCompare = (id) => {
    const newList = compareList.filter(p => (p._id || p.id) !== id)
    saveToStorage(newList)
    toast.success('Property removed from comparison.')
  }

  const clearCompare = () => {
    saveToStorage([])
    toast.success('Comparison list cleared.')
  }

  const isCompared = (id) => {
    return compareList.some(p => (p._id || p.id) === id)
  }

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isCompared
      }}
    >
      {children}
    </CompareContext.Provider>
  )
}
