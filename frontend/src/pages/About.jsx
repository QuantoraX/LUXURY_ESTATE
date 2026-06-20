import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaCrown, FaGem, FaHandshake, FaShieldAlt, FaAward, FaHistory, FaUsers, FaGlobe } from 'react-icons/fa'

export default function About() {
  const values = [
    {
      icon: <FaCrown className="text-2xl text-gold" />,
      title: 'Uncompromised Excellence',
      description: 'We curate only the finest properties, ensuring each listing meets the highest standards of architectural integrity and design.'
    },
    {
      icon: <FaShieldAlt className="text-2xl text-gold" />,
      title: 'Absolute Discretion',
      description: 'Privacy is our hallmark. We represent our clients with the utmost confidentiality, safeguarding their transactions and identities.'
    },
    {
      icon: <FaGem className="text-2xl text-gold" />,
      title: 'Bespoke Services',
      description: 'Every client receives custom-tailored representation, aligning specifically with their unique lifestyle requirements and financial portfolios.'
    },
    {
      icon: <FaHandshake className="text-2xl text-gold" />,
      title: 'Trust & Integrity',
      description: 'Built on a foundation of transparency, our advisory guides clients through complex luxury transactions with honesty and precision.'
    }
  ]

  const stats = [
    { value: '$4.8B+', label: 'Closed Sales Volume' },
    { value: '12+', label: 'Years of Curation' },
    { value: '150+', label: 'Bespoke Global Agents' },
    { value: '99.8%', label: 'Client Satisfaction Rate' }
  ]

  return (
    <div className="space-y-20 py-8">
      {/* Hero Section */}
      <section className="relative rounded-[40px] overflow-hidden h-[400px] flex items-center justify-center text-center px-4 bg-luxury">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')` }}
        ></div>
        <div className="relative max-w-3xl space-y-6">
          <motion.span 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs font-bold text-gold uppercase tracking-widest bg-gold/15 px-4 py-1.5 rounded-full"
          >
            Est. 2014
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight"
          >
            The Pinnacle of Luxury Living
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-200 text-sm md:text-base font-medium max-w-2xl mx-auto"
          >
            Redefining residential luxury by connecting elite clientele with architectural masterpieces globally.
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <FaHistory className="text-gold text-sm" />
            <span className="text-xs font-bold text-gold uppercase tracking-wider">Our Heritage</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-luxury">Curation With Intention</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Founded with a vision to streamline high-end property transactions, Luxury Estate has grown into a premier global real estate advisory. We believe that a home is not simply a physical structure; it is an extension of one's identity and a sanctuary for generations.
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            Our global team of real estate advisors carefully curates each property in our portfolio. From beachfront estates in Malibu to mid-century modern penthouses in Manhattan, we ensure that every space delivers on design, safety, and exclusivity.
          </p>
          <div className="pt-2">
            <button className="px-6 py-3 bg-luxury hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm">
              Discover Our Services
            </button>
          </div>
        </div>
        <div className="relative h-[450px] rounded-[32px] overflow-hidden shadow-soft border border-slate-200 bg-slate-100">
          <img 
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Luxury home interior" 
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border border-slate-200 rounded-[32px] p-8 md:p-12 shadow-soft">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 lg:divide-x divide-slate-100">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-2 pt-6 md:pt-0">
              <h3 className="text-4xl md:text-5xl font-serif font-bold text-luxury">{stat.value}</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="flex justify-center items-center gap-2">
            <FaAward className="text-gold text-sm" />
            <span className="text-xs font-bold text-gold uppercase tracking-wider">Our Standards</span>
          </div>
          <h2 className="text-3xl font-serif font-bold text-luxury">The Luxury Estate Principles</h2>
          <p className="text-slate-500 text-xs font-medium">
            Four guiding values that shape how we represent our buyers and sellers in every market.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((v, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-slate-200 p-8 rounded-[32px] shadow-soft hover:shadow-lg transition-all flex items-start gap-5 group"
            >
              <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-gold group-hover:text-white transition-colors duration-300">
                {v.icon}
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-luxury text-lg">{v.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{v.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Global Presence Banner */}
      <section className="rounded-[32px] bg-slate-950 p-8 md:p-12 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-full -mr-20 -mt-20"></div>
        <div className="max-w-2xl space-y-4">
          <div className="flex items-center gap-2">
            <FaGlobe className="text-gold text-sm" />
            <span className="text-xs font-bold text-gold uppercase tracking-wider">Global Reach</span>
          </div>
          <h2 className="text-3xl font-serif font-bold leading-tight">Representing Masterpieces Across Six Continents</h2>
          <p className="text-slate-400 text-sm max-w-xl">
            Our interconnected global network spans international luxury capitals, ensuring your home receives unparalleled exposure to high-net-worth foreign investors.
          </p>
        </div>
        <div className="shrink-0 flex items-center">
          <Link to="/contact" className="px-8 py-3.5 bg-gold hover:bg-yellow-600 text-white text-xs font-bold rounded-xl transition-colors shadow-lg">
            Consult With Our Experts
          </Link>
        </div>
      </section>
    </div>
  )
}
