import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFeaturedCars } from "../features/car/carSlice";
import CarCard from "./CarCard";
import "./featuredcars.css";

const FeaturedCars = () => {
  const dispatch = useDispatch();
  const { cars,featuredCars, loading } = useSelector((state) => state.car);

  useEffect(() => {
    dispatch(getFeaturedCars());
  }, [dispatch]);

  const mockFeaturedCars = [
    {
      _id: "1",
      name: "BMW 3 Series",
      category: "Sedan",
      price: 150,
      image: "https://via.placeholder.com/300x200?text=BMW+3",
      rating: 4.8,
      reviews: 42,
      transmission: "Automatic",
      fuelType: "Petrol",
    },
    {
      _id: "2",
      name: "Mercedes C-Class",
      category: "Sedan",
      price: 180,
      image: "https://via.placeholder.com/300x200?text=Mercedes+C",
      rating: 4.9,
      reviews: 58,
      transmission: "Automatic",
      fuelType: "Diesel",
    },
    {
      _id: "3",
      name: "Toyota RAV4",
      category: "SUV",
      price: 120,
      image: "https://via.placeholder.com/300x200?text=Toyota+RAV4",
      rating: 4.7,
      reviews: 35,
      transmission: "Automatic",
      fuelType: "Petrol",
    },
    {
      _id: "4",
      name: "Audi Q5",
      category: "SUV",
      price: 160,
      image: "https://via.placeholder.com/300x200?text=Audi+Q5",
      rating: 4.8,
      reviews: 48,
      transmission: "Automatic",
      fuelType: "Diesel",
    },
  ];

  const displayCars = featuredCars.length > 0 ? featuredCars : mockFeaturedCars;

  return (
    <section className="featured-cars">
      <div className="container">
        <h2>Featured Cars</h2>
        <p>Our most popular and highly-rated vehicles</p>
        
        {loading ? (
          <div className="loading">Loading featured cars...</div>
        ) : (
          <div className="cars-grid">
            {displayCars.slice(0, 4).map((car) => (
              <CarCard key={car._id} car={car} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCars;
