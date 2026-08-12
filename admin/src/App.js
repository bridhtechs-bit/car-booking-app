import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/login/Login';
import ForgotPassword from './pages/login/ForgotPassword';
import ResetPassword from './pages/login/ResetPassword';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import CarsList from './pages/CarsList';
import CarForm from './pages/CarForm';
import Bookings from './pages/Bookings';
import Reservations from './pages/Reservations';
import SellCars from './pages/SellCars';
import Users from './pages/Users';
import RequireAuth from './components/RequireAuth';

function App() {
  const { isAuthenticated } = useSelector(s => s.auth);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/admin" replace /> : <Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route 
          path="/admin" 
          element={<RequireAuth><MainLayout /></RequireAuth>}
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="cars" element={<CarsList />} />
          <Route path="cars/new" element={<CarForm />} />
          <Route path="cars/edit/:id" element={<CarForm />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="sell-car" element={<SellCars />} />
          <Route path="users" element={<Users />} />
          <Route path="reservations" element={<Reservations />} />
        </Route>
        <Route path="/" element={isAuthenticated ? <Navigate to="/admin" replace /> : <Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;