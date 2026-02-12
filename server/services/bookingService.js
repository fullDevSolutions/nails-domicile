const BlockedDate = require('../models/BlockedDate');
const BusinessHour = require('../models/BusinessHour');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Client = require('../models/Client');
const { addMinutesToTime } = require('../utils/helpers');

/**
 * Validates a booking request and returns either an error or the computed data.
 * Used by both public and admin booking creation.
 *
 * @param {Object} data - Validated booking form data
 * @param {Object} options
 * @param {boolean} options.allowPast - If true, skip past-date check (for admin)
 * @returns {{ error: string|null, service, timeSlotEnd, totalPrice, selectedOptions, blockType }}
 */
async function validateBooking(data, { allowPast = false } = {}) {
  // Check past date/time
  if (!allowPast) {
    const now = new Date();
    const bookingDateTime = new Date(data.date + 'T' + data.timeSlot + ':00');
    if (bookingDateTime <= now) {
      return { error: 'Impossible de réserver dans le passé.' };
    }
  }

  // Check if date is blocked
  const blockType = await BlockedDate.isBlocked(data.date);
  if (blockType === 'full') {
    return { error: 'Cette date n\'est pas disponible. Veuillez en choisir une autre.' };
  }

  // Find the service
  const service = await Service.findById(data.serviceId);
  if (!service) {
    return { error: 'Service introuvable.' };
  }

  // Check business hours
  const businessHours = await BusinessHour.findAll();
  const dateObj = new Date(data.date + 'T00:00:00');
  const dow = dateObj.getDay();
  const bh = businessHours.find(h => h.day_of_week === dow);
  if (!bh || !bh.is_open) {
    return { error: 'Ce jour n\'est pas disponible.' };
  }

  // Calculate time_slot_end
  const timeSlotEnd = addMinutesToTime(data.timeSlot, service.duration_minutes);

  // Check partial block: morning blocks range 1, afternoon blocks range 2
  if (blockType === 'morning' && bh.open_time && bh.close_time) {
    const rangeStart = bh.open_time.substring(0, 5);
    const rangeEnd = bh.close_time.substring(0, 5);
    if (data.timeSlot < rangeEnd && timeSlotEnd > rangeStart) {
      return { error: 'Ce créneau n\'est pas disponible (matin bloqué).' };
    }
  }
  if (blockType === 'afternoon' && bh.open_time_2 && bh.close_time_2) {
    const rangeStart = bh.open_time_2.substring(0, 5);
    const rangeEnd = bh.close_time_2.substring(0, 5);
    if (data.timeSlot < rangeEnd && timeSlotEnd > rangeStart) {
      return { error: 'Ce créneau n\'est pas disponible (après-midi bloqué).' };
    }
  }

  // Check slot availability (overlap check)
  const available = await Booking.isSlotAvailable(data.date, data.timeSlot, timeSlotEnd);
  if (!available) {
    return { error: 'Ce créneau n\'est plus disponible. Veuillez en choisir un autre.' };
  }

  // Calculate total price with selected options
  const { totalPrice, selectedOptions } = computePrice(service, data.selectedOptions);

  return { error: null, service, timeSlotEnd, totalPrice, selectedOptions, blockType };
}

/**
 * Compute the total price of a booking including selected options.
 */
function computePrice(service, selectedOptionNames) {
  let totalPrice = parseFloat(service.price);
  let selectedOptions = [];

  if (selectedOptionNames && Array.isArray(selectedOptionNames)) {
    const serviceOptions = service.options || [];
    selectedOptions = selectedOptionNames.map(optName => {
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

  return { totalPrice, selectedOptions };
}

/**
 * Find or create a client and create the booking record.
 */
async function createBookingForClient(data, { service, timeSlotEnd, totalPrice, selectedOptions, status = 'pending' }) {
  const client = await Client.findOrCreate({
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    email: data.email || null,
    address: data.address
  });

  const bookingId = await Booking.create({
    clientId: client.id,
    serviceId: service.id,
    date: data.date,
    timeSlot: data.timeSlot,
    timeSlotEnd,
    address: data.address,
    notes: data.notes || null,
    totalPrice,
    selectedOptions: selectedOptions.map(o => o.name)
  });

  if (status !== 'pending') {
    await Booking.updateStatus(bookingId, status);
  }

  await Client.incrementBookings(client.id);

  return { bookingId, client };
}

module.exports = { validateBooking, computePrice, createBookingForClient };
