import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./herosection.css";

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/cars?search=${searchTerm}`);
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1>Find Your Perfect Car</h1>
        <p>Book premium cars for your next journey</p>
        
        <form onSubmit={handleSearch} className="hero-search-form">
          <div className="search-group">
            <input
              type="text"
              placeholder="Search cars by name or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              Search
            </button>
          </div>
        </form>

        <div className="hero-features">
          <div className="feature">
            <i className="bi bi-shield-check"></i>
            <span>Safe & Secure</span>
          </div>
          <div className="feature">
            <i className="bi bi-lightning-charge"></i>
            <span>Fast Booking</span>
          </div>
          <div className="feature">
            <i className="bi bi-wallet2"></i>
            <span>Best Prices</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
