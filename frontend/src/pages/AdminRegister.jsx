import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function AdminRegister() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setLoading(true)
      setError(null)
      // Force role to 'admin'
      await register({ name, email, password, role: 'admin' })
      toast.success('Administrator account registered successfully!')
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="max-w-xl mx-auto my-12 rounded-[32px] bg-white p-8 shadow-soft border border-slate-200/80">
      <div className="text-center space-y-2 mb-6">
        <span className="text-[10px] font-bold text-gold uppercase tracking-widest bg-gold/10 px-4 py-1.5 rounded-full">
          Secure Portal
        </span>
        <h1 className="text-3xl font-serif font-bold text-luxury mt-2">Create Administrator Account</h1>
        <p className="text-slate-400 text-xs font-medium">
          Set up credentials for global platform administration.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:border-gold transition-colors text-sm"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@luxuryestate.com"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:border-gold transition-colors text-sm"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:border-gold transition-colors text-sm"
            required
            disabled={loading}
          />
        </div>

        {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-luxury text-white rounded-xl font-bold hover:bg-black transition-all shadow-sm text-sm disabled:bg-slate-300 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Registering Admin...</span>
            </>
          ) : (
            'Register Administrator'
          )}
        </button>
      </form>
    </section>
  )
}
