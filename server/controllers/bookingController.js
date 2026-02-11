const Client = require('../models/Client');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const BlockedDate = require('../models/BlockedDate');
const BusinessHour = require('../models/BusinessHour');
const { sendBookingConfirmation } = require('../utils/mailer');
const { addMinutesToTime } = require('../utils/helpers');

const bookingController = {
  async create(req, res) {
    try {
      const data = req.validatedBody;

      // Check past date/time
      const now = new Date();
      const bookingDateTime = new Date(data.date + 'T' + data.timeSlot + ':00');
      if (bookingDateTime <= now) {
        return res.status(400).json({ success: false, error: 'Impossible de réserver dans le passé.' });
      }

      // Check if date is blocked
      const blockType = await BlockedDate.isBlocked(data.date);
      if (blockType === 'full') {
        return res.status(400).json({ success: false, error: 'Cette date n\'est pas disponible. Veuillez en choisir une autre.' });
      }

      // Find the service
      const service = await Service.findById(data.serviceId);
      if (!service) {
        return res.status(400).json({ success: false, error: 'Service introuvable' });
      }

      // Check business hours
      const businessHours = await BusinessHour.findAll();
      const dateObj = new Date(data.date + 'T00:00:00');
      const dow = dateObj.getDay();
      const bh = businessHours.find(h => h.day_of_week === dow);
      if (!bh || !bh.is_open) {
        return res.status(400).json({ success: false, error: 'Ce jour n\'est pas disponible.' });
      }

      // Calculate time_slot_end
      const timeSlotEnd = addMinutesToTime(data.timeSlot, service.duration_minutes);

      // Check partial block: morning blocks range 1, afternoon blocks range 2
      if (blockType === 'morning' && bh.open_time && bh.close_time) {
        const rangeStart = bh.open_time.substring(0, 5);
        const rangeEnd = bh.close_time.substring(0, 5);
        if (data.timeSlot < rangeEnd && timeSlotEnd > rangeStart) {
          return res.status(400).json({ success: false, error: 'Ce créneau n\'est pas disponible (matin bloqué).' });
        }
      }
      if (blockType === 'afternoon' && bh.open_time_2 && bh.close_time_2) {
        const rangeStart = bh.open_time_2.substring(0, 5);
        const rangeEnd = bh.close_time_2.substring(0, 5);
        if (data.timeSlot < rangeEnd && timeSlotEnd > rangeStart) {
          return res.status(400).json({ success: false, error: 'Ce créneau n\'est pas disponible (après-midi bloqué).' });
        }
      }

      // Check slot availability (overlap check)
      const available = await Booking.isSlotAvailable(data.date, data.timeSlot, timeSlotEnd);
      if (!available) {
        return res.status(400).json({ success: false, error: 'Ce créneau n\'est plus disponible. Veuillez en choisir un autre.' });
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
        timeSlotEnd,
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
