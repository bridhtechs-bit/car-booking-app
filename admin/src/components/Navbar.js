import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
// import { logout } from '../features/auth/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="admin-nav">
      <div className="brand">Car Booking — Admin</div>
      <div className="links">
        <NavLink to="/admin" end>Dashboard</NavLink>
        <NavLink to="/admin/cars">Voitures</NavLink>
        <NavLink to="/admin/users">Utilisateurs</NavLink>
        <NavLink to="/admin/reservations">Réservations</NavLink>
        <button onClick={handleLogout} className="btn-quiet">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
