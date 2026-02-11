const transporter = require('../../config/mail');
const { getSiteConfig } = require('../middleware/siteConfig');
const { sanitizeText } = require('../utils/helpers');

async function sendBookingConfirmation(booking, client, service) {
  const site = getSiteConfig();
  const timeSlotLabels = {
    matin: 'Matin (9h-12h)',
    midi: 'Midi (12h-14h)',
    apresmidi: 'Après-midi (14h-17h)',
    soir: 'Fin de journée (17h-19h)'
  };

  const dateFormatted = new Date(booking.booking_date).toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  if (client.email) {
    await transporter.sendMail({
      from: `"${sanitizeText(site.business.name)}" <${process.env.MAIL_FROM || site.business.email}>`,
      to: client.email,
      subject: `Confirmation de votre demande - ${site.business.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${site.theme.colors.accent};">Merci pour votre demande, ${client.first_name} !</h2>
          <p>Votre demande de rendez-vous a bien été enregistrée. Voici le récapitulatif :</p>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Prestation :</strong> ${service.name}</p>
            <p><strong>Date :</strong> ${dateFormatted}</p>
            <p><strong>Créneau :</strong> ${timeSlotLabels[booking.time_slot] || booking.time_slot}</p>
            <p><strong>Adresse :</strong> ${booking.address}</p>
            <p><strong>Prix estimé :</strong> ${booking.total_price}€</p>
          </div>
          <p>Je vous confirmerai votre rendez-vous dans les plus brefs délais par téléphone ou email.</p>
          <p>À bientôt !<br><strong>${site.business.owner}</strong></p>
        </div>
      `
    });
  }

  // Notification admin
  if (site.features.emailNotifications && site.business.email) {
    await transporter.sendMail({
      from: `"${sanitizeText(site.business.name)}" <${process.env.MAIL_FROM || site.business.email}>`,
      to: site.business.email,
      subject: `Nouvelle demande de RDV - ${client.first_name} ${client.last_name}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Nouvelle demande de rendez-vous</h2>
          <p><strong>Client :</strong> ${client.first_name} ${client.last_name}</p>
          <p><strong>Téléphone :</strong> ${client.phone}</p>
          <p><strong>Email :</strong> ${client.email || 'Non renseigné'}</p>
          <p><strong>Prestation :</strong> ${service.name} (${service.price}€)</p>
          <p><strong>Date :</strong> ${dateFormatted}</p>
          <p><strong>Créneau :</strong> ${timeSlotLabels[booking.time_slot] || booking.time_slot}</p>
          <p><strong>Adresse :</strong> ${booking.address}</p>
          ${booking.notes ? `<p><strong>Notes :</strong> ${booking.notes}</p>` : ''}
          <p><a href="${process.env.APP_URL}/admin/bookings/${booking.id}">Voir dans le dashboard</a></p>
        </div>
      `
    });
  }
}

async function sendBookingStatusUpdate(booking, client, service, newStatus) {
  const site = getSiteConfig();
  if (!client.email) return;

  const statusMessages = {
    confirmed: {
      subject: `RDV confirmé - ${site.business.name}`,
      message: 'Votre rendez-vous est confirmé ! Je serai chez vous à la date et l\'heure convenue.'
    },
    cancelled: {
      subject: `RDV annulé - ${site.business.name}`,
      message: 'Votre rendez-vous a été annulé. N\'hésitez pas à reprendre rendez-vous quand vous le souhaitez.'
    },
    completed: {
      subject: `Merci pour votre visite - ${site.business.name}`,
      message: 'J\'espère que vous êtes satisfaite de votre prestation ! N\'hésitez pas à laisser un avis.'
    }
  };

  const info = statusMessages[newStatus];
  if (!info) return;

  const dateFormatted = new Date(booking.booking_date).toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  await transporter.sendMail({
    from: `"${sanitizeText(site.business.name)}" <${process.env.MAIL_FROM || site.business.email}>`,
    to: client.email,
    subject: info.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${site.theme.colors.accent};">${info.subject}</h2>
        <p>Bonjour ${client.first_name},</p>
        <p>${info.message}</p>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p><strong>Prestation :</strong> ${service.name}</p>
          <p><strong>Date :</strong> ${dateFormatted}</p>
        </div>
        <p>À bientôt !<br><strong>${site.business.owner}</strong></p>
      </div>
    `
  });
}

module.exports = { sendBookingConfirmation, sendBookingStatusUpdate };
