import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AdminDashboard from '../components/Dashboard/AdminDashboard'
import OwnerDashboard from '../components/Dashboard/OwnerDashboard'
import ClientDashboard from '../components/Dashboard/ClientDashboard'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return (
      <section className="text-center py-20 bg-white border border-slate-200 rounded-[32px] p-8 shadow-soft max-w-xl mx-auto my-10">
        <h1 className="text-3xl font-semibold text-luxury">Access Denied</h1>
        <p className="text-slate-500 mt-2 text-sm">Please log in to access your dashboard</p>
        <button 
          onClick={() => navigate('/login')} 
          className="mt-6 bg-gold hover:bg-yellow-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors text-sm shadow-sm"
        >
          Go to Login
        </button>
      </section>
    )
  }

  const isAdmin = user.role === 'admin'
  const isAgent = user.role === 'agent'
  const isClient = user.role === 'user'

  return (
    <section className="space-y-8">
      <header className="border-b border-slate-200 pb-6">
        <h1 className="text-4xl font-serif font-bold text-luxury">
          {isAdmin ? 'Admin' : isAgent ? 'Owner' : 'Client'} Dashboard
        </h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">
          {isAdmin
            ? 'Manage global property listings, user accounts, and view platform metrics.'
            : isAgent
            ? 'Welcome back! Manage your listings, track pricing, and view listing statistics.'
            : 'Welcome back! Explore your saved properties and review sent inquiries.'}
        </p>
      </header>
      
      {isAdmin && <AdminDashboard />}
      {isAgent && <OwnerDashboard />}
      {isClient && <ClientDashboard />}
    </section>
  )
}
