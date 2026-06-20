import React from 'react'
import { motion } from 'framer-motion'
import { FaShieldAlt, FaHandshake, FaHeadphones } from 'react-icons/fa'

export default function WhyChooseUs() {
  const cards = [
    {
      icon: <FaShieldAlt className="text-2xl text-gold" />,
      title: 'Verified Listings',
      description: 'We audit every property in our portfolio to guarantee the highest architectural standards, structural safety, and listing accuracy.'
    },
    {
      icon: <FaHandshake className="text-2xl text-gold" />,
      title: 'Trusted Advisors',
      description: 'Our agents are seasoned luxury real estate advisors dedicated to managing your acquisitions with complete discretion and expertise.'
    },
    {
      icon: <FaHeadphones className="text-2xl text-gold" />,
      title: 'Bespoke Support',
      description: 'Enjoy 24/7 dedicated client assistance at every stage, guiding you from your initial inquiry to final key handover.'
    }
  ]

  return (
    <section className="py-20 bg-white border-y border-slate-100">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-xs font-bold text-gold uppercase tracking-widest bg-gold/10 px-4 py-1.5 rounded-full"
          >
            Our Core Strengths
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl font-serif font-bold text-luxury"
          >
            Why Discerning Clients Choose LuxEstate
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-500 text-sm font-medium leading-relaxed"
          >
            We refine the property acquisition journey, delivering unmatched excellence and dedicated service to high-profile investors.
          </motion.p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              whileHover={{ y: -8 }}
              className="bg-cream border border-slate-200/60 p-8 rounded-[32px] shadow-soft hover:shadow-lg transition-all flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md mb-6 border border-slate-100 group-hover:bg-gold transition-colors duration-300">
                <span className="group-hover:text-white transition-colors duration-300">
                  {card.icon}
                </span>
              </div>
              
              <h3 className="text-xl font-serif font-bold text-luxury mb-3">
                {card.title}
              </h3>
              
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
