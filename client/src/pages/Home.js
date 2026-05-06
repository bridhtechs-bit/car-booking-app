import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import HeroSection from '../components/HeroSection'
import CategoryBrowsing from '../components/CategoryBrowsing'
import FeaturedCars from '../components/FeaturedCars'
import { resetBookingState } from '../features/auth/bookingSlice'
import useRefreshData from '../hooks/useRefreshData'
import './home.css'

const Home = () => {
  const dispatch = useDispatch();

  // Reset booking state on mount FIRST - before any data fetching
  useEffect(() => {
    dispatch(resetBookingState());
  }, [dispatch]);

  // ✅ Refresh cars and bookings data every 5 minutes
  useRefreshData(5 * 60 * 1000, true);

  return (
    <div className='home-container'>
      <HeroSection />
      <CategoryBrowsing />
      <FeaturedCars />
      
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Book Your Car?</h2>
          <p>Browse our collection of premium vehicles available at affordable rates</p>
          <a href="/cars" className="cta-btn">Browse All Cars</a>
        </div>
      </section>
    </div>
  )
}

export default Home