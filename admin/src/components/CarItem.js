import React from 'react';
import { useDispatch } from 'react-redux';
import { deleteCar, toggleFeatured } from '../features/cars/carsSlice';
import { useNavigate } from 'react-router-dom';

const CarItem = ({ car }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className="car-item card">
      <img src={car.images?.[0] || 'https://via.placeholder.com/200x120'} alt={car.name} />
      <div className="car-info">
        <h4>{car.name}</h4>
        <p>{car.category} • {car.transmission} • ${car.pricePerDay}/day</p>
        <div className="actions">
          <button onClick={() => navigate(`/admin/cars/edit/${car._id}`)}>Edit</button>
          <button onClick={() => dispatch(deleteCar(car._id))}>Delete</button>
          <button onClick={() => dispatch(toggleFeatured({ id: car._id, featured: !car.featured }))}>
            {car.featured ? 'Unfeature' : 'Feature'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarItem;
