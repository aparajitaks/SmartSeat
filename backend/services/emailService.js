const nodemailer = require('nodemailer');

// Configure transporter based on environment variables
const createTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT) || 587;
  const secure = process.env.EMAIL_SECURE === 'true'; // true for 465, false for other ports
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('\n⚠️  EMAIL_USER or EMAIL_PASS environment variables are not configured.');
    console.warn('   Emails will be logged to the console instead of being sent.\n');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};

const transporter = createTransporter();

/**
 * Helper to format date cleanly
 */
const formatDate = (dateVal) => {
  return new Date(dateVal).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Send reservation confirmation email
 */
const sendReservationConfirmedEmail = async (reservation) => {
  try {
    const customerEmail = reservation.user.email;
    const customerName = reservation.user.name;
    const restaurantName = reservation.restaurant.name;
    const dateFormatted = formatDate(reservation.date);
    const timeFormatted = `${reservation.timeSlot.start} - ${reservation.timeSlot.end}`;
    const guestCount = reservation.partySize;
    const reservationId = reservation.reservationId;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"SmartSeat Support" <${process.env.EMAIL_USER || 'no-reply@smartseat.com'}>`,
      to: customerEmail,
      subject: 'Reservation Confirmed',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
          <h2 style="color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-top: 0;">Reservation Confirmed! 🪑</h2>
          <p style="font-size: 16px; color: #334155;">Hello ${customerName},</p>
          <p style="font-size: 16px; color: #334155;">Your reservation at <strong>${restaurantName}</strong> has been successfully confirmed. Here are your booking details:</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold; width: 140px;">Reservation ID:</td>
                <td style="padding: 6px 0; color: #0f172a;">${reservationId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Date:</td>
                <td style="padding: 6px 0; color: #0f172a;">${dateFormatted}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Time:</td>
                <td style="padding: 6px 0; color: #0f172a;">${timeFormatted}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Guest Count:</td>
                <td style="padding: 6px 0; color: #0f172a;">${guestCount} guests</td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 14px; color: #64748b;">If you need to make changes or cancel your booking, please log in to your account dashboard.</p>
          <p style="font-size: 16px; color: #334155; margin-bottom: 0;">Best regards,<br/><strong>The SmartSeat Team</strong></p>
        </div>
      `,
    };

    if (transporter) {
      await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Confirmation email sent to ${customerEmail}`);
    } else {
      console.log('\n--- SIMULATED EMAIL (Reservation Confirmed) ---');
      console.log(`To: ${customerEmail}`);
      console.log(`Subject: Reservation Confirmed`);
      console.log(`Customer: ${customerName}`);
      console.log(`Restaurant: ${restaurantName}`);
      console.log(`Date/Time: ${dateFormatted} @ ${timeFormatted}`);
      console.log(`Guests: ${guestCount}`);
      console.log(`Reservation ID: ${reservationId}`);
      console.log('-----------------------------------------------\n');
    }
  } catch (error) {
    console.error('[EmailService] Failed to send reservation confirmation email:', error.message);
  }
};

/**
 * Send reservation cancellation email
 */
const sendReservationCancelledEmail = async (reservation) => {
  try {
    const customerEmail = reservation.user.email;
    const customerName = reservation.user.name;
    const restaurantName = reservation.restaurant.name;
    const dateFormatted = formatDate(reservation.date);
    const timeFormatted = `${reservation.timeSlot.start} - ${reservation.timeSlot.end}`;
    const reservationId = reservation.reservationId;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"SmartSeat Support" <${process.env.EMAIL_USER || 'no-reply@smartseat.com'}>`,
      to: customerEmail,
      subject: 'Reservation Cancelled',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
          <h2 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px; margin-top: 0;">Reservation Cancelled</h2>
          <p style="font-size: 16px; color: #334155;">Hello ${customerName},</p>
          <p style="font-size: 16px; color: #334155;">Your reservation at <strong>${restaurantName}</strong> (ID: ${reservationId}) scheduled for ${dateFormatted} at ${timeFormatted} has been cancelled.</p>
          
          <p style="font-size: 16px; color: #334155;">We hope to host you again in the future!</p>
          <p style="font-size: 16px; color: #334155; margin-bottom: 0;">Best regards,<br/><strong>The SmartSeat Team</strong></p>
        </div>
      `,
    };

    if (transporter) {
      await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Cancellation email sent to ${customerEmail}`);
    } else {
      console.log('\n--- SIMULATED EMAIL (Reservation Cancelled) ---');
      console.log(`To: ${customerEmail}`);
      console.log(`Subject: Reservation Cancelled`);
      console.log(`Customer: ${customerName}`);
      console.log(`Restaurant: ${restaurantName}`);
      console.log(`Reservation ID: ${reservationId}`);
      console.log('-----------------------------------------------\n');
    }
  } catch (error) {
    console.error('[EmailService] Failed to send reservation cancellation email:', error.message);
  }
};

/**
 * Send waitlist promotion email
 */
const sendWaitlistPromotionEmail = async (reservation) => {
  try {
    const customerEmail = reservation.user.email;
    const customerName = reservation.user.name;
    const restaurantName = reservation.restaurant.name;
    const dateFormatted = formatDate(reservation.date);
    const timeFormatted = `${reservation.timeSlot.start} - ${reservation.timeSlot.end}`;
    const reservationId = reservation.reservationId;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"SmartSeat Support" <${process.env.EMAIL_USER || 'no-reply@smartseat.com'}>`,
      to: customerEmail,
      subject: 'Table Available',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
          <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px; margin-top: 0;">Table Available! 🎉</h2>
          <p style="font-size: 16px; color: #334155;">Hello ${customerName},</p>
          <p style="font-size: 18px; color: #10b981; font-weight: bold;">Good news! A table is now available for your booking.</p>
          <p style="font-size: 16px; color: #334155;">Your waitlisted request at <strong>${restaurantName}</strong> has been promoted and confirmed. Here are your booking details:</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold; width: 140px;">Reservation ID:</td>
                <td style="padding: 6px 0; color: #0f172a;">${reservationId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Date:</td>
                <td style="padding: 6px 0; color: #0f172a;">${dateFormatted}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Time:</td>
                <td style="padding: 6px 0; color: #0f172a;">${timeFormatted}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Guest Count:</td>
                <td style="padding: 6px 0; color: #0f172a;">${reservation.partySize} guests</td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 16px; color: #334155; margin-bottom: 0;">Best regards,<br/><strong>The SmartSeat Team</strong></p>
        </div>
      `,
    };

    if (transporter) {
      await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Waitlist promotion email sent to ${customerEmail}`);
    } else {
      console.log('\n--- SIMULATED EMAIL (Waitlist Promotion) ---');
      console.log(`To: ${customerEmail}`);
      console.log(`Subject: Table Available`);
      console.log(`Customer: ${customerName}`);
      console.log(`Restaurant: ${restaurantName}`);
      console.log(`Reservation ID: ${reservationId}`);
      console.log('Message: Good news! A table is now available for your booking.');
      console.log('--------------------------------------------\n');
    }
  } catch (error) {
    console.error('[EmailService] Failed to send waitlist promotion email:', error.message);
  }
};

module.exports = {
  sendReservationConfirmedEmail,
  sendReservationCancelledEmail,
  sendWaitlistPromotionEmail,
};
