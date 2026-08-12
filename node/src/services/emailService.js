import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

/**
 * Email Service Configuration
 * Supports SMTP, SendGrid, and other email services
 */

let transporter;

/**
 * Initialize email transporter based on configuration
 */
export const initializeEmailService = async () => {
  try {
    if (process.env.EMAIL_SERVICE === 'sendgrid') {
      // SendGrid configuration
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      transporter = sgMail;
      logger.success('SendGrid email service initialized');
    } else if (process.env.EMAIL_SERVICE === 'gmail' || !process.env.EMAIL_SERVICE) {
      // Gmail configuration (default)
      transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASSWORD,
        },
      });

      // Verify connection
      await transporter.verify();
      logger.success('Gmail email service initialized and verified');
    }

    return transporter;
  } catch (error) {
    logger.error('Failed to initialize email service', error);
    throw error;
  }
};

/**
 * Send notification to Admin/Owner about a new booking request
 */
export const sendAdminNotificationEmail = async (booking, user, car) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; }
            .header { background-color: #2d3748; color: white; padding: 15px; text-align: center; }
            .highlight { color: #667eea; font-weight: bold; }
            .details { background: #f7fafc; padding: 15px; border-radius: 5px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header"><h1>Nouvelle Demande de Réservation</h1></div>
            <div class="content">
              <p>Bonjour Admin,</p>
              <p>Une nouvelle réservation vient d'être effectuée par <span class="highlight">${user.name}</span> (${user.email}).</p>
              
              <div class="details">
                <p><strong>Véhicule :</strong> ${car.name}</p>
                <p><strong>Période :</strong> du ${new Date(booking.startDate).toLocaleDateString()} au ${new Date(booking.endDate).toLocaleDateString()}</p>
                <p><strong>Montant Total :</strong> $${booking.totalAmount}</p>
              </div>
              
              <p>Merci de vous connecter au panel d'administration pour valider ou refuser cette demande.</p>
              <center>
                <a href="${process.env.ADMIN_URL || 'http://localhost:3000/admin'}" class="button">Accéder au Panel</a>
              </center>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: process.env.GMAIL_USER, // L'admin reçoit l'email sur son adresse de gestion
      subject: `🚨 Nouvelle réservation : ${car.name} par ${user.name}`,
      html,
    });
    logger.success('Admin notification email sent');
  } catch (error) {
    logger.error('Failed to send admin notification email', error);
  }
};

/**
 * Send email using configured service
 * using nodemailer and gmail as default, but can be extended to support SendGrid or others
 */
