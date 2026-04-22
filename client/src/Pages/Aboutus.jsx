import React from 'react'
import AboutStory from '../Components/AboutUs/AboutStory'
import AboutPhilosophy from '../Components/AboutUs/AboutPhilosophy'
import AboutChef from '../Components/AboutUs/AboutChef'
import ChefsCarousel from '../Components/AboutUs/ChefsCarousel'

const Aboutus = () => {
  return (
    <div className='-mt-20'>
        <AboutStory />
        <AboutPhilosophy />
        <AboutChef />
        <ChefsCarousel />
    </div>
  )
}

export default Aboutus