import Car from '../models/carModel.js';
import asyncHandler from 'express-async-handler';
import { getPaginationParams, getPaginationMeta, getSortObject } from '../utils/pagination.js';

const normalizeArrayField = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch (err) {
      return [value];
    }
  }
  return [];
};

const buildImageUrls = (files, req) => {
  if (!files || !files.length) return [];
  return files.map((file) => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
};

// GET all cars
const getAllCars = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, sortBy = 'price', order = 'asc' } = req.query;
  
  const { skip, limit: pageLimit, page: currentPage } = getPaginationParams(page, limit);
  const sortObject = getSortObject(sortBy, order);
  
  const [cars, total] = await Promise.all([
    Car.find().sort(sortObject).skip(skip).limit(pageLimit),
    Car.countDocuments()
  ]);
  
  const pagination = getPaginationMeta(currentPage, pageLimit, total);
  
  res.status(200).json({
    success: true,
    data: cars,
    pagination
  });
});

//admin get all cars admin recupere uniquement qui l'appartient
const getMyCars = asyncHandler(async (req, res, next) => {
  const { _id: ownerId } = req.user;
  const { page = 1, limit = 10, sortBy = 'date', order = 'desc' } = req.query;

  try {
    const { skip, limit: pageLimit, page: currentPage } = getPaginationParams(page, limit);
    const sortObject = getSortObject(sortBy, order);
    
    const [cars, total] = await Promise.all([
      Car.find({ owner: ownerId }).sort(sortObject).skip(skip).limit(pageLimit),
      Car.countDocuments({ owner: ownerId })
    ]);
    
    const pagination = getPaginationMeta(currentPage, pageLimit, total);
    
    res.status(200).json({
      success: true,
      data: cars,
      pagination
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
  const { 
    category, 
    transmission, 
    fuelType, 
    minPrice, 
    maxPrice, 
    search,
    page = 1,
    limit = 10,
    sortBy = 'price',
    order = 'asc'
  } = req.query;
  
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
  
  const { skip, limit: pageLimit, page: currentPage } = getPaginationParams(page, limit);
  const sortObject = getSortObject(sortBy, order);
  
  const [cars, total] = await Promise.all([
    Car.find(query).sort(sortObject).skip(skip).limit(pageLimit),
    Car.countDocuments(query)
  ]);
  
  const pagination = getPaginationMeta(currentPage, pageLimit, total);
  
  res.status(200).json({
    success: true,
    data: cars,
    pagination
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

  const uploadedImages = buildImageUrls(req.files, req);
  const bodyImages = normalizeArrayField(images);
  const carImages = uploadedImages.length ? uploadedImages : bodyImages;

  const car = await Car.create({
    name,
    brand,
    owner: ownerId,
    pricePerDay,
    seats: seats || 5,
    images: carImages,
    category,
    transmission,
    fuelType,
    year: year || new Date().getFullYear(),
    color: color || 'Black',
    mileage: mileage || '0 km',
    description: description || '',
    features: normalizeArrayField(features),
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
  const updateData = { ...req.body };

  const car = await Car.findById(_id);

  if (!car) {
    const error = new Error("Voiture non trouvée");
    error.statusCode = 404;
    throw error;
  }

  const uploadedImages = buildImageUrls(req.files, req);
  const bodyImages = normalizeArrayField(req.body.images);

  // Lorsque des images sont uploadées, remplacer entièrement le tableau existant.
  if (uploadedImages.length) {
    updateData.images = uploadedImages;
  } else if (bodyImages.length) {
    updateData.images = bodyImages;
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