export const sendEmail = async ({ to, subject, html, text, from }) => {
  try {
    if (!transporter) {
      throw new Error('Email service not initialized');
    }

    const mailOptions = {
      from: from || `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text: text || html?.replace(/<[^>]*>/g, ''), // Strip HTML tags for plain text
    };

    if (process.env.EMAIL_SERVICE === 'gmail' || !process.env.EMAIL_SERVICE) {
      const msg = {
        ...mailOptions,
        from: process.env.EMAIL_FROM,
      };
      const response = await transporter.send(msg);
      logger.success(`Email sent to ${to} - MessageID: ${response[0].id}`);
      return response;
    } else {
      const info = await transporter.sendMail(mailOptions);
      logger.success(`Email sent to ${to} - MessageID: ${info.messageId}`);
      return info;
    }
  } catch (error) {
    logger.error(`Failed to send email to ${to}`, error);
    throw error;
  }
};

/**
 * Send booking confirmation email
 */
export const sendBookingConfirmationEmail = async (booking, user, car) => {
  try {
    const bookingDate = new Date(booking.startDate).toLocaleDateString();
    const endDate = new Date(booking.endDate).toLocaleDateString();
    const duration = Math.ceil(
      (new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24)
    );

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #667eea; color: white; padding: 20px; border-radius: 5px; }
            .content { margin: 20px 0; }
            .footer { background-color: #f5f5f5; padding: 20px; text-align: center; }
            .booking-details { background-color: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; }
            .price-breakdown { margin: 15px 0; }
            .price-line { display: flex; justify-content: space-between; padding: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Booking Confirmed!</h1>
              <p>Your reservation is confirmed</p>
            </div>

            <div class="content">
              <h2>Hello ${user.name},</h2>
              <p>Thank you for booking with us! Your car rental reservation has been confirmed.</p>

              <div class="booking-details">
                <h3>Booking Details</h3>
                <p><strong>Booking ID:</strong> ${booking._id}</p>
                <p><strong>Car:</strong> ${car.name}</p>
                <p><strong>Category:</strong> ${car.category}</p>
                <p><strong>Pickup Date:</strong> ${bookingDate}</p>
                <p><strong>Return Date:</strong> ${endDate}</p>
                <p><strong>Duration:</strong> ${duration} days</p>
              </div>

              <div class="price-breakdown">
                <h3>Price Breakdown</h3>
                <div class="price-line">
                  <span>Base Price (${duration} days × $${car.price}/day):</span>
                  <span>$${car.price * duration}</span>
                </div>
                ${booking.insurance ? `<div class="price-line">
                  <span>Insurance (+10%):</span>
                  <span>$${(car.price * duration * 0.1).toFixed(2)}</span>
                </div>` : ''}
                ${booking.additionalDriver ? `<div class="price-line">
                  <span>Additional Driver (+$50/day):</span>
                  <span>$${50 * duration}</span>
                </div>` : ''}
                <div class="price-line" style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px; font-weight: bold;">
                  <span>Total Amount:</span>
                  <span>$${booking.totalAmount}</span>
                </div>
              </div>

              <p>Payment must be made before pickup. Please ensure you have valid payment method and valid driver's license.</p>

              <p style="color: #666; font-size: 12px;">
                <strong>Important Info:</strong>
                <ul>
                  <li>Please arrive 15 minutes before scheduled pickup time</li>
                  <li>Driver must be at least 25 years old</li>
                  <li>Valid insurance is required</li>
                  <li>Cancellation policy applies - see terms for details</li>
                </ul>
              </p>
            </div>

            <div class="footer">
              <p>Car Booking App - Your Trusted Rental Partner</p>
              <p style="color: #999; font-size: 12px;">
                <a href="https://carbooking.com/contact">Contact Support</a> | 
                <a href="https://carbooking.com/terms">Terms & Conditions</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: `Booking Confirmation - ${car.name} (${booking._id})`,
      html,
    });
  } catch (error) {
    logger.error('Failed to send booking confirmation email', error);
    throw error;
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #667eea; color: white; padding: 20px; border-radius: 5px; text-align: center; }
            .content { margin: 20px 0; }
            .button { display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { background-color: #f5f5f5; padding: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>

            <div class="content">
              <p>Hello ${user.name},</p>
              <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>

              <center>
                <a href="${resetUrl}" class="button">Reset Password</a>
              </center>

              <p>Or copy this link in your browser:</p>
              <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">
                ${resetUrl}
              </p>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <p>This link will expire in 10 minutes. If you did not request a password reset, please ignore this email or contact support immediately.</p>
              </div>
            </div>

            <div class="footer">
              <p>Car Booking App - Your Trusted Rental Partner</p>
              <p style="color: #999; font-size: 12px;">
                <a href="https://carbooking.com/contact">Contact Support</a> | 
                <a href="https://carbooking.com/terms">Terms & Conditions</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request - Car Booking App',
      html,
    });
  } catch (error) {
    logger.error('Failed to send password reset email', error);
    throw error;
  }
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (user) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #667eea; color: white; padding: 20px; border-radius: 5px; text-align: center; }
            .content { margin: 20px 0; }
            .footer { background-color: #f5f5f5; padding: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Car Booking App! 🎉</h1>
            </div>

            <div class="content">
              <p>Hello ${user.name},</p>
              <p>Your account has been successfully created. Welcome to the Car Booking App family!</p>

              <p>You can now:</p>
              <ul>
                <li>Browse and book cars from our extensive inventory</li>
                <li>Track your bookings and reservations</li>
                <li>Manage your profile and preferences</li>
                <li>Get exclusive deals and offers</li>
              </ul>

              <p>To get started, visit your dashboard and browse available cars in your area.</p>
            </div>

            <div class="footer">
              <p>Car Booking App - Your Trusted Rental Partner</p>
              <p style="color: #999; font-size: 12px;">
                <a href="https://carbooking.com/about">About Us</a> | 
                <a href="https://carbooking.com/contact">Contact Support</a> | 
                <a href="https://carbooking.com/terms">Terms & Conditions</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Welcome to Car Booking App!',
      html,
    });
  } catch (error) {
    logger.error('Failed to send welcome email', error);
    // Don't throw - this is non-critical
  }
};

/**
 * Send cancellation confirmation email
 */
export const sendCancellationEmail = async (booking, user, car, refundAmount) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #ff6b6b; color: white; padding: 20px; border-radius: 5px; }
            .content { margin: 20px 0; }
            .refund-box { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { background-color: #f5f5f5; padding: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Cancelled</h1>
            </div>

            <div class="content">
              <p>Hello ${user.name},</p>
              <p>Your booking has been successfully cancelled.</p>

              <p><strong>Booking Details:</strong></p>
              <ul>
                <li>Booking ID: ${booking._id}</li>
                <li>Car: ${car.name}</li>
                <li>Original Amount: $${booking.totalAmount}</li>
              </ul>

              ${refundAmount > 0 ? `
                <div class="refund-box">
                  <h3>✓ Refund Processed</h3>
                  <p><strong>Refund Amount: $${refundAmount}</strong></p>
                  <p>The refund will be credited to your original payment method within 3-5 business days.</p>
                </div>
              ` : `
                <p style="color: #d32f2f;"><strong>No refund applicable</strong> based on our cancellation policy.</p>
              `}

              <p>If you have any questions about this cancellation or need further assistance, please contact our support team.</p>
            </div>

            <div class="footer">
              <p>Car Booking App - Your Trusted Rental Partner</p>
              <p style="color: #999; font-size: 12px;">
                <a href="https://carbooking.com/contact">Contact Support</a> | 
                <a href="https://carbooking.com/cancellation-policy">Cancellation Policy</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: `Cancellation Confirmed - ${car.name}`,
      html,
    });
  } catch (error) {
    logger.error('Failed to send cancellation email', error);
    // Don't throw - this is non-critical
  }
};

/**
 * Send email verification link
 */
export const sendVerificationEmail = async (user, verificationToken) => {
  try {
    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #667eea; color: white; padding: 20px; border-radius: 5px; text-align: center; }
            .content { margin: 20px 0; }
            .button { display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { background-color: #f5f5f5; padding: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email Address</h1>
            </div>

            <div class="content">
              <p>Hello ${user.name},</p>
              <p>Thank you for registering! Please click the button below to verify your email address and activate full account capabilities.</p>

              <center>
                <a href="${verifyUrl}" class="button">Verify Email</a>
              </center>

              <p>Or copy this link into your browser:</p>
              <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">
                ${verifyUrl}
              </p>

              <p>This link will expire in 24 hours.</p>
            </div>

            <div class="footer">
              <p>Car Booking App - Your Trusted Rental Partner</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Verify your email - Car Booking App',
      html,
    });
  } catch (error) {
    logger.error('Failed to send verification email', error);
    throw error;
  }
};

export default {
  initializeEmailService,
  sendEmail,
  sendBookingConfirmationEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendCancellationEmail,
  sendAdminNotificationEmail,
};
