import React, { useState } from 'react'
import './navbar.css'
import { Link, useNavigate, NavLink } from 'react-router-dom' // Ajout de NavLink
import Logo from '../../assets/logo.png'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../features/auth/authSlice'

const NabBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className='navbar-container'>
            <nav className="navbar navbar-expand-lg navbar-light bg-light px-5">
                <div className='logo-area'>
                    <Link className="navbar-brand" to="/home" aria-label="Drivio - accueil">
                        <img className='nav-logo' src={Logo} alt='Drivio' />
                    </Link>
                </div>
                
                <button
                    className="navbar-toggler"
                    type="button"
                    aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                    aria-expanded={isMenuOpen}
                    aria-controls="navbarNav"
                    onClick={() => setIsMenuOpen((open) => !open)}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className={`collapse navbar-collapse${isMenuOpen ? ' show' : ''}`} id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            {/* NavLink ajoute automatiquement une classe 'active' si on est sur la page */}
                            <NavLink className="nav-link" to="/home" onClick={() => setIsMenuOpen(false)}>Home</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/features" onClick={() => setIsMenuOpen(false)}>Features</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/my-bookings" onClick={() => setIsMenuOpen(false)}>My bookings</NavLink>
                        </li>
                    </ul>
                </div>

                <div className='nav-user-options'>
                    {isAuthenticated && user ? (
                        <div className="d-flex align-items-center">
                            <span className='nav-username me-3'>Hello, {user.name || user.email}</span>
                            <button className='btn btn-outline-danger' onClick={handleLogout}>Logout</button>
                        </div>
                    ) : (
                        <div className="d-flex align-items-center">
                            <Link to="/login" className='btn btn-outline-primary mx-2'>Login</Link>
                            <Link to="/register" className='btn btn-primary'>Register</Link>
                        </div>
                    )}
                </div>
            </nav>
        </div>
    )
}

export default NabBar