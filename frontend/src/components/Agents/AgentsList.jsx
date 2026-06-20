import React, { useState, useEffect } from 'react'
import AgentCard from './AgentCard'
import { userApi } from '../../services/api'
import toast from 'react-hot-toast'

const MOCK_AGENTS = [
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
  },
  {
    _id: 'mock-4',
    name: 'Jonathan Sterling',
    role: 'Premier Commercial Specialist',
    sales: '$110M+ Closed Volume',
    email: 'jonathan@luxestate.com',
    phone: '+1 (310) 555-0211',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80'
  },
  {
    _id: 'mock-5',
    name: 'Clarissa Harlow',
    role: 'Penthouse Brokerage Partner',
    sales: '$85M+ Closed Volume',
    email: 'clarissa@luxestate.com',
    phone: '+1 (310) 555-0233',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  },
  {
    _id: 'mock-6',
    name: 'Alexander Mercer',
    role: 'Coastal Luxury Advisor',
    sales: '$130M+ Closed Volume',
    email: 'alexander@luxestate.com',
    phone: '+1 (310) 555-0255',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  }
]

export default function AgentsList({ searchQuery = '' }) {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      setLoading(true)
      const res = await userApi.getAgents()
      const fetchedAgents = res?.data || []
      if (fetchedAgents.length > 0) {
        setAgents(fetchedAgents)
      } else {
        setAgents(MOCK_AGENTS)
      }
    } catch (error) {
      console.error('Failed to load real agents:', error)
      setAgents(MOCK_AGENTS)
    } finally {
      setLoading(false)
    }
  }

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (agent.email && agent.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (agent.role && agent.role.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold"></div>
        <p className="text-slate-400 text-xs font-medium">Connecting with advisors...</p>
      </div>
    )
  }

  if (filteredAgents.length === 0) {
    return (
      <div className="text-center py-16 bg-white border border-slate-200 rounded-[32px] p-8 shadow-soft max-w-md mx-auto">
        <p className="text-slate-500 font-medium">No agents found matching your search.</p>
        <p className="text-slate-400 text-xs mt-1">Please try searching with a different name or role.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {filteredAgents.map((agent) => (
        <AgentCard key={agent._id || agent.id} agent={agent} />
      ))}
    </div>
  )
}
