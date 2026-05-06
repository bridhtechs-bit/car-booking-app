import React from 'react'
import './navbar.css'
import { Link, useNavigate, NavLink } from 'react-router-dom' // Ajout de NavLink
import Logo from '../../assets/logo.png'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../features/auth/authSlice'

const NabBar = () => {
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
                    <Link className="navbar-brand" to="/home">
                        <img className='nav-logo' src={Logo} alt='logo' />
                    </Link>
                </div>
                
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            {/* NavLink ajoute automatiquement une classe 'active' si on est sur la page */}
                            <NavLink className="nav-link" to="/home">Home</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/features">Features</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/my-bookings">My bookings</NavLink>
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