import React from "react";
import { useNavigate } from "react-router-dom";
import "./carCard.css";

// filepath: /e:/blanco/dev app/react app/car-booking-app/admin/src/components/carCard/carCard.js

const CarCard = ({ car, onDelete, onEdit }) => {
    const navigate = useNavigate();

    const handleEdit = () => {
        navigate(`/admin/cars/edit/${car._id}`);
        onEdit?.(car._id);
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this car?")) {
            onDelete?.(car._id);
        }
    };

    const handleViewDetails = () => {
        navigate(`/admin/cars/${car._id}`);
    };

    return (
        <div className="car-card-admin">
            <div className="car-image">
                <img src={car.image} alt={car.name} />
                <div className="car-badge">{car.category}</div>
            </div>

            <div className="car-info">
                <h3>{car.name}</h3>

                <div className="car-specs">
                    <div className="spec">
                        <span><strong>Transmission:</strong> {car.transmission}</span>
                    </div>
                    <div className="spec">
                        <span><strong>Fuel Type:</strong> {car.fuelType}</span>
                    </div>
                    <div className="spec">
                        <span><strong>Price:</strong> ${car.price}/day</span>
                    </div>
                    <div className="spec">
                        <span><strong>Status:</strong> {car.status || "Available"}</span>
                    </div>
                </div>

                <div className="car-actions">
                    <button className="btn-view" onClick={handleViewDetails}>
                        View
                    </button>
                    <button className="btn-edit" onClick={handleEdit}>
                        Edit
                    </button>
                    <button className="btn-delete" onClick={handleDelete}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CarCard;