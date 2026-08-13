import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

// ============================================================
// EMAIL SERVICE
// ============================================================

let transporter = null;

// ============================================================
// CONFIGURATION HELPERS
// ============================================================

const getEmailFrom = () => {
  const email = process.env.EMAIL_FROM || process.env.GMAIL_USER;

  if (!email) {
    throw new Error(
      'EMAIL_FROM or GMAIL_USER must be configured'
    );
  }

  const name =
    process.env.EMAIL_FROM_NAME || 'Car Booking App';

  return `"${sanitizeHeaderValue(name)}" <${sanitizeEmail(email)}>`;
};

/**
 * Remove CR/LF characters from values that can reach
 * email headers.
 *
 * This prevents email header injection.
 */
const sanitizeHeaderValue = (value) => {
  return String(value ?? '')
    .replace(/[\r\n]/g, '')
    .trim();
};

/**
 * Basic email normalization.
 *
 * The actual validation of user emails should preferably
 * happen earlier through your request validation layer.
 */
const sanitizeEmail = (email) => {
  return String(email ?? '')
    .replace(/[\r\n]/g, '')
    .trim()
    .toLowerCase();
};

/**
 * Escape HTML special characters before injecting
 * dynamic values into email templates.
 */
const escapeHtml = (value) => {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Convert HTML to a simple plain-text version.
 */
const htmlToText = (html = '') => {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Safely create an application URL.
 */
const getClientUrl = () => {
  return (
    process.env.CLIENT_URL ||
    'http://localhost:3000'
  ).replace(/\/+$/, '');
};

/**
 * Safely create the admin URL.
 */
const getAdminUrl = () => {
  return (
    process.env.ADMIN_URL ||
    'http://localhost:3000/admin'
  ).replace(/\/+$/, '');
};

// ============================================================
// INITIALIZE EMAIL SERVICE
// ============================================================

export const initializeEmailService = async () => {
  try {
    const emailService =
      process.env.EMAIL_SERVICE || 'gmail';

    // --------------------------------------------------------
    // Gmail / SMTP
    // --------------------------------------------------------

    if (
      emailService === 'gmail' ||
      !process.env.EMAIL_SERVICE
    ) {
      if (
        !process.env.GMAIL_USER ||
        !process.env.GMAIL_PASSWORD
      ) {
        throw new Error(
          'GMAIL_USER and GMAIL_PASSWORD are required'
        );
      }

      transporter = nodemailer.createTransport({
        service: 'gmail',

        host: 'smtp.gmail.com',

        port: 587,

        secure: false,
        requireTLS: true,

        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASSWORD,
        },
      });

      // Verify SMTP connection
      await transporter.verify();

      logger.success(
        '📧 Gmail email service initialized and verified'
      );

      return transporter;
    }

    // --------------------------------------------------------
    // SMTP generic configuration
    // --------------------------------------------------------

    if (emailService === 'smtp') {
      if (
        !process.env.SMTP_HOST ||
        !process.env.SMTP_PORT ||
        !process.env.SMTP_USER ||
        !process.env.SMTP_PASSWORD
      ) {
        throw new Error(
          'SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASSWORD are required'
        );
      }

      const smtpPort =
        Number(process.env.SMTP_PORT);

      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,

        port: smtpPort,

        secure: smtpPort === 465,

        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },

        tls: {
          rejectUnauthorized: true,
        },
      });

      await transporter.verify();

      logger.success(
        '📧 SMTP email service initialized and verified'
      );

      return transporter;
    }

    throw new Error(
      `Unsupported EMAIL_SERVICE: ${emailService}`
    );

  } catch (error) {
    transporter = null;

    logger.error(
      '❌ Failed to initialize email service',
      error
    );

    throw error;
  }
};

