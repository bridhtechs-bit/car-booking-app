import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCars, getAdminCar } from '../features/cars/carsSlice';
import CarItem from '../components/CarItem';
import { useNavigate } from 'react-router-dom';

const CarsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cars, loading } = useSelector((state) => state.cars);

useEffect(() => {
    dispatch(getAdminCar());
  },[dispatch]);
   

  return (
    <div>
      <h2>Voitures</h2>
      <div style={{marginBottom:12}}>
        <button onClick={() => navigate('/admin/cars/new')}>Nouvelle voiture</button>
      </div>
      {loading ? <div>Chargement...</div> : (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          {cars.map(car => <CarItem key={car._id} car={car} />)}
        </div>
      )}
    </div>
  );
};

export default CarsList;
