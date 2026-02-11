const Client = require('../../models/Client');
const Booking = require('../../models/Booking');
const { formatDate, formatTimeSlot, statusLabels, statusColors } = require('../../utils/helpers');

const clientsController = {
  async index(req, res) {
    try {
      const { search } = req.query;
      const clients = await Client.findAll(search);

      res.render('admin/clients/index', {
        layout: 'layouts/admin',
        title: 'Clients',
        isLoginPage: false,
        clients,
        search: search || ''
      });
    } catch (err) {
      console.error('Clients list error:', err);
      req.flash('error', 'Erreur lors du chargement des clients.');
      res.redirect('/admin');
    }
  },

  async show(req, res) {
    try {
      const client = await Client.findById(req.params.id);
      if (!client) {
        req.flash('error', 'Client introuvable.');
        return res.redirect('/admin/clients');
      }

      const bookings = await Booking.findByClientId(client.id);

      res.render('admin/clients/show', {
        layout: 'layouts/admin',
        title: `${client.first_name} ${client.last_name}`,
        isLoginPage: false,
        clientData: client,
        bookings,
        formatDate,
        formatTimeSlot,
        statusLabels,
        statusColors
      });
    } catch (err) {
      console.error('Client show error:', err);
      req.flash('error', 'Erreur lors du chargement du client.');
      res.redirect('/admin/clients');
    }
  }
};

module.exports = clientsController;
