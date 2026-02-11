const Client = require('../models/Client');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const BlockedDate = require('../models/BlockedDate');
const { sendBookingConfirmation } = require('../utils/mailer');

const bookingController = {
  async create(req, res) {
    try {
      const data = req.validatedBody;

      // Check if date is blocked
      const isBlocked = await BlockedDate.isBlocked(data.date);
      if (isBlocked) {
        return res.status(400).json({ success: false, error: 'Cette date n\'est pas disponible. Veuillez en choisir une autre.' });
      }

      // Find the service
      const service = await Service.findById(data.serviceId);
      if (!service) {
        return res.status(400).json({ success: false, error: 'Service introuvable' });
      }

      // Calculate total price with selected options
      let totalPrice = parseFloat(service.price);
      let selectedOptions = [];

      if (data.selectedOptions && Array.isArray(data.selectedOptions)) {
        const serviceOptions = service.options || [];
        selectedOptions = data.selectedOptions.map(optName => {
          const opt = serviceOptions.find(o => o.name === optName);
          return opt ? { name: opt.name, price: opt.price } : null;
        }).filter(Boolean);

        for (const opt of selectedOptions) {
          const priceMatch = opt.price.match(/([+-]?\d+(?:[.,]\d+)?)/);
          if (priceMatch) {
            totalPrice += parseFloat(priceMatch[1].replace(',', '.'));
          }
        }
      }

      // Find or create client
      const client = await Client.findOrCreate({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        address: data.address
      });

      // Create booking
      const bookingId = await Booking.create({
        clientId: client.id,
        serviceId: service.id,
        date: data.date,
        timeSlot: data.timeSlot,
        address: data.address,
        notes: data.notes,
        totalPrice,
        selectedOptions
      });

      // Increment client bookings
      await Client.incrementBookings(client.id);

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
