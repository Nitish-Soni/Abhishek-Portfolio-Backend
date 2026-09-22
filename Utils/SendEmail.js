const { Resend } = require("resend");

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Universal Email Dispatcher via Resend HTTP API
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const fromAddress =
      process.env.EMAIL_FROM || "Abhishek Kabra <nitish.soni@2nison6.com>";

    const response = await resend.emails.send({
      from: fromAddress,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: html || text,
      text,
    });

    if (response.error) {
      console.error("❌ Resend API Error:", response.error);
      throw new Error(response.error.message);
    }

    console.log("✉️ Email sent via Resend successfully! ID:", response.data.id);
    return response.data;
  } catch (error) {
    console.error("❌ Email Dispatch Failure Details:", error.message);
    throw error;
  }
};

/* ==========================================================================
   GLOBAL EMAIL WRAPPER (DARK GLASS / LITERARY BRANDED CARD)
   ========================================================================== */
const renderEmailWrapper = ({ preheader, contentHtml }) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>The Dispatch</title>
      <style type="text/css">
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #0b0c0e; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0b0c0e; font-family: -apple-system, BlinkMacSystemFont, 'Georgia', 'Times New Roman', serif;">
      <div style="display: none; font-size: 1px; color: #0b0c0e; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        ${preheader || "Correspondence from Abhishek Kabra"}
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
                        <span style="font-size: 12px; font-weight: 700; letter-spacing: 2px; color: #cc3a63; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">ABHISHEK KABRA</span>
                        <div style="font-size: 18px; font-weight: 600; color: #ffffff; margin-top: 2px; font-family: 'Georgia', serif;">The Dispatch</div>
                      </td>
                      <td align="right" style="font-size: 12px; color: #6b7280; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">2nison6.com</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Body Content -->
              <tr>
                <td style="padding: 32px; color: #e5e7eb; font-size: 15px; line-height: 1.7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                  ${contentHtml}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px 32px; background-color: #0e0f12; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                  <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280;">
                    Written & Published by <a href="https://2nison6.com" style="color: #9ca3af; text-decoration: underline;">Abhishek Kabra</a>
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #4b5563; line-height: 1.4;">
                    You are receiving this correspondence regarding your inquiry or reader subscription on 2nison6.com.
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
   1. INQUIRY REPLY EMAIL (AUTHORIAL CORRESPONDENCE)
   ========================================================================== */
const sendReplyEmail = async (params) => {
  // Support both object signatures: destructured direct parameters or nested inquiry object
  const to = params.to || params.inquiry?.email;
  const replyText = params.replyText || "";
  const recipientName =
    params.recipientName || params.inquiry?.name || "Reader";
  const originalSubject =
    params.originalSubject || params.inquiry?.subject || "Your Inquiry";
  const inquiryType =
    params.inquiryType || params.inquiry?.inquiryType || "General Inquiry";

  const plainTextMessage = `Dear ${recipientName},

${replyText}

---
In response to your message regarding "${originalSubject}" (${inquiryType}).

Warm regards,
Abhishek Kabra
https://2nison6.com`;

  const bodyHtml = `
    <p style="margin-bottom: 20px; color: #e5e7eb; font-size: 16px;">Dear ${recipientName},</p>
    
    <div style="color: #f3f4f6; font-size: 15px; line-height: 1.75; white-space: pre-wrap; margin-bottom: 32px;">${replyText}</div>

    <div style="background-color: #1a1b20; border-left: 3px solid #cc3a63; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 28px 0;">
      <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; color: #cc3a63; text-transform: uppercase; letter-spacing: 1px;">Regarding Your Inquiry</p>
      <p style="margin: 0; font-size: 13px; color: #9ca3af; font-style: italic;">
        "${originalSubject}" &bull; ${inquiryType}
      </p>
    </div>

    <p style="margin: 32px 0 0 0; font-size: 15px; color: #9ca3af;">
      Warm regards,<br/>
      <strong style="color: #ffffff; font-size: 16px; font-family: 'Georgia', serif;">Abhishek Kabra</strong>
    </p>
  `;

  return await sendEmail({
    to,
    subject:
      "Abhishek Kabra | " +
      (params.subject || `${originalSubject}`) +
      " | " +
      inquiryType,
    text: plainTextMessage,
    html: renderEmailWrapper({
      preheader: `${originalSubject}`,
      contentHtml: bodyHtml,
    }),
  });
};

/* ==========================================================================
   2. WELCOME / SUBSCRIPTION CONFIRMATION EMAIL
   ========================================================================== */
