import React from 'react'
import Hero from '../components/Home/Hero'
import FeaturedProperties from '../components/Home/FeaturedProperties'
import WhyChooseUs from '../components/Home/WhyChooseUs'
import AgentsPreview from '../components/Home/AgentsPreview'
import Testimonials from '../components/Home/Testimonials'

const Home = () => {
  return (
    <div>
      <Hero />
      <FeaturedProperties />
      <WhyChooseUs />
      <AgentsPreview />
      <Testimonials />
    </div>
  )
}

export default Home