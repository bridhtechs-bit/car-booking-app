import React,{useEffect,useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBookings, cancelBooking, updateBookingStatus } from '../features/bookings/bookingsSlice';
import "./bookings.css";

const Bookings = () => {
  const dispatch = useDispatch();
  const { bookings, loading, error } = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(getBookings());
  }, [dispatch]);

  const handleCancelBooking = (id) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      dispatch(cancelBooking(id));
    }
  };

  const handleUpdateStatus = (id, status) => {
    const newStatus = status === "pending" ? "approved" : "pending";
    dispatch(updateBookingStatus({ id, status: newStatus }));
  };

  const [confirmCancel, setConfirmCancel] = useState(null);

  const displayBookings = bookings && Array.isArray(bookings) && bookings.length > 0 ? bookings : [];

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "green";
      case "approved":
        return "blue";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const cancelBookings = (status) => {
    if (status === "pending") {
      return "red";
    } else if (status === "approved") {
      return "blue";
    } else if (status === "cancelled") {
      return "gray";
    }
  };


  return (
    <div className="bookings-page">
      <div className='container'>
        <div className='row'>
          <div className='col-12'>
            <div className='page-header'>
               <h1>Bookings</h1>
               <p>Ici vous pouvez gérer les réservations.</p>
            </div> 

              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p className="error">{error}</p>
              ) : displayBookings.length > 0 ? (
                <div className="bookings-list d-flex">
                  {displayBookings.map((booking) => (
                    <div key={booking._id} className="booking-card">
                        <div className="car-image">
                          <img src={booking.carId.images[0]} alt={booking.carId.category} />
                        </div>
                        <div className='car-detail'>
                          <h3>Name: {booking.carId.name}</h3>
                          <h3>Category: {booking.carId.category}</h3>
                          <p>Du: {new Date(booking.startDate).toLocaleDateString()} Au {new Date(booking.endDate).toLocaleDateString()}</p>
                          <p>Status: <span style={{ color: getStatusColor(booking.status) }}>{booking.status}</span></p>
                        </div>
                        <div className="actions">
                          {booking.status !== "cancelled" && (
                            <button onClick={() => handleUpdateStatus(booking._id, booking.status)}>
                              {booking.status === "pending" ? "Approve" : "Set Pending"}
                            </button>
                          )}
                        </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No bookings found.</p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Bookings