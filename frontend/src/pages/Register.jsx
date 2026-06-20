import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import useAuth from '../hooks/useAuth'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user') // default to standard user
  const [error, setError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await register({ name, email, password, role })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="max-w-xl mx-auto my-12 rounded-3xl bg-white p-8 shadow-soft border border-slate-100">
      <h1 className="text-3xl font-semibold text-luxury">Create an account</h1>
      <p className="text-slate-500 mt-2">Join Luxury Estate to explore properties or list your own.</p>
      
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Full name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:border-gold transition-colors"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:border-gold transition-colors"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:border-gold transition-colors"
            required
          />
        </label>

        <div className="block">
          <span className="text-sm font-medium text-slate-700">Account Type</span>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`py-3 px-4 rounded-xl border text-center font-medium transition-all ${
                role === 'user'
                  ? 'border-gold bg-gold/10 text-gold font-semibold'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Buyer / Client
            </button>
            <button
              type="button"
              onClick={() => setRole('agent')}
              className={`py-3 px-4 rounded-xl border text-center font-medium transition-all ${
                role === 'agent'
                  ? 'border-gold bg-gold/10 text-gold font-semibold'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Agent / Owner
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
        
        <button
          type="submit"
          className="w-full py-3 bg-luxury text-white rounded-xl font-medium hover:bg-black transition-colors shadow-sm"
        >
          Create Account
        </button>
      </form>
    </section>
  )
}
