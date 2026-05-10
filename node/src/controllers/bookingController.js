import Booking from '../models/bookingModel.js';
import carModel from '../models/carModel.js';
import { 
  sendAdminNotificationEmail, 
  sendBookingConfirmationEmail, 
  sendCancellationEmail 
} from '../services/emailService.js';

// Check availability of a car for a date range
const checkAvailability = async (carId, startDate, endDate) => {
  const bookings = await Booking.find({
    carId,
    startDate: { $lte: new Date(endDate) },
    endDate: { $gte: new Date(startDate) }
  });

  return bookings.length === 0;
};

// Check availability of cars for the given date and location
const checkAvailabilityOfCar = async (req, res) => {
  try {
    const { location, startDate, endDate } = req.body;
    const cars = await carModel.find({ location, available: true });

    const availableCarsPromise = cars.map(async (car) => {
      const isAvailable = await checkAvailability(car._id, startDate, endDate);
      return { ...car._doc, isAvailable };
    });

    let availableCars = await Promise.all(availableCarsPromise);
    availableCars = availableCars.filter((car) => car.isAvailable === true);

    res.json({ success: true, availableCars });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to create booking (authenticated endpoint using params)
const createNewBooking = async (req, res) => {
  try {
    const { _id } = req.user || {};
    const { carId } = req.params;
    const { startDate, endDate } = req.body;

    const isAvailable = await checkAvailability(carId, startDate, endDate);
    if (!isAvailable) {
      return res.status(400).json({ success: false, message: 'Car is not available' });
    }

    const carData = await carModel.findById(carId);
    if (!carData) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    const picked = new Date(startDate);
    const returned = new Date(endDate);
    const noOfDay = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24)) || 1;
    const totalPrice = (carData.pricePerDay || 0) * noOfDay;

    const booking = await Booking.create({
      carId,
      userId: _id,
      startDate,
      endDate,
      totalPrice
    });

    // --- Notification Email Admin ---
    const fullBooking = await Booking.findById(booking._id).populate('userId').populate('carId');
    sendAdminNotificationEmail(fullBooking, fullBooking.userId, fullBooking.carId).catch(console.error);

    res.status(201).json({ success: true, message: 'Booking created', data: booking });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create booking (generic endpoint)
const createBooking = async (req, res) => {
  try {
    let userId = req.user?.id || req.body.userId;
    let { carId, startDate, endDate, totalPrice } = req.body;

    if (req.user && req.user._id) {
      userId = req.user._id;
    }

    if (!totalPrice) {
      const carData = await carModel.findById(carId);
      if (!carData) return res.status(404).json({ success: false, message: 'Car not found' });
      const picked = new Date(startDate);
      const returned = new Date(endDate);
      const noOfDay = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24)) || 1;
      totalPrice = (carData.pricePerDay || 0) * noOfDay;
    }

    const newBooking = new Booking({
      carId,
      userId,
      startDate,
      endDate,
      totalPrice
    });

    const savedBooking = await newBooking.save();

    // --- Notification Email Admin ---
    const fullBooking = await Booking.findById(savedBooking._id).populate('userId').populate('carId');
    sendAdminNotificationEmail(fullBooking, fullBooking.userId, fullBooking.carId).catch(console.error);

    res.status(201).json({ success: true, data: savedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all bookings (admin only)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('carId', 'name pricePerDay')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings, count: bookings.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminBookings = async (req, res) => {
  const ownerId = req.user._id.toString();

  try {
    const bookings = await Booking.find()
      .populate({
        path: 'carId',
        select: 'name pricePerDay owner images category'
      })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const adminBookings = bookings.filter(booking => {
      return (
        booking.carId && 
        booking.carId.owner && 
        booking.carId.owner.toString() === ownerId
      );
    });

    res.status(200).json({ 
      success: true, 
      data: adminBookings 
    });

  } catch (error) {
    console.error("Erreur:", error.message);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// API for getting user bookings
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user?._id || req.params.id || req.query.userId;
    if (!userId) return res.status(400).json({ success: false, message: 'User id required' });

    const bookings = await Booking.find({ userId }).populate('carId').sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update booking status (Envoie emails de confirmation/annulation)
const updateBookingStatus = async (req, res) => {
  try {
    const { _id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      _id,
      { status },
      { new: true }
    ).populate('userId').populate('carId');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // --- Gestion Disponibilité & Emails Client ---
    if (status === 'approved' || status === 'confirmed') {
      await carModel.findByIdAndUpdate(booking.carId, { available: false });
      
      // Email de confirmation au client
      sendBookingConfirmationEmail(booking, booking.userId, booking.carId).catch(console.error);

    } else if (status === 'cancelled' || status === 'rejected') {
      await carModel.findByIdAndUpdate(booking.carId, { available: true });
      
      // Email d'annulation au client
      sendCancellationEmail(booking, booking.userId, booking.carId, 0).catch(console.error);
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete booking
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get booking by ID
const getBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate('userId', 'name email')
      .populate('carId', 'name pricePerDay');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createBooking,
  createNewBooking,
  getUserBookings,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
  getBooking,
  getAdminBookings,
  checkAvailabilityOfCar
};