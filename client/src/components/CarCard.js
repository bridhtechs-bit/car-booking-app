import React,{useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import "./carcard.css";
import { useSelector } from "react-redux";

const CarCard = ({ car }) => {
  const navigate = useNavigate();
  const { bookings } = useSelector((state) => state.booking);

  // Check availability based on:
  // 1. Car's available flag in database
  // 2. Active bookings with approved status
  const checkAvailability = () => {
    // If car is marked unavailable in DB, it's not available
    if (!car.available) return false;

    // Check for approved bookings that cover the current date
    const now = new Date();
    const activeBooking = bookings.find((b) => {
      if (b.carId !== car._id || b.status !== 'approved') return false;
      
      const startDate = new Date(b.startDate);
      const endDate = new Date(b.endDate);
      
      // Car is unavailable if current time is within the booking period
      return now >= startDate && now <= endDate;
    });

    return !activeBooking; // true if no active booking found
  };

  const [isAvailable, setIsAvailable] = useState(checkAvailability());

  useEffect(() => {
    setIsAvailable(checkAvailability());
  }, [bookings, car.available]);


  const handleViewDetails = () => {
    navigate(`/car/${car._id}`);
  };

  const handleBook = () => {
    navigate(`/car/${car._id}?book=true`);
  };

  return (
    <div className={`car-card ${!isAvailable ? 'unavailable' : ''}`}>
      <div className="car-image">
        <img 
          src={Array.isArray(car.images) ? car.images[0] : car.images}
          loading="lazy" 
          alt={`${car.name} - ${car.category}`} 
        />
        <div className="car-badge">{car.category}</div>
        {!isAvailable && (
          <div className="car-unavailable" role="status">
            🚫 {car.available ? 'Booked' : 'Not Available'}
          </div>
        )}
      </div>

      <div className="car-info">
        <h3>{car.name}</h3>

        <div className="car-rating">
          <span className="stars" aria-label={`Rating ${car.rating} out of 5 stars`}>★ {car.rating}</span>
          <span className="reviews">({car.reviews} reviews)</span>
        </div>

        <div className="car-specs">
          <div className="spec">
            <i className="bi bi-speedometer" aria-hidden="true"></i>
            <span>{car.transmission}</span>
          </div>
          <div className="spec">
            <i className="bi bi-fuel-pump" aria-hidden="true"></i>
            <span>{car.fuelType}</span>
          </div>
        </div>

        <div className="car-price">
          <span className="price">${car.pricePerDay}</span>
          <span className="per-day">/ per day</span>
        </div>

        <div className="car-actions">
          <button 
            className="btn-details" 
            onClick={handleViewDetails}
            aria-label={`View details for ${car.name}`}
          >
            Details
          </button>
          <button 
            className="btn-book" 
            onClick={handleBook}
            disabled={!isAvailable}
            aria-label={isAvailable ? `Book ${car.name} for $${car.pricePerDay} per day` : `${car.name} is currently not available`}
          >
            {isAvailable ? 'Book Now' : 'Not Available'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