const sendWelcomeEmail = async (toEmail) => {
  const bodyHtml = `
    <div style="text-align: center; margin-bottom: 28px;">
      <div style="display: inline-block; width: 48px; height: 48px; background-color: rgba(204, 58, 99, 0.15); border: 1px solid rgba(204, 58, 99, 0.3); border-radius: 50%; line-height: 48px; font-size: 20px; color: #cc3a63; margin-bottom: 12px;">
        ✓
      </div>
      <h2 style="font-size: 22px; font-weight: 600; color: #ffffff; margin: 0 0 8px 0; font-family: 'Georgia', serif;">Welcome to The Dispatch</h2>
      <p style="font-size: 14px; color: #9ca3af; margin: 0;">Your reader subscription is confirmed.</p>
    </div>

    <p style="margin-bottom: 16px; color: #e5e7eb;">Greetings,</p>
    <p style="margin-bottom: 16px; color: #d1d5db; line-height: 1.7;">
      Thank you for subscribing to <strong>The Dispatch</strong>. You will receive occasional essays, literary notes, commentary on culture, and curated reading recommendations directly in your inbox.
    </p>
    
    <div style="background-color: #1a1b20; border-left: 3px solid #cc3a63; padding: 18px 20px; border-radius: 0 8px 8px 0; margin: 28px 0;">
      <p style="margin: 0; font-size: 14px; color: #d1d5db; font-style: italic; line-height: 1.6;">
        "Exploring the intersection of memory, culture, philosophy, and the modern experience."
      </p>
    </div>

    <p style="margin: 0; font-size: 14px; color: #9ca3af;">
      Warmly,<br/>
      <strong style="color: #ffffff; font-family: 'Georgia', serif;">Abhishek Kabra</strong>
    </p>
  `;

  return await sendEmail({
    to: toEmail,
    subject:
      "Welcome to The Dispatch | Abhishek Kabra's Reader Subscription Confirmed",
    html: renderEmailWrapper({
      preheader: "Welcome to The Dispatch by Abhishek Kabra",
      contentHtml: bodyHtml,
    }),
  });
};

/* ==========================================================================
   3. UNSUBSCRIBE CONFIRMATION EMAIL
   ========================================================================== */
const sendUnsubscribeEmail = async (toEmail) => {
  const bodyHtml = `
    <h2 style="font-size: 20px; font-weight: 600; color: #ffffff; margin: 0 0 12px 0; font-family: 'Georgia', serif;">Subscription Cancelled</h2>
    <p style="margin-bottom: 16px; color: #d1d5db; line-height: 1.7;">
      You have been unsubscribed from <strong>The Dispatch</strong>. You will no longer receive essay dispatches or publication updates at this address.
    </p>
    <p style="margin-bottom: 24px; color: #9ca3af; font-size: 14px;">
      Subscriber address (<strong style="color: #ffffff;">${toEmail}</strong>) has been removed from the active mailing list.
    </p>
    <p style="margin: 0; font-size: 14px; color: #9ca3af;">
      Thank you for reading,<br/>
      <strong style="color: #ffffff; font-family: 'Georgia', serif;">Abhishek Kabra</strong>
    </p>
  `;

  return await sendEmail({
    to: toEmail,
    subject: "Subscription Cancelled | Abhishek Kabra - The Dispatch",
    html: renderEmailWrapper({
      preheader:
        "You have been unsubscribed from The Dispatch by Abhishek Kabra",
      contentHtml: bodyHtml,
    }),
  });
};

/* ==========================================================================
   4. NEW ESSAY / BROADCAST EMAIL
   ========================================================================== */
const sendNewPostBroadcast = async ({
  toEmails,
  postTitle,
  postSnippet,
  postUrl,
}) => {
  const bodyHtml = `
    <div style="margin-bottom: 12px;">
      <span style="display: inline-block; background-color: rgba(204, 58, 99, 0.15); border: 1px solid rgba(204, 58, 99, 0.3); color: #cc3a63; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 12px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
        New Dispatch
      </span>
    </div>
    <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0 0 16px 0; line-height: 1.3; font-family: 'Georgia', serif;">
      ${postTitle}
    </h1>
    <p style="font-size: 15px; color: #d1d5db; line-height: 1.75; margin-bottom: 28px;">
      ${postSnippet}
    </p>
    <div style="margin: 32px 0 28px 0;">
      <a href="${postUrl || "https://2nison6.com"}" style="display: inline-block; background: linear-gradient(135deg, #cc3a63 0%, #a22b4d 100%); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(204, 58, 99, 0.35); font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
        Read Essay →
      </a>
    </div>
  `;

  return await sendEmail({
    to: toEmails,
    subject: `New Dispatch: ${postTitle}`,
    html: renderEmailWrapper({
      preheader: `New Essay: ${postTitle}`,
      contentHtml: bodyHtml,
    }),
  });
};

module.exports = {
  sendEmail,
  sendReplyEmail,
  sendWelcomeEmail,
  sendUnsubscribeEmail,
  sendNewPostBroadcast,
};
