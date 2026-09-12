import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { setFilters } from "../features/car/carSlice";
import { resetBookingState } from "../features/auth/bookingSlice";
import CarCard from "../components/CarCard";
import useRefreshData from "../hooks/useRefreshData";
import useDebounce from "../hooks/useDebounce";
import "./carlisting.css";

const CarListing = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { cars, filteredCars, loading } = useSelector((state) => state.car);

  const [localFilters, setLocalFilters] = useState({
    category: searchParams.get("category") || "",
    transmission: "",
    fuelType: "",
    minPrice: 0,
    maxPrice: 500,
    search: searchParams.get("search") || "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("availability");

  // Debounce filter changes (400ms delay) to avoid excessive processing on every keystroke
  const debouncedFilters = useDebounce(localFilters, 400);

  // ✅ Refresh cars and bookings data every 5 minutes
  // This ensures frontend stays in sync with backend changes
  // (e.g., when CRON job marks cars as available after booking expires)
  useRefreshData(5 * 60 * 1000, true); // 5 minutes, refresh bookings too

  // Reset booking state on mount AFTER useRefreshData to ensure success = false
  useEffect(() => {
    dispatch(resetBookingState());
  }, [dispatch]);

  useEffect(() => {
    if (debouncedFilters.search || debouncedFilters.category) {
      dispatch(setFilters(debouncedFilters));
    }
  }, [debouncedFilters, dispatch]);

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

  const toggleQuickFilter = (name, value) => {
    setLocalFilters((previous) => ({
      ...previous,
      [name]: previous[name] === value ? "" : value,
    }));
  };

  const displayCars = filteredCars.length > 0 ? filteredCars : cars;

  const filteredResults = displayCars.filter((car) => {
    if (
      debouncedFilters.category &&
      car.category.toLowerCase() !== debouncedFilters.category.toLowerCase()
    )
      return false;
    if (
      debouncedFilters.transmission &&
      car.transmission !== debouncedFilters.transmission
    )
      return false;
    if (debouncedFilters.fuelType && car.fuelType !== debouncedFilters.fuelType)
      return false;
    const price = Number(car.pricePerDay || car.price || 0);
    if (price < debouncedFilters.minPrice || price > debouncedFilters.maxPrice)
      return false;
    if (
      debouncedFilters.search &&
      !car.name.toLowerCase().includes(debouncedFilters.search.toLowerCase())
    )
      return false;
    return true;
  }).sort((firstCar, secondCar) => {
    if (sortBy === "price") {
      return Number(firstCar.pricePerDay || firstCar.price || 0) - Number(secondCar.pricePerDay || secondCar.price || 0);
    }
    if (sortBy === "name") return firstCar.name.localeCompare(secondCar.name);
    return Number(secondCar.available) - Number(firstCar.available);
  });

  return (
    <div className="car-listing-page">
      <div className="catalogue-shell">
        <header className="catalogue-header">
          <div>
            <span className="catalogue-kicker">DRIVIO</span>
            <h1 id="page-heading">Véhicules disponibles</h1>
            <p>Sélectionnez un véhicule adapté à votre prochain trajet.</p>
          </div>
          <div className="catalogue-count" role="status" aria-label={`${filteredResults.length} véhicules affichés`}>
            <span aria-hidden="true" className="availability-dot"></span>
            <span>{filteredResults.length} résultat{filteredResults.length > 1 ? "s" : ""}</span>
          </div>
        </header>

        <div className="accessibility-note" role="note">
          <i className="bi bi-universal-access" aria-hidden="true"></i>
          <span><strong>Réservation accessible</strong> · Contraste et zones tactiles adaptés au mobile.</span>
        </div>

        <section className="catalogue-tools" aria-label="Recherche et filtres">
          <label htmlFor="car-search">Rechercher un véhicule</label>
          <div className="catalogue-search-row">
            <div className="catalogue-search">
              <i className="bi bi-search" aria-hidden="true"></i>
              <input
                id="car-search"
                type="search"
                name="search"
                value={localFilters.search}
                onChange={handleFilterChange}
                placeholder="Modèle ou marque..."
              />
            </div>
            <button type="button" className="filter-toggle" onClick={() => setShowFilters((visible) => !visible)} aria-expanded={showFilters} aria-controls="catalogue-filters">
              <i className="bi bi-sliders2" aria-hidden="true"></i>
              <span>Filtres</span>
            </button>
          </div>

          <div className="quick-filters" role="toolbar" aria-label="Filtres rapides">
            <button type="button" className={localFilters.transmission === "automatic" ? "quick-filter active" : "quick-filter"} aria-pressed={localFilters.transmission === "automatic"} onClick={() => toggleQuickFilter("transmission", "automatic")}>Boîte auto</button>
            <button type="button" className={localFilters.fuelType === "Electric" ? "quick-filter active" : "quick-filter"} aria-pressed={localFilters.fuelType === "Electric"} onClick={() => toggleQuickFilter("fuelType", "Electric")}><i className="bi bi-lightning-charge" aria-hidden="true"></i> Électrique</button>
            <button type="button" className={localFilters.category === "suv" ? "quick-filter active" : "quick-filter"} aria-pressed={localFilters.category === "suv"} onClick={() => toggleQuickFilter("category", "suv")}>SUV</button>
            <button type="button" className={localFilters.maxPrice === 80 ? "quick-filter active" : "quick-filter"} aria-pressed={localFilters.maxPrice === 80} onClick={() => setLocalFilters((previous) => ({ ...previous, maxPrice: previous.maxPrice === 80 ? 500 : 80 }))}>Prix &lt; 80 €/j</button>
          </div>

          <div className="catalogue-sort-row">
            <span>{filteredResults.length} véhicule{filteredResults.length > 1 ? "s" : ""} affiché{filteredResults.length > 1 ? "s" : ""}</span>
            <label htmlFor="sort-select">Trier :</label>
            <select id="sort-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="availability">Disponibilité</option>
              <option value="price">Prix croissant</option>
              <option value="name">Nom</option>
            </select>
          </div>
        </section>

        <div className={`listing-content${showFilters ? " filters-open" : ""}`}>
          {/* Sidebar */}
          <aside className="filters-sidebar" id="catalogue-filters" aria-label="Filtres détaillés">
            <div className="filter-header">
              <h3>Filters</h3>
              <button onClick={handleResetFilters} className="reset-btn">
                Reset
              </button>
            </div>

            {/* Search */}
            <div className="filter-group">
              <label htmlFor="car-search">Search by Name</label>
              <input
                id="car-search"
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
              <label htmlFor="car-category">Category</label>
              <select
                id="car-category"
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
              <label htmlFor="car-transmission">Transmission</label>
              <select
                id="car-transmission"
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
              <label htmlFor="car-fuel-type">Fuel Type</label>
              <select
                id="car-fuel-type"
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
              <span id="price-range-label">Price Range: ${localFilters.minPrice} - ${localFilters.maxPrice}/day</span>
              <div className="price-inputs">
                <input
                  aria-label="Minimum price per day"
                  aria-describedby="price-range-label"
                  type="range"
                  name="minPrice"
                  min="0"
                  max="500"
                  value={localFilters.minPrice}
                  onChange={handlePriceChange}
                  className="price-range"
                />
                <input
                  aria-label="Maximum price per day"
                  aria-describedby="price-range-label"
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
          <main className="cars-main" aria-labelledby="page-heading">

            {loading ? (
              <div className="loading" role="status" aria-live="polite">Loading cars...</div>
            ) : filteredResults.length > 0 ? (
              <div className="cars-grid" aria-label="Liste des véhicules">
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
