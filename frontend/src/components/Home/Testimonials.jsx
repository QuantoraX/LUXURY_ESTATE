import React from 'react'
import { motion } from 'framer-motion'
import { FaStar, FaQuoteLeft } from 'react-icons/fa'

export default function Testimonials() {
  const feedback = [
    {
      quote: "The acquisition of our penthouse in Manhattan was handled with absolute discretion. The team's advisory and market intelligence is second to none.",
      author: "Charlotte Dubois",
      details: "CEO, Dubois Capital — New York",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
    },
    {
      quote: "LuxEstate helped us find an off-market beachfront villa in Malibu. Their relationship-driven approach made a complex transaction seamless.",
      author: "David Stern",
      details: "Tech Investor — Los Angeles",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    },
    {
      quote: "A flawless experience. Every detail from property viewing to legal closing was managed with meticulous precision. Highly recommended.",
      author: "Sophia Laurent",
      details: "Creative Director — Paris Office",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    }
  ]

  return (
    <section className="py-20 bg-white border-t border-slate-100">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-xs font-bold text-gold uppercase tracking-widest bg-gold/10 px-4 py-1.5 rounded-full"
          >
            Endorsements
          </motion.span>
          
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-luxury">
            Distinguished Client Experiences
          </h2>
          
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            The trust of our clients is our most valuable asset. Discover stories of successful residential curation.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {feedback.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              whileHover={{ scale: 1.02 }}
              className="bg-cream border border-slate-200/50 p-8 rounded-[32px] shadow-soft flex flex-col justify-between relative"
            >
              {/* Quote Icon */}
              <FaQuoteLeft className="absolute top-6 right-6 text-gold/10 text-4xl" />

              <div>
                {/* Stars */}
                <div className="flex gap-1 text-gold text-xs mb-5">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                </div>
                
                <p className="text-slate-600 italic text-sm leading-relaxed mb-6 font-medium relative z-10">
                  "{item.quote}"
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                <img
                  src={item.avatar}
                  alt={item.author}
                  className="w-12 h-12 rounded-full object-cover border border-gold/10"
                />
                <div>
                  <h4 className="font-bold text-luxury text-sm">{item.author}</h4>
                  <p className="text-[10px] text-slate-400 font-bold tracking-wide uppercase mt-0.5">{item.details}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