// ============================================================
// SEND EMAIL
// ============================================================

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
  from,
  replyTo,
}) => {
  try {
    if (!transporter) {
      throw new Error(
        'Email service not initialized'
      );
    }

    const safeTo = sanitizeEmail(to);

    const safeSubject =
      sanitizeHeaderValue(subject);

    const safeFrom =
      from
        ? sanitizeHeaderValue(from)
        : getEmailFrom();

    const safeReplyTo =
      replyTo
        ? sanitizeEmail(replyTo)
        : undefined;

    if (!safeTo) {
      throw new Error(
        'Recipient email address is required'
      );
    }

    if (!safeSubject) {
      throw new Error(
        'Email subject is required'
      );
    }

    if (!html && !text) {
      throw new Error(
        'Email must contain html or text content'
      );
    }

    const mailOptions = {
      from: safeFrom,

      to: safeTo,

      subject: safeSubject,

      html: html || undefined,

      text:
        text ||
        htmlToText(html),

      ...(safeReplyTo && {
        replyTo: safeReplyTo,
      }),
    };

    const info =
      await transporter.sendMail(
        mailOptions
      );

    logger.success(
      `📧 Email sent successfully to ${safeTo}`
    );

    return info;

  } catch (error) {
    logger.error(
      `❌ Failed to send email to ${sanitizeEmail(to)}`,
      error
    );

    throw error;
  }
};

// ============================================================
// ADMIN NOTIFICATION
// ============================================================

export const sendAdminNotificationEmail = async (
  booking,
  user,
  car
) => {
  try {
    const safeUserName =
      escapeHtml(user?.name);

    const safeUserEmail =
      escapeHtml(user?.email);

    const safeCarName =
      escapeHtml(car?.name);

    const safeBookingId =
      escapeHtml(booking?._id);

    const startDate =
      new Date(
        booking.startDate
      ).toLocaleDateString();

    const endDate =
      new Date(
        booking.endDate
      ).toLocaleDateString();

    const totalAmount =
      escapeHtml(booking?.totalAmount);

    const adminUrl =
      escapeHtml(getAdminUrl());

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, initial-scale=1.0">

  <title>Nouvelle demande de réservation</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      background: #f5f5f5;
      margin: 0;
      padding: 20px;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      padding: 20px;
      border: 1px solid #eee;
      border-radius: 8px;
    }

    .header {
      background: #2d3748;
      color: #ffffff;
      padding: 15px;
      text-align: center;
      border-radius: 6px;
    }

    .highlight {
      color: #667eea;
      font-weight: bold;
    }

    .details {
      background: #f7fafc;
      padding: 15px;
      border-radius: 5px;
    }

    .button {
      display: inline-block;
      background: #667eea;
      color: #ffffff;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 15px;
    }
  </style>
</head>

<body>

<div class="container">

  <div class="header">
    <h1>Nouvelle demande de réservation</h1>
  </div>

  <div>

    <p>Bonjour Admin,</p>

    <p>
      Une nouvelle réservation vient d'être effectuée
      par
      <span class="highlight">
        ${safeUserName}
      </span>
      (${safeUserEmail}).
    </p>

    <div class="details">

      <p>
        <strong>Véhicule :</strong>
        ${safeCarName}
      </p>

      <p>
        <strong>Période :</strong>
        du ${startDate} au ${endDate}
      </p>

      <p>
        <strong>Montant total :</strong>
        $${totalAmount}
      </p>

      <p>
        <strong>Booking ID :</strong>
        ${safeBookingId}
      </p>

    </div>

    <p>
      Merci de vous connecter au panel
      d'administration pour valider ou refuser
      cette demande.
    </p>

    <p style="text-align: center;">
      <a
        href="${adminUrl}"
        class="button"
      >
        Accéder au panel
      </a>
    </p>

  </div>

</div>

</body>
</html>
`;

    await sendEmail({
      to: process.env.GMAIL_USER,
      subject: `🚨 Nouvelle réservation : ${sanitizeHeaderValue(car?.name)} par ${sanitizeHeaderValue(user?.name)}`,
      html,
    });

    logger.success(
      '✅ Admin notification email sent'
    );

  } catch (error) {
    logger.error(
      '❌ Failed to send admin notification email',
      error
    );
  }
};

// ============================================================
// BOOKING CONFIRMATION
// ============================================================

export const sendBookingConfirmationEmail = async (
  booking,
  user,
  car
) => {
  try {
    const bookingDate =
      new Date(
        booking.startDate
      ).toLocaleDateString();

    const endDate =
      new Date(
        booking.endDate
      ).toLocaleDateString();

    const duration = Math.ceil(
      (
        new Date(booking.endDate) -
        new Date(booking.startDate)
      ) /
      (1000 * 60 * 60 * 24)
    );

    const safeUserName =
      escapeHtml(user?.name);

    const safeBookingId =
      escapeHtml(booking?._id);

    const safeCarName =
      escapeHtml(car?.name);

    const safeCategory =
      escapeHtml(car?.category);

    const safeCarPrice =
      Number(car?.price) || 0;

    const safeTotalAmount =
      Number(booking?.totalAmount) || 0;

    const safeDuration =
      Math.max(duration, 1);

    const basePrice =
      safeCarPrice * safeDuration;

    const insuranceAmount =
      basePrice * 0.1;

    const additionalDriverAmount =
      50 * safeDuration;

    const html = `
<!DOCTYPE html>
<html lang="en">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>Booking Confirmation</title>

  <style>

    body {
      font-family: Arial, sans-serif;
      background: #f5f5f5;
      margin: 0;
      padding: 20px;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      padding: 20px;
      border-radius: 8px;
    }

    .header {
      background: #667eea;
      color: white;
      padding: 20px;
      border-radius: 5px;
    }

    .content {
      margin: 20px 0;
    }

    .footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
    }

    .booking-details {
      background: #f9f9f9;
      padding: 15px;
      margin: 10px 0;
      border-left: 4px solid #667eea;
    }

    .price-breakdown {
      margin: 15px 0;
    }

    .price-line {
      padding: 7px 0;
    }

  </style>

</head>

<body>

<div class="container">

  <div class="header">

    <h1>✓ Booking Confirmed!</h1>

    <p>
      Your reservation is confirmed
    </p>

  </div>

  <div class="content">

    <h2>
      Hello ${safeUserName},
    </h2>

    <p>
      Thank you for booking with us!
      Your car rental reservation has been confirmed.
    </p>

    <div class="booking-details">

      <h3>Booking Details</h3>

      <p>
        <strong>Booking ID:</strong>
        ${safeBookingId}
      </p>

      <p>
        <strong>Car:</strong>
        ${safeCarName}
      </p>

      <p>
        <strong>Category:</strong>
        ${safeCategory}
      </p>

      <p>
        <strong>Pickup Date:</strong>
        ${bookingDate}
      </p>

      <p>
        <strong>Return Date:</strong>
        ${endDate}
      </p>

      <p>
        <strong>Duration:</strong>
        ${safeDuration} days
      </p>

    </div>

    <div class="price-breakdown">

      <h3>Price Breakdown</h3>

      <div class="price-line">
        Base Price
        (${safeDuration} days × $${safeCarPrice}/day):
        <strong>
          $${basePrice.toFixed(2)}
        </strong>
      </div>

      ${
        booking.insurance
          ? `
            <div class="price-line">
              Insurance (+10%):
              <strong>
                $${insuranceAmount.toFixed(2)}
              </strong>
            </div>
          `
          : ''
      }

      ${
        booking.additionalDriver
          ? `
            <div class="price-line">
              Additional Driver:
              <strong>
                $${additionalDriverAmount.toFixed(2)}
              </strong>
            </div>
          `
          : ''
      }

      <div
        class="price-line"
        style="
          border-top:1px solid #ddd;
          margin-top:10px;
          padding-top:10px;
          font-weight:bold;
        "
      >

        Total Amount:

        <strong>
          $${safeTotalAmount.toFixed(2)}
        </strong>

      </div>

    </div>

    <p>
      Payment must be made before pickup.
      Please ensure you have a valid payment method
      and valid driver's license.
    </p>

    <p>
      <strong>Important Information:</strong>
    </p>

    <ul>

      <li>
        Please arrive 15 minutes before pickup time.
      </li>

      <li>
        Driver must be at least 25 years old.
      </li>

      <li>
        Valid insurance is required.
      </li>

      <li>
        Cancellation policy applies.
      </li>

    </ul>

  </div>

  <div class="footer">

    <p>
      Car Booking App - Your Trusted Rental Partner
    </p>

    <p
      style="
        color:#999;
        font-size:12px;
      "
    >
      Contact Support |
      Terms & Conditions
    </p>

  </div>

</div>

</body>
</html>
`;

    await sendEmail({
      to: user.email,

      subject:
        `Booking Confirmation - ${sanitizeHeaderValue(car?.name)} (${sanitizeHeaderValue(booking?._id)})`,

      html,
    });

  } catch (error) {

    logger.error(
      '❌ Failed to send booking confirmation email',
      error
    );

    throw error;
  }
};

// ============================================================
// PASSWORD RESET
// ============================================================

export const sendPasswordResetEmail = async (
  user,
  resetToken
) => {
  try {
    const resetUrl =
      `${getClientUrl()}/reset-password/${encodeURIComponent(resetToken)}`;

    const safeUserName =
      escapeHtml(user?.name);

    const safeResetUrl =
      escapeHtml(resetUrl);

    const html = `
<!DOCTYPE html>
<html lang="en">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>Password Reset</title>

  <style>

    body {
      font-family: Arial, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      padding: 20px;
      border-radius: 8px;
    }

    .header {
      background: #667eea;
      color: white;
      padding: 20px;
      border-radius: 5px;
      text-align: center;
    }

    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }

    .warning {
      background: #fff3cd;
      border: 1px solid #ffc107;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }

  </style>

</head>

<body>

<div class="container">

  <div class="header">

    <h1>Password Reset Request</h1>

  </div>

  <div>

    <p>
      Hello ${safeUserName},
    </p>

    <p>
      We received a request to reset your password.
      If you didn't make this request,
      you can safely ignore this email.
    </p>

    <p style="text-align:center;">

      <a
        href="${safeResetUrl}"
        class="button"
      >
        Reset Password
      </a>

    </p>

    <p>
      Or copy this link into your browser:
    </p>

    <p
      style="
        word-break:break-all;
        background:#f5f5f5;
        padding:10px;
        border-radius:5px;
      "
    >
      ${safeResetUrl}
    </p>

    <div class="warning">

      <strong>
        ⚠️ Security Notice
      </strong>

      <p>
        This link will expire in 10 minutes.
        If you did not request a password reset,
        please ignore this email.
      </p>

    </div>

  </div>

  <div
    style="
      background:#f5f5f5;
      padding:20px;
      text-align:center;
    "
  >

    <p>
      Car Booking App - Your Trusted Rental Partner
    </p>

  </div>

</div>

</body>
</html>
`;

    await sendEmail({
      to: user.email,

      subject:
        'Password Reset Request - Car Booking App',

      html,
    });

  } catch (error) {

    logger.error(
      '❌ Failed to send password reset email',
      error
    );

    throw error;
  }
};

// ============================================================
// WELCOME EMAIL
// ============================================================

export const sendWelcomeEmail = async (
  user
) => {
  try {
    const safeUserName =
      escapeHtml(user?.name);

    const html = `
<!DOCTYPE html>
<html lang="en">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>Welcome</title>

</head>

<body
  style="
    font-family:Arial,sans-serif;
    background:#f5f5f5;
    padding:20px;
  "
>

<div
  style="
    max-width:600px;
    margin:0 auto;
    background:#fff;
    padding:20px;
    border-radius:8px;
  "
>

  <div
    style="
      background:#667eea;
      color:#fff;
      padding:20px;
      border-radius:5px;
      text-align:center;
    "
  >

    <h1>
      Welcome to Car Booking App! 🎉
    </h1>

  </div>

  <div style="margin:20px 0;">

    <p>
      Hello ${safeUserName},
    </p>

    <p>
      Your account has been successfully created.
      Welcome to the Car Booking App family!
    </p>

    <p>
      You can now:
    </p>

    <ul>

      <li>
        Browse and book cars
      </li>

      <li>
        Track your bookings
      </li>

      <li>
        Manage your profile
      </li>

      <li>
        Get exclusive deals and offers
      </li>

    </ul>

    <p>
      To get started, visit your dashboard
      and browse available cars.
    </p>

  </div>

  <div
    style="
      background:#f5f5f5;
      padding:20px;
      text-align:center;
    "
  >

    <p>
      Car Booking App - Your Trusted Rental Partner
    </p>

  </div>

</div>

</body>
</html>
`;

    await sendEmail({
      to: user.email,

      subject:
        'Welcome to Car Booking App!',

      html,
    });

  } catch (error) {

    logger.error(
      '❌ Failed to send welcome email',
      error
    );

    // Welcome email is non-critical.
  }
};

// ============================================================
// CANCELLATION EMAIL
// ============================================================

export const sendCancellationEmail = async (
  booking,
  user,
  car,
  refundAmount
) => {
  try {
    const safeUserName =
      escapeHtml(user?.name);

    const safeBookingId =
      escapeHtml(booking?._id);

    const safeCarName =
      escapeHtml(car?.name);

    const safeBookingAmount =
      Number(booking?.totalAmount) || 0;

    const safeRefundAmount =
      Number(refundAmount) || 0;

    const html = `
<!DOCTYPE html>
<html lang="en">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>Booking Cancelled</title>

</head>

<body
  style="
    font-family:Arial,sans-serif;
    background:#f5f5f5;
    padding:20px;
  "
>

<div
  style="
    max-width:600px;
    margin:0 auto;
    background:#fff;
    padding:20px;
    border-radius:8px;
  "
>

  <div
    style="
      background:#ff6b6b;
      color:white;
      padding:20px;
      border-radius:5px;
    "
  >

    <h1>
      Booking Cancelled
    </h1>

  </div>

  <div style="margin:20px 0;">

    <p>
      Hello ${safeUserName},
    </p>

    <p>
      Your booking has been successfully cancelled.
    </p>

    <p>
      <strong>Booking Details:</strong>
    </p>

    <ul>

      <li>
        Booking ID:
        ${safeBookingId}
      </li>

      <li>
        Car:
        ${safeCarName}
      </li>

      <li>
        Original Amount:
        $${safeBookingAmount.toFixed(2)}
      </li>

    </ul>

    ${
      safeRefundAmount > 0
        ? `
          <div
            style="
              background:#d4edda;
              border:1px solid #c3e6cb;
              padding:15px;
              border-radius:5px;
              margin:20px 0;
            "
          >

            <h3>
              ✓ Refund Processed
            </h3>

            <p>
              <strong>
                Refund Amount:
                $${safeRefundAmount.toFixed(2)}
              </strong>
            </p>

            <p>
              The refund will be credited
              to your original payment method
              according to the payment provider's
              processing time.
            </p>

          </div>
        `
        : `
          <p style="color:#d32f2f;">

            <strong>
              No refund applicable
            </strong>

            based on our cancellation policy.

          </p>
        `
    }

    <p>
      If you have any questions about this
      cancellation, please contact our support team.
    </p>

  </div>

  <div
    style="
      background:#f5f5f5;
      padding:20px;
      text-align:center;
    "
  >

    <p>
      Car Booking App - Your Trusted Rental Partner
    </p>

  </div>

</div>

</body>
</html>
`;

    await sendEmail({
      to: user.email,

      subject:
        `Cancellation Confirmed - ${sanitizeHeaderValue(car?.name)}`,

      html,
    });

  } catch (error) {

    logger.error(
      '❌ Failed to send cancellation email',
      error
    );

    // Cancellation email is non-critical.
  }
};

// ============================================================
// EMAIL VERIFICATION
// ============================================================

export const sendVerificationEmail = async (
  user,
  verificationToken
) => {
  try {
    const verifyUrl =
      `${getClientUrl()}/verify-email/${encodeURIComponent(verificationToken)}`;

    const safeUserName =
      escapeHtml(user?.name);

    const safeVerifyUrl =
      escapeHtml(verifyUrl);

    const html = `
<!DOCTYPE html>
<html lang="en">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>Verify Your Email</title>

</head>

<body
  style="
    font-family:Arial,sans-serif;
    background:#f5f5f5;
    padding:20px;
  "
>

<div
  style="
    max-width:600px;
    margin:0 auto;
    background:#fff;
    padding:20px;
    border-radius:8px;
  "
>

  <div
    style="
      background:#667eea;
      color:white;
      padding:20px;
      border-radius:5px;
      text-align:center;
    "
  >

    <h1>
      Verify Your Email Address
    </h1>

  </div>

  <div style="margin:20px 0;">

    <p>
      Hello ${safeUserName},
    </p>

    <p>
      Thank you for registering!
      Please click the button below
      to verify your email address.
    </p>

    <p style="text-align:center;">

      <a
        href="${safeVerifyUrl}"
        style="
          display:inline-block;
          background:#667eea;
          color:#fff;
          padding:12px 30px;
          text-decoration:none;
          border-radius:5px;
        "
      >
        Verify Email
      </a>

    </p>

    <p>
      Or copy this link into your browser:
    </p>

    <p
      style="
        word-break:break-all;
        background:#f5f5f5;
        padding:10px;
        border-radius:5px;
      "
    >
      ${safeVerifyUrl}
    </p>

    <p>
      This link will expire in 24 hours.
    </p>

  </div>

  <div
    style="
      background:#f5f5f5;
      padding:20px;
      text-align:center;
    "
  >

    <p>
      Car Booking App - Your Trusted Rental Partner
    </p>

  </div>

</div>

</body>
</html>
`;

    await sendEmail({
      to: user.email,

      subject:
        'Verify your email - Car Booking App',

      html,
    });

  } catch (error) {

    logger.error(
      '❌ Failed to send verification email',
      error
    );

    throw error;
  }
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

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