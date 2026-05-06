import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCarById } from "../features/car/carSlice";
import { createNewBooking } from "../features/auth/bookingSlice";
import "./cardetails.css";
import * as Yup from "yup";
import { useFormik} from "formik";



const CarDetails = () => {
    const bookingValidationSchema = Yup.object().shape({
    startDate: Yup.date()
      .required("Start date is required")
      .typeError("Start date must be a valid date"),
    endDate: Yup.date()
      .required("End date is required")
      .typeError("End date must be a valid date")
      .min(
        Yup.ref("startDate"),
        "End date must be after start date"
      ),
    additionalDriver: Yup.boolean(),
    insurance: Yup.boolean(),
  });

  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { selectedCar, loading } = useSelector((state) => state.car);
  const { loading: bookingLoading, success } = useSelector(
    (state) => state.booking
  );

  const formik = useFormik({
    initialValues: {
      startDate: "",
      endDate: "",
      additionalDriver: false,
      insurance: false,
    },
    validationSchema: bookingValidationSchema,
    onSubmit: (values) => {
      dispatch(
        createNewBooking({
          carId: id,
          ...values,
        })
      );
    },
  });

  const [showBookingForm, setShowBookingForm] = useState(
    searchParams.get("book") === "true"
  );

  useEffect(() => {
    dispatch(getCarById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (success) {
      setTimeout(() => navigate("/my-bookings"), 1000);
    }
  }, [success, navigate]);

  const displayCar = selectedCar || {};




  const calculateDays = () => {
    if (formik.values.startDate && formik.values.endDate) {
      const start = new Date(formik.values.startDate);
      const end = new Date(formik.values.endDate);
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const days = calculateDays();
  const totalPrice = days > 0 ? days * displayCar.pricePerDay : 0;
  const insuranceCost = formik.values.insurance ? totalPrice * 0.1 : 0;
  const driverCost = formik.values.additionalDriver ? 50 * days : 0;
  const finalPrice = totalPrice + insuranceCost + driverCost;

  if (loading) {
    return <div className="loading-page">Loading car details...</div>;
  }

  return (
    <div className="car-details-page">
      <div className="container">
        <button onClick={() => navigate("/cars")} className="back-btn">
          ← Back to Cars
        </button>

        <div className="details-content">
          {/* Image Gallery */}
          <div className="image-section">
            <div className="main-image">
              <img src={displayCar.image} alt={displayCar.name} />
              <div className="badge">{displayCar.category}</div>
            </div>
            <div className="thumbnail-gallery">
              {displayCar.images?.map((img, idx) => (
                <img key={idx} src={img} alt={`View ${idx + 1}`} />
              ))}
            </div>
          </div>

          {/* Car Details */}
          <div className="details-section">
            <div className="car-header">
              <div>
                <h1>{displayCar.name}</h1>
                <div className="rating">
                  <span className="stars">★ {displayCar.rating}</span>
                  <span className="review-count">
                    ({displayCar.reviews} reviews)
                  </span>
                </div>
              </div>
              <div className="price-tag">
                <span className="price">${displayCar.price}</span>
                <span className="per-day">/ per day</span>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="specs-grid">
              <div className="spec-item">
                <i className="bi bi-calendar"></i>
                <div>
                  <label>Year</label>
                  <p>{displayCar.year || "2023"}</p>
                </div>
              </div>
              <div className="spec-item">
                <i className="bi bi-speedometer"></i>
                <div>
                  <label>Transmission</label>
                  <p>{displayCar.transmission}</p>
                </div>
              </div>
              <div className="spec-item">
                <i className="bi bi-fuel-pump"></i>
                <div>
                  <label>Fuel Type</label>
                  <p>{displayCar.fuelType}</p>
                </div>
              </div>
              <div className="spec-item">
                <i className="bi bi-people"></i>
                <div>
                  <label>Seats</label>
                  <p>{displayCar.seats || "5"}</p>
                </div>
              </div>
              <div className="spec-item">
                <i className="bi bi-palette"></i>
                <div>
                  <label>Color</label>
                  <p>{displayCar.color || "Black"}</p>
                </div>
              </div>
              <div className="spec-item">
                <i className="bi bi-arrow-down-up"></i>
                <div>
                  <label>Mileage</label>
                  <p>{displayCar.mileage || "5000 km"}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="description">
              <h2>About this car</h2>
              <p>{displayCar.description}</p>
            </div>

            {/* Features */}
            <div className="features">
              <h2>Features</h2>
              <div className="features-list">
                {displayCar.features?.map((feature, idx) => (
                  <div key={idx} className="feature-item">
                    <i className="bi bi-check-circle"></i>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <aside className="booking-form-section">
            <div className="booking-card">
              <h2>Book This Car</h2>
              <div className="price-info">
                <p>
                  <strong>${displayCar.pricePerDay}</strong> per day
                </p>
              </div>

              {!showBookingForm ? (
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="book-btn"
                >
                  Start Booking
                </button>
              ) : (
                <form onSubmit={formik.handleSubmit} className="booking-form">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formik.values.startDate}
                      onChange={formik.handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formik.values.endDate}
                      onChange={formik.handleChange}
                      required
                    />
                  </div>

                  {days > 0 && (
                    <div className="booking-summary">
                      <div className="summary-item">
                        <span>Rental ({days} days)</span>
                        <span>${totalPrice}</span>
                      </div>
                      <div className="checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            name="insurance"
                            checked={formik.values.insurance}
                            onChange={formik.handleChange}
                          />
                          Insurance (+10%)
                        </label>
                        {insuranceCost > 0 && (
                          <span>${insuranceCost.toFixed(2)}</span>
                        )}
                      </div>
                      <div className="checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            name="additionalDriver"
                            checked={formik.values.additionalDriver}
                            onChange={formik.handleChange}
                          />
                          Additional Driver
                        </label>
                        {driverCost > 0 && (
                          <span>${driverCost.toFixed(2)}</span>
                        )}
                      </div>
                      <div className="summary-item total">
                        <span>Total</span>
                        <span>${finalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="book-btn"
                  >
                    {bookingLoading ? "Processing..." : "Confirm Booking"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
