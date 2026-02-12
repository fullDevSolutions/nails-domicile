const Booking = require('../models/Booking');
const { sendBookingConfirmation } = require('../utils/mailer');
const { validateBooking, createBookingForClient } = require('../services/bookingService');

const bookingController = {
  async create(req, res) {
    try {
      const data = req.validatedBody;

      const result = await validateBooking(data);
      if (result.error) {
        return res.status(400).json({ success: false, error: result.error });
      }

      const { service, timeSlotEnd, totalPrice, selectedOptions } = result;

      const { bookingId, client } = await createBookingForClient(data, {
        service, timeSlotEnd, totalPrice, selectedOptions
      });

      // Send confirmation emails (client + admin)
      const booking = await Booking.findById(bookingId);
      try {
        await sendBookingConfirmation(booking, client, service);
      } catch (emailErr) {
        console.error('Booking confirmation email failed:', emailErr.message);
      }

      res.json({
        success: true,
        message: 'Votre demande de rendez-vous a été envoyée avec succès !',
        bookingId
      });
    } catch (err) {
      console.error('Booking creation error:', err);
      res.status(500).json({ success: false, error: 'Une erreur est survenue. Veuillez réessayer.' });
    }
  }
};

module.exports = bookingController;
