import React, {useEffect} from 'react';
import { Link } from 'react-router-dom';
import "./dashboard.css";
import {useDispatch, useSelector} from 'react-redux';
import { FaCarAlt, FaCalendarCheck, FaUser } from "react-icons/fa";
import { FaMoneyCheckDollar } from "react-icons/fa6";
import { getAdminCar} from '../features/cars/carsSlice';
import {getBookings} from '../features/bookings/bookingsSlice'

const Dashboard = () => {

  //recuperation des données de voitures pour les statistiques
     const dispatch = useDispatch();
     const { cars, car, loading, isSuccess } = useSelector((state) => state.cars);
     const { bookings } = useSelector((state) => state.bookings);

    useEffect(() => {
      dispatch(getAdminCar());
      dispatch(getBookings());
    }, [dispatch]);
    
  // Données des voitures récemment ajoutées
    const recentVehicles = [
      {
        id: 1,
        name: "BMW 7 Series i7",
        category: "PREMIUM",
        price: "$185/day",
        fuel: "Electric",
        year: 2024,
        seats: 4,
        range: "480 mi",
        image: "https://images.unsplash.com/photo-1567818735868-e71b99932e29?w=400&h=250&fit=crop"
      },
      {
        id: 2,
        name: "Porsche 911 Carrera",
        category: "SPORT",
        price: "$240/day",
        fuel: "Gasoline",
        year: 2023,
        seats: 2,
        performance: "3.4s 0-60",
        image: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=400&h=250&fit=crop"
      }
    ];

  // Données de distribution de flotte
  const fleetDistribution = [
    { category: "LUXURY SEDANS", percentage: 42, color: "#667eea" },
    { category: "SPORT CARS", percentage: 18, color: "#ffa928" },
    { category: "SUVS", percentage: 35, color: "#ff6b6b" }
  ];

  return (
    <div>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="dashboard-header">
               <h1>Dashboard overview</h1>
               <p>Bienvenue sur votre tableau de bord administrateur<br/> Ici vous pouvez gérer les voitures, les utilisateurs et les réservations.</p>
            </div>
            
            {/* Stats Cards */}
            <div className='stats-card-section'>
              {/* cars stats */}
              <div className='stats-card'>
                <div className='stats-header'>
                  <div className='stats-icon d-flex align-items-center'>
                    <FaCarAlt />
                  </div>
                  <div className='stats-info'>
                    <span>+4%</span>
                  </div>
                </div>
                <div className='stats-details'>
                  <p>Total Cars</p>
                  <h3>{cars.length}</h3>
                </div>
              </div>
              {/* bookings stats */}
              <div className='stats-card'>
                <div className='stats-header'>
                  <div className='stats-icon d-flex align-items-center'>
                    <FaCalendarCheck />
                  </div>
                  <div className='stats-info'>
                    <span>+4%</span>
                  </div>
                </div>
                <div className='stats-details'>
                  <p>BOOKING EN COURS</p>
                  <h3>{bookings.length}</h3>
                </div>
              </div>
              {/* revenue stats  */}
              <div className='stats-card'>
                <div className='stats-header'>
                  <div className='stats-icon d-flex align-items-center'>
                    <FaMoneyCheckDollar />
                  </div>
                  <div className='stats-info'>
                    <span>+4%</span>
                  </div>
                </div>
                <div className='stats-details'>
                  <p>REVENU MENSUEL</p>
                  <h3>120 000 FCFA</h3>
                </div>
              </div>
              {/* users stats */}
              <div className='stats-card'>
                <div className='stats-header'>
                  <div className='stats-icon d-flex align-items-center'>
                    <FaUser />
                  </div>
                  <div className='stats-info'>
                    <span>+4%</span>
                  </div>
                </div>
                <div className='stats-details'>
                  <p>Total UTILISATEUR</p>
                  <h3>2</h3>
                </div>
              </div>
            </div>

            {/* Recent Vehicles & Fleet Distribution Section */}
            <div className='main-content-section'>
              {/* Recent Vehicle Additions */}
              <div className='recent-vehicles'>
                <div className='section-header'>
                  <h3>Recent Vehicle Additions</h3>
                  <Link to="/admin/cars" className='view-all-link'>View All Fleet →</Link>
                </div>
                <div className='vehicle-cards'>
                  {cars.map((car) => (
                    <div key={car._id} className='vehicle-card'>
                      <div className='vehicle-category-badge'>{car.category}</div>
                      <img src={car.images[0]} alt={car.name} className='vehicle-image' />
                      <div className='vehicle-info'>
                        <h4>{car.name}</h4>
                        <p className='vehicle-specs'>
                          {car.fuel} • {car.year}
                        </p>
                        <div className='vehicle-details'>
                          {car.seats && (
                            <span className='detail-item'>
                              🪑 {car.seats} Seats
                            </span>
                          )}
                          {car.range && (
                            <span className='detail-item'>
                              🔋 {car.range}
                            </span>
                          )}
                          {car.performance && (
                            <span className='detail-item'>
                              ⚡ {car.performance}
                            </span>
                          )}
                        </div>
                        <div className='vehicle-price'>{car.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fleet Distribution & Live Tracking */}
              <div className='sidebar-section'>
                {/* Fleet Distribution */}
                <div className='fleet-distribution'>
                  <h3>Fleet Distribution</h3>
                  <div className='distribution-list'>
                    {fleetDistribution.map((item, index) => (
                      <div key={index} className='distribution-item'>
                        <div className='distribution-label'>
                          <span>{item.category}</span>
                          <span className='distribution-percentage'>{item.percentage}%</span>
                        </div>
                        <div className='distribution-bar'>
                          <div 
                            className='distribution-bar-fill' 
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: item.color
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Fleet Tracking */}
                <div className='live-tracking'>
                  <div className='tracking-header'>
                    <h3>Live Fleet Tracking</h3>
                    <span className='live-badge'>● LIVE</span>
                  </div>
                  <div className='tracking-map'>
                    <div className='map-placeholder'>
                      <span>📍 5 vehicles active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
