const nodemailer = require("nodemailer");

// Cloud-optimized Transporter for Render (Port 465 SSL)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtppro.zoho.in",
  port: parseInt(process.env.EMAIL_PORT, 10) || 465, // Defaults to 465 SSL
  secure: true, // MUST be true for port 465 on Render/Cloud hosts
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000, // Fail fast after 10 seconds if blocked
  greetingTimeout: 10000,
  socketTimeout: 10000,
  family: 4, // Force IPv4 to prevent IPv6 connection hangs
});

// Verify SMTP connection on server startup
transporter.verify((error) => {
  if (error) {
    console.error("❌ Zoho Connection Error:", error.message);
  } else {
    console.log("✅ Zoho SMTP Connected Successfully (465 SSL)!");
  }
});

/**
 * Universal Email Dispatcher
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: `"Abhishek Kabra" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: html || text,
    text,
  };

  return await transporter.sendMail(mailOptions);
};

/* ==========================================================================
   GLOBAL EMAIL WRAPPER (DARK GLASS / BRANDED CARD)
   ========================================================================== */
const renderEmailWrapper = ({ preheader, contentHtml }) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dispatch</title>
      <style type="text/css">
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #0b0c0e; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0b0c0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="display: none; font-size: 1px; color: #0b0c0e; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        ${preheader || "Updates from Abhishek Kabra"}
      </div>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0c0e; padding: 40px 15px;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #131418; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              
              <!-- Header -->
              <tr>
                <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="left">
                        <span style="font-size: 12px; font-weight: 700; letter-spacing: 2px; color: #cc3a63; text-transform: uppercase;">ABHISHEK KABRA</span>
                        <div style="font-size: 18px; font-weight: 600; color: #ffffff; margin-top: 2px;">The Dispatch</div>
                      </td>
                      <td align="right" style="font-size: 12px; color: #6b7280;">2nison6.com</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Body Content -->
              <tr>
                <td style="padding: 32px; color: #e5e7eb; font-size: 15px; line-height: 1.65;">
                  ${contentHtml}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px 32px; background-color: #0e0f12; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
                  <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280;">
                    Designed & Engineered by <a href="https://2nison6.com" style="color: #9ca3af; text-decoration: underline;">Abhishek Kabra</a>
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #4b5563; line-height: 1.4;">
                    You are receiving this transactional email regarding your subscription or inquiry on 2nison6.com.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/* ==========================================================================
   1. INQUIRY REPLY EMAIL
   ========================================================================== */
const sendInquiryReply = async ({ to, subject, inquiry, replyText }) => {
  const formattedDate = new Date(
    inquiry?.createdAt || Date.now(),
  ).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const blockquotedOriginal = (inquiry?.message || "")
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");

  const plainTextMessage = `Thank you for reaching out regarding "${inquiry?.subject || "your inquiry"}".

==================================================
YOUR ORIGINAL INQUIRY
==================================================
From: ${inquiry?.name || "Reader"} <${inquiry?.email || to}>
Category: ${inquiry?.inquiryType || "General"}
Received: ${formattedDate}

${blockquotedOriginal}


==================================================
AUTHOR'S REPLY
==================================================

${replyText}`;

  const bodyHtml = `
    <h2 style="font-size: 20px; font-weight: 600; color: #ffffff; margin: 0 0 16px 0;">Response to Your Inquiry</h2>
    <div style="background-color: #1a1b20; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <pre style="white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #d1d5db; margin: 0;">${plainTextMessage}</pre>
    </div>
    <p style="margin: 0; font-size: 14px; color: #9ca3af;">
      Best regards,<br/>
      <strong style="color: #ffffff;">Abhishek Kabra</strong>
    </p>
  `;

  return await sendEmail({
    to,
    subject: subject || `Re: ${inquiry?.subject || "Your Inquiry"}`,
    text: plainTextMessage,
    html: renderEmailWrapper({
      preheader: `Response regarding "${inquiry?.subject || "your inquiry"}"`,
      contentHtml: bodyHtml,
    }),
  });
};

/* ==========================================================================
   2. WELCOME / SUBSCRIPTION CONFIRMATION EMAIL
   ========================================================================== */
