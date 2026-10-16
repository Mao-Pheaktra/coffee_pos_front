import React from 'react'
import Hero from '../../components/home/Hero'
import CategorySection from '../../components/home/CategorySection'
import Popular from '../../components/home/Popular'
import Promotion from '../../components/home/Promotion'

const Home = () => {
  return (
    <div>
        <Hero/>
        <CategorySection/>
        <Popular/>
        <Promotion/>
    </div>
  )
}

export default Home