import React from "react";
import { useNavigate } from "react-router-dom";
import "./categorybrowsing.css";

const CategoryBrowsing = () => {
  const navigate = useNavigate();

  const categories = [
    { id: 1, name: "Sedan", icon: "🚗", count: 24 },
    { id: 2, name: "SUV", icon: "🚙", count: 18 },
    { id: 3, name: "Hatchback", icon: "🚗", count: 15 },
    { id: 4, name: "Coupe", icon: "🏎️", count: 12 },
    { id: 5, name: "Convertible", icon: "🚙", count: 8 },
    { id: 6, name: "Van", icon: "🚐", count: 10 },
  ];

  const handleCategoryClick = (category) => {
    navigate(`/cars?category=${category.name.toLowerCase()}`);
  };

  return (
    <section className="category-browsing">
      <div className="container">
        <h2>Browse by Category</h2>
        <p>Choose from our wide range of vehicle categories</p>
        
        <div className="categories-grid">
          {categories.map((category) => (
            <div
              key={category.id}
              className="category-card"
              onClick={() => handleCategoryClick(category)}
            >
              <div className="category-icon">{category.icon}</div>
              <h3>{category.name}</h3>
              <p>{category.count} cars</p>
              <button className="view-btn">View Cars →</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryBrowsing;