const sendWelcomeEmail = async (toEmail) => {
  const bodyHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 48px; height: 48px; background-color: rgba(204, 58, 99, 0.15); border: 1px solid rgba(204, 58, 99, 0.3); border-radius: 50%; line-height: 48px; font-size: 20px; color: #cc3a63; margin-bottom: 12px;">
        ✓
      </div>
      <h2 style="font-size: 22px; font-weight: 600; color: #ffffff; margin: 0 0 8px 0;">Subscription Confirmed</h2>
      <p style="font-size: 14px; color: #9ca3af; margin: 0;">You're officially on the list.</p>
    </div>
    <p style="margin-bottom: 16px; color: #e5e7eb;">Hi there,</p>
    <p style="margin-bottom: 16px; color: #d1d5db; line-height: 1.6;">
      Thank you for subscribing to <strong>The Dispatch</strong>. You’ll receive occasional essays, software design breakdowns, project notes, and curated reading recommendations delivered straight to your inbox.
    </p>
    <div style="background-color: #1a1b20; border-left: 3px solid #cc3a63; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; color: #9ca3af; font-style: italic;">
        "No clutter, no spam—just thoughtful notes on tech, design, and software systems."
      </p>
    </div>
  `;

  return await sendEmail({
    to: toEmail,
    subject: "Welcome to The Dispatch | Subscription Confirmed",
    html: renderEmailWrapper({
      preheader: "Welcome to The Dispatch",
      contentHtml: bodyHtml,
    }),
  });
};

/* ==========================================================================
   3. UNSUBSCRIBE CONFIRMATION EMAIL
   ========================================================================== */
const sendUnsubscribeEmail = async (toEmail) => {
  const bodyHtml = `
    <h2 style="font-size: 20px; font-weight: 600; color: #ffffff; margin: 0 0 12px 0;">Subscription Cancelled</h2>
    <p style="margin-bottom: 16px; color: #d1d5db; line-height: 1.6;">
      You have been successfully unsubscribed from <strong>The Dispatch</strong> newsletter.
    </p>
    <p style="margin-bottom: 24px; color: #9ca3af; font-size: 14px;">
      Your email address (<strong style="color: #ffffff;">${toEmail}</strong>) has been set to inactive in our system.
    </p>
  `;

  return await sendEmail({
    to: toEmail,
    subject: "Subscription Cancelled | The Dispatch",
    html: renderEmailWrapper({
      preheader: "You have been unsubscribed",
      contentHtml: bodyHtml,
    }),
  });
};

/* ==========================================================================
   4. NEW POST BROADCAST EMAIL
   ========================================================================== */
const sendNewPostBroadcast = async ({
  toEmails,
  postTitle,
  postSnippet,
  postUrl,
}) => {
  const recipients = Array.isArray(toEmails) ? toEmails.join(",") : toEmails;

  const bodyHtml = `
    <div style="margin-bottom: 12px;">
      <span style="display: inline-block; background-color: rgba(204, 58, 99, 0.15); border: 1px solid rgba(204, 58, 99, 0.3); color: #cc3a63; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 12px;">
        New Dispatch
      </span>
    </div>
    <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0 0 16px 0; line-height: 1.3;">
      ${postTitle}
    </h1>
    <p style="font-size: 15px; color: #d1d5db; line-height: 1.7; margin-bottom: 24px;">
      ${postSnippet}
    </p>
    <div style="margin: 32px 0 24px 0;">
      <a href="${postUrl || "https://2nison6.com"}" style="display: inline-block; background: linear-gradient(135deg, #cc3a63 0%, #a22b4d 100%); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(204, 58, 99, 0.35);">
        Read Article →
      </a>
    </div>
  `;

  return await sendEmail({
    to: recipients,
    subject: `New Post: ${postTitle}`,
    html: renderEmailWrapper({
      preheader: `New Post: ${postTitle}`,
      contentHtml: bodyHtml,
    }),
  });
};

module.exports = {
  sendEmail,
  sendInquiryReply,
  sendWelcomeEmail,
  sendUnsubscribeEmail,
  sendNewPostBroadcast,
};
