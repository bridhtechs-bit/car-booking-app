import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { getAllCars, setFilters } from "../features/car/carSlice";
import { fetchUserBookings, resetBookingState } from "../features/auth/bookingSlice";
import CarCard from "../components/CarCard";
import useRefreshData from "../hooks/useRefreshData";
import "./carlisting.css";

const CarListing = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { cars, filteredCars, filters, loading } = useSelector((state) => state.car);

  const [localFilters, setLocalFilters] = useState({
    category: searchParams.get("category") || "",
    transmission: "",
    fuelType: "",
    minPrice: 0,
    maxPrice: 500,
    search: searchParams.get("search") || "",
  });

  // ✅ Refresh cars and bookings data every 5 minutes
  // This ensures frontend stays in sync with backend changes
  // (e.g., when CRON job marks cars as available after booking expires)
  useRefreshData(5 * 60 * 1000, true); // 5 minutes, refresh bookings too

  // Reset booking state on mount AFTER useRefreshData to ensure success = false
  useEffect(() => {
    dispatch(resetBookingState());
  }, [dispatch]);

  useEffect(() => {
    if (localFilters.search || localFilters.category) {
      dispatch(setFilters(localFilters));
    }
  }, [localFilters, dispatch]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({
      ...prev,
      [name]: parseInt(value),
    }));
  };

  const handleResetFilters = () => {
    setLocalFilters({
      category: "",
      transmission: "",
      fuelType: "",
      minPrice: 0,
      maxPrice: 500,
      search: "",
    });
  };

  // Mock filter data if API not available
  const mockCars = [];

  const displayCars = filteredCars.length > 0 ? filteredCars : cars;

  const filteredResults = displayCars.filter((car) => {
    if (
      localFilters.category &&
      car.category.toLowerCase() !== localFilters.category.toLowerCase()
    )
      return false;
    if (
      localFilters.transmission &&
      car.transmission !== localFilters.transmission
    )
      return false;
    if (localFilters.fuelType && car.fuelType !== localFilters.fuelType)
      return false;
    if (car.price < localFilters.minPrice || car.price > localFilters.maxPrice)
      return false;
    if (
      localFilters.search &&
      !car.name.toLowerCase().includes(localFilters.search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="car-listing-page">
      <div className="container">
        <h1>Browse Cars</h1>
        <p>Find the perfect car for your needs</p>

        <div className="listing-content">
          {/* Sidebar */}
          <aside className="filters-sidebar">
            <div className="filter-header">
              <h3>Filters</h3>
              <button onClick={handleResetFilters} className="reset-btn">
                Reset
              </button>
            </div>

            {/* Search */}
            <div className="filter-group">
              <label>Search by Name</label>
              <input
                type="text"
                name="search"
                value={localFilters.search}
                onChange={handleFilterChange}
                placeholder="Car name..."
                className="filter-input"
              />
            </div>

            {/* Category */}
            <div className="filter-group">
              <label>Category</label>
              <select
                name="category"
                value={localFilters.category}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Categories</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="hatchback">Hatchback</option>
                <option value="coupe">Coupe</option>
                <option value="convertible">Convertible</option>
                <option value="van">Van</option>
              </select>
            </div>

            {/* Transmission */}
            <div className="filter-group">
              <label>Transmission</label>
              <select
                name="transmission"
                value={localFilters.transmission}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Types</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            {/* Fuel Type */}
            <div className="filter-group">
              <label>Fuel Type</label>
              <select
                name="fuelType"
                value={localFilters.fuelType}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Types</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="filter-group">
              <label>Price Range: ${localFilters.minPrice} - ${localFilters.maxPrice}/day</label>
              <div className="price-inputs">
                <input
                  type="range"
                  name="minPrice"
                  min="0"
                  max="500"
                  value={localFilters.minPrice}
                  onChange={handlePriceChange}
                  className="price-range"
                />
                <input
                  type="range"
                  name="maxPrice"
                  min="0"
                  max="500"
                  value={localFilters.maxPrice}
                  onChange={handlePriceChange}
                  className="price-range"
                />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="cars-main">
            <div className="results-header">
              <h2>Available Cars ({filteredResults.length})</h2>
            </div>

            {loading ? (
              <div className="loading">Loading cars...</div>
            ) : filteredResults.length > 0 ? (
              <div className="cars-grid">
                {filteredResults.map((car) => (
                  <CarCard key={car._id} car={car} />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>No cars found matching your criteria.</p>
                <button onClick={handleResetFilters} className="reset-btn-large">
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CarListing;
