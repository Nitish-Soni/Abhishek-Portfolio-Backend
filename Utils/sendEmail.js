const nodemailer = require("nodemailer");

// Auth0-style STARTTLS configuration for Zoho
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.zoho.in",
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: false, // Must be FALSE for port 587 so STARTTLS can initiate
  requireTLS: true, // Forces Nodemailer to upgrade to encrypted TLS immediately
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false,
  },
  family: 4, // Prevents IPv6 connection hangs on local machines
});

// Verify SMTP connection on server startup
transporter.verify((error) => {
  if (error) {
    console.error("❌ Zoho Connection Error:", error.message);
  } else {
    console.log("✅ Zoho SMTP Connected Successfully (587 STARTTLS)!");
  }
});

const sendWelcomeEmail = async (toEmail) => {
  const mailOptions = {
    from: `"Abhishek Kabra" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Welcome to the Dispatch | Subscription Confirmed",
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #121316; color: #f3f4f6; padding: 2rem; border-radius: 8px;">
        <h2 style="font-family: Georgia, serif; color: #ffffff; margin-bottom: 0.5rem;">Welcome to the Dispatch</h2>
        <p style="color: #9ca3af; font-size: 0.95rem; line-height: 1.6;">
          Thank you for subscribing! You are now on the list to receive occasional essays, reading recommendations, and publication updates directly in your inbox.
        </p>
        <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 1.5rem 0;" />
        <p style="font-size: 0.85rem; color: #6b7280; margin: 0;">
          If you didn't request this email, you can safely ignore it or reply to unsubscribe at any time.
        </p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = { sendWelcomeEmail };
