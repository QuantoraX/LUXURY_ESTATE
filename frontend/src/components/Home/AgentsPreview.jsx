import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import AgentCard from '../Agents/AgentCard'
import { userApi } from '../../services/api'

const STATIC_ELITE_AGENTS = [
  {
    _id: 'mock-1',
    name: 'Marcus Vance',
    role: 'Director of Luxury Sales',
    sales: '$280M+ Closed Volume',
    email: 'marcus@luxestate.com',
    phone: '+1 (310) 555-0182',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'
  },
  {
    _id: 'mock-2',
    name: 'Sarah Jenkins',
    role: 'Private Client Advisor',
    sales: '$150M+ Closed Volume',
    email: 'sarah@luxestate.com',
    phone: '+1 (310) 555-0144',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
  },
  {
    _id: 'mock-3',
    name: 'Elena Rostova',
    role: 'International Relations Partner',
    sales: '$95M+ Closed Volume',
    email: 'elena@luxestate.com',
    phone: '+1 (310) 555-0191',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80'
  }
]

export default function AgentsPreview() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true)
        const res = await userApi.getAgents()
        const fetchedAgents = res?.data || []
        if (fetchedAgents.length > 0) {
          setAgents(fetchedAgents.slice(0, 3))
        } else {
          setAgents(STATIC_ELITE_AGENTS)
        }
      } catch (error) {
        console.error('Failed to load agents for preview:', error)
        setAgents(STATIC_ELITE_AGENTS)
      } finally {
        setLoading(false)
      }
    }
    fetchAgents()
  }, [])

  return (
    <section className="py-20 bg-cream">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold text-gold uppercase tracking-widest bg-gold/10 px-4 py-1.5 rounded-full">
              Expertise
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-luxury">
              Meet Our Elite Advisors
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              We connect you with dedicated professionals who represent some of the world's most premier estates.
            </p>
          </div>
          
          <div className="shrink-0">
            <Link 
              to="/agents" 
              className="inline-block border border-gold text-gold hover:bg-gold hover:text-white px-6 py-3 font-semibold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-sm"
            >
              View All Agents
            </Link>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-10 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
            <p className="text-slate-400 text-xs font-medium">Connecting with advisors...</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent, index) => (
              <motion.div
                key={agent._id || agent.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <AgentCard agent={agent} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
