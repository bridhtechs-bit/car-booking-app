import Car from '../models/carModel.js';
import asyncHandler from 'express-async-handler';

// GET all cars
const getAllCars = asyncHandler(async (req, res, next) => {
  const cars = await Car.find();
  
  res.status(200).json({
    success: true,
    count: cars.length,
    data: cars
  });
});

//admin get all cars admin recupere uniquement qui l'appartient
const getMyCars = asyncHandler(async (req, res, next) => {
  const { _id: ownerId } = req.user;

  try {
    const cars = await Car.find({ owner: ownerId });
    
    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des voitures"
    });
  }
});

// GET featured cars
const getFeaturedCars = asyncHandler(async (req, res, next) => {
  const cars = await Car.find({ featured: true, available: true }).limit(4);
  
  res.status(200).json({
    success: true,
    count: cars.length,
    data: cars
  });
});

// GET car by ID
const getCarById = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;
  
  const car = await Car.findById(_id);
  
  if (!car) {
    const error = new Error("Voiture non trouvée");
    error.statusCode = 404;
    throw error;
  }
  
  res.status(200).json({
    success: true,
    data: car
  });
});

// GET cars by category
const getCarsByCategory = asyncHandler(async (req, res, next) => {
  const { category } = req.query;
  
  if (!category) {
    const error = new Error("Catégorie requise");
    error.statusCode = 400;
    throw error;
  }
  
  const cars = await Car.find({ category });
  
  res.status(200).json({
    success: true,
    count: cars.length,
    data: cars
  });
});

// FILTER cars
const filterCars = asyncHandler(async (req, res, next) => {
  const { category, transmission, fuelType, minPrice, maxPrice, search } = req.query;
  
  let query = {};
  
  if (category) query.category = category;
  if (transmission) query.transmission = transmission;
  if (fuelType) query.fuelType = fuelType;
  if (minPrice || maxPrice) {
    query.pricePerDay = {};
    if (minPrice) query.pricePerDay.$gte = parseInt(minPrice);
    if (maxPrice) query.pricePerDay.$lte = parseInt(maxPrice);
  }
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  
  const cars = await Car.find(query);
  
  res.status(200).json({
    success: true,
    count: cars.length,
    data: cars
  });
});

// CREATE car
const createCar = asyncHandler(async (req, res, next) => {
  const { 
    name, 
    brand, 
    pricePerDay, 
    seats, 
    images, 
    category, 
    transmission, 
    fuelType, 
    featured,
    year,
    color,
    mileage,
    description,
    features,
    available
  } = req.body;
  const { _id: ownerId } = req.user;
  
  // Validation
  if (!name || !brand || !pricePerDay) {
    const error = new Error("Les champs nom, marque et prix sont requis");
    error.statusCode = 400;
    throw error;
  }
  
  const car = await Car.create({
    name,
    brand,
    owner: ownerId,
    pricePerDay,
    seats: seats || 5,
    images: images || [],
    category,
    transmission,
    fuelType,
    year: year || new Date().getFullYear(),
    color: color || 'Black',
    mileage: mileage || '0 km',
    description: description || '',
    features: features || [],
    available: available !== undefined ? available : true,
    featured: featured || false
  });
  
  res.status(201).json({
    success: true,
    message: "Voiture créée avec succès",
    data: car
  });
});

// CHANGE featured flag
const changeFeatured = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;
  const { featured } = req.body;
  
  const car = await Car.findById(_id);
  
  if (!car) {
    const error = new Error("Voiture non trouvée");
    error.statusCode = 404;
    throw error;
  }
  
  car.featured = !!featured;
  await car.save();
  
  res.status(200).json({
    success: true,
    message: `Voiture featured status updated to ${car.featured}`,
    data: car
  });
});

// UPDATE car
const updateCar = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;
  const updateData = req.body;
  
  const car = await Car.findById(_id);
  
  if (!car) {
    const error = new Error("Voiture non trouvée");
    error.statusCode = 404;
    throw error;
  }
  
  const updatedCar = await Car.findByIdAndUpdate(_id, updateData, { new: true, runValidators: true });
  
  res.status(200).json({
    success: true,
    message: "Voiture mise à jour avec succès",
    data: updatedCar
  });
});

// DELETE car
const deleteCar = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;
  
  const car = await Car.findById(_id);
  
  if (!car) {
    const error = new Error("Voiture non trouvée");
    error.statusCode = 404;
    throw error;
  }
  
  await Car.findByIdAndDelete(_id);
  
  res.status(200).json({
    success: true,
    message: "Voiture supprimée avec succès",
    data: {}
  });
});

// CHANGE availability
const changeAvailability = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;
  const { available } = req.body;
  
  const car = await Car.findById(_id);
  
  if (!car) {
    const error = new Error("Voiture non trouvée");
    error.statusCode = 404;
    throw error;
  }
  
  car.available = available;
  await car.save();
  
  res.status(200).json({
    success: true,
    message: `Voiture est maintenant ${available ? 'disponible' : 'indisponible'}`,
    data: car
  });
});

export {
  getAllCars,
  getFeaturedCars,
  getCarById,
  getCarsByCategory,
  filterCars,
  createCar,
  updateCar,
  deleteCar,
  changeAvailability,
  changeFeatured,
  getMyCars
}
