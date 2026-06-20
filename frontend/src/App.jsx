import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { WishlistProvider } from './context/WishlistContext'
import { CompareProvider } from './context/CompareContext'
import { CurrencyProvider } from './context/CurrencyContext'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import Properties from './pages/Properties'
import PropertyDetails from './pages/PropertyDetails'
import Agents from './pages/Agents'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminRegister from './pages/AdminRegister'
import Wishlist from './pages/Wishlist'
import Compare from './pages/Compare'
import Profile from './pages/Profile'
import Valuation from './pages/Valuation'
import CompareDrawer from './components/common/CompareDrawer'
import CookieConsent from './components/common/CookieConsent'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="properties" element={<Properties />} />
          <Route path="property/:id" element={<PropertyDetails />} />
          <Route path="agents" element={<Agents />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="admin-register" element={<AdminRegister />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="compare" element={<Compare />} />
          <Route path="profile" element={<Profile />} />
          <Route path="valuation" element={<Valuation />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <CurrencyProvider>
            <WishlistProvider>
              <CompareProvider>
                <Toaster position="top-right" />
                <AnimatedRoutes />
                <CompareDrawer />
                <CookieConsent />
              </CompareProvider>
            </WishlistProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
