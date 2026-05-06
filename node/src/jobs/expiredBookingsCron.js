// webApp/node/src/jobs/expiredBookingsCron.js

import cron from 'node-cron';
import Booking from '../models/bookingModel.js';
import Car from '../models/carModel.js';

export const startExpiredBookingsCron = () => {
  // Toutes les 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('⏰ Checking expired bookings...');
      
      const now = new Date();
      
      // Trouver les bookings expirés qui n'ont pas encore été traités
      const expiredBookings = await Booking.find({
        endDate: { $lt: now },
        status: 'approved',
        endedAt: false  // Pas encore marqué comme fini
      });

      for (const booking of expiredBookings) {
        // Marquer comme fini
        booking.endedAt = true;
        booking.status = 'approved'; // Garder le statut pour l'historique, mais on pourrait aussi le changer en 'completed'
        await booking.save();

        // Vérifier s'il y a d'autres bookings actifs pour cette voiture
        const activeBookings = await Booking.countDocuments({
          carId: booking.carId,
          status: 'approved',
          endDate: { $gt: now }
        });

        // Si pas d'autres bookings, rendre la voiture disponible
        if (activeBookings === 0) {
          await Car.findByIdAndUpdate(booking.carId, { available: true });
          console.log(`✅ Car ${booking.carId} is now available again`);
        }
      }

    } catch (error) {
      console.error('❌ Error in expired bookings cron:', error);
    }
  });

  console.log('✅ Expired Bookings CRON Job started');
};