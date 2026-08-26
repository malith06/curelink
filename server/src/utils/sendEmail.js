const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If SMTP is not configured, just log to console (useful for development)
  if (!process.env.SMTP_HOST || !process.env.SMTP_EMAIL) {
    console.log('===========================================================');
    console.log('📧 MOCK EMAIL DISPATCH');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log('Message:');
    console.log(options.message);
    console.log('===========================================================');
    return;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  const message = {
    from: `${process.env.FROM_NAME || 'CureLink'} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  const info = await transporter.sendMail(message);
  console.log(`Message sent: %s`, info.messageId);
};

module.exports = sendEmail;
