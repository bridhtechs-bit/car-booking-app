import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserBookings, removeBooking, resetBookingState } from "../features/auth/bookingSlice";
import { getAllCars } from "../features/car/carSlice";
import useRefreshData from "../hooks/useRefreshData";
import "./mybookings.css";

const MyBookings = () => {
  const dispatch = useDispatch();
  const { bookings, loading, success, error } = useSelector((state) => state.booking);
  const [confirmCancel, setConfirmCancel] = useState(null);

  // Reset booking success state on mount to prevent redirect
  useEffect(() => {
    dispatch(resetBookingState());
  }, [dispatch]);

  // ✅ Refresh bookings and cars every 5 minutes
  // This ensures you see when bookings expire or cars become available again
  useRefreshData(5 * 60 * 1000, true);

  const bookingDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
   }

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch(resetBookingState());
      }, 2000);
    }
  }, [success, dispatch]);

  const handleCancelBooking = (bookingId) => {
    dispatch(removeBooking(bookingId));
    setConfirmCancel(null);
  };

  // const mockBookings = [
  //   {
  //     _id: "1",
  //     carName: "BMW 3 Series",
  //     carImage: "https://via.placeholder.com/150x100?text=BMW",
  //     startDate: "2024-02-10",
  //     endDate: "2024-02-15",
  //     status: "Confirmed",
  //     totalPrice: 750,
  //     days: 5,
  //     carCategory: "Sedan",
  //   },
  //   {
  //     _id: "2",
  //     carName: "Mercedes C-Class",
  //     carImage: "https://via.placeholder.com/150x100?text=Mercedes",
  //     startDate: "2024-03-01",
  //     endDate: "2024-03-08",
  //     status: "Upcoming",
  //     totalPrice: 1260,
  //     days: 7,
  //     carCategory: "Sedan",
  //   },
  //   {
  //     _id: "3",
  //     carName: "Toyota RAV4",
  //     carImage: "https://via.placeholder.com/150x100?text=RAV4",
  //     startDate: "2024-01-15",
  //     endDate: "2024-01-18",
  //     status: "Completed",
  //     totalPrice: 360,
  //     days: 3,
  //     carCategory: "SUV",
  //   },
  // ];

  const displayBookings = bookings && Array.isArray(bookings) && bookings.length > 0 ? bookings : [];

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "approved":
        return "status-confirmed";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: "⏳ Pending",
      approved: "✓ Confirmed",
      completed: "✓ Completed",
      cancelled: "🚫 Cancelled"
    };
    return statusMap[status] || status;
  };

  const canCancelBooking = (status) => {
    return status === "approved" || status === "pending";
  };

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && confirmCancel) {
        setConfirmCancel(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmCancel]);

  return (
    <div className="my-bookings-page">
      <div className="container">
        <div className="page-header">
          <h1>My Bookings</h1>
          <p>Manage and view all your car rental reservations</p>
        </div>

        {success && (
          <div className="alert alert-success" role="status" aria-live="polite">
            ✓ Booking cancelled successfully!
          </div>
        )}

        {error && (
          <div className="alert alert-error" role="alert">
            ✗ Error: {error.message || "Something went wrong"}
          </div>
        )}

        {loading ? (
          <div className="loading" role="status" aria-live="polite">Loading your bookings...</div>
        ) : displayBookings.length > 0 ? (
          <div className="bookings-container">
            <div className="bookings-tabs" role="tablist" aria-label="Booking Filters">
              <button className="tab-btn active" role="tab" aria-selected="true">All Bookings</button>
              <button className="tab-btn" role="tab" aria-selected="false">Upcoming</button>
              <button className="tab-btn" role="tab" aria-selected="false">Completed</button>
            </div>

            <div className="bookings-list">
              {displayBookings.map((booking) => (
                <div key={booking._id} className="booking-card">
                  <div className="booking-image">
                    {booking.carId?.images?.length > 0 ? (
                      <img src={booking.carId.images[0]} alt={`${booking.carName || 'Vehicle'} image`} />
                    ) : (
                      <div className="placeholder-image">No Image</div>
                    )}
                  </div>

                  <div className="booking-info">
                    <div className="car-info-header">
                      <div>
                        <h3>{booking.carName}</h3>
                        <span className="car-category">
                          {booking.carId?.category || "Unknown Category"}
                        </span>
                      </div>
                      <span
                        className={`booking-status ${getStatusColor(
                          booking.status
                        )}`}
                        role="status"
                      >
                        {getStatusDisplay(booking.status)}
                      </span>
                    </div>

                    <div className="booking-dates">
                      <div className="date-item">
                        <label>Start Date</label>
                        <p>{new Date(booking.startDate).toLocaleDateString()}</p>
                      </div>
                      <div className="date-item">
                        <label>End Date</label>
                        <p>{new Date(booking.endDate).toLocaleDateString()}</p>
                      </div>
                      <div className="date-item">
                        <label>Duration</label>
                        <p>{bookingDays(booking.startDate, booking.endDate)} days</p>
                      </div>
                    </div>

                    <div className="booking-price">
                      <span className="label">Total Price</span>
                      <span className="price">${booking.totalPrice}</span>
                    </div>
                  </div>

                  <div className="booking-actions">
                    <button className="btn-view-details" aria-label={`View details for ${booking.carName}`}>
                      View Details
                    </button>
                    {canCancelBooking(booking.status) && (
                      <button
                        className="btn-cancel"
                        onClick={() => setConfirmCancel(booking._id)}
                        aria-label={`Cancel booking for ${booking.carName}`}
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-bookings">
            <div className="empty-state">
              <i className="bi bi-calendar-x" aria-hidden="true"></i>
              <h2>No Bookings Yet</h2>
              <p>You haven't made any car reservations yet.</p>
              <a href="/cars" className="btn-browse">
                Browse Cars
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {confirmCancel && (
        <div className="modal-overlay" onClick={() => setConfirmCancel(null)}>
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-booking-title"
            aria-describedby="cancel-booking-desc"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="cancel-booking-title">Cancel Booking?</h2>
            <p id="cancel-booking-desc">Are you sure you want to cancel this booking? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="btn-cancel-modal"
                onClick={() => setConfirmCancel(null)}
                aria-label="Keep this booking"
              >
                Keep Booking
              </button>
              <button
                className="btn-confirm-cancel"
                onClick={() => handleCancelBooking(confirmCancel)}
                disabled={loading}
                aria-label="Confirm cancellation"
              >
                {loading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
