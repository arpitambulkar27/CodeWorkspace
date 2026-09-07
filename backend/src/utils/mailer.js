// backend/src/utils/mailer.js
const nodemailer = require("nodemailer");

/**
 * Sends a 6-digit OTP verification email to the recipient.
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - Plaintext 6-digit OTP code (only used for sending email)
 */
async function sendOTP(toEmail, otp) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn(
      `⚠️ [Mailer Warning] EMAIL_USER or EMAIL_APP_PASSWORD is not set in backend/.env.`
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user,
      pass: pass,
    },
  });

  const mailOptions = {
    from: `"CodeForge Security" <${user}>`,
    to: toEmail,
    subject: "Your CodeForge Verification Code",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 30px; background-color: #0d1117; color: #f0f6fc; border-radius: 16px; border: 1px solid #30363d;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #58a6ff; margin: 0 0 6px 0; font-size: 24px; font-weight: 800;">CodeForge</h2>
          <p style="color: #8b949e; margin: 0; font-size: 13px;">Cloud IDE & Technical Workspaces</p>
        </div>
        <div style="background-color: #161b22; border: 1px solid #21262d; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="color: #c9d1d9; margin: 0 0 14px 0; font-size: 14px; font-weight: 600;">Your 6-Digit Email Verification Code:</p>
          <div style="font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #3fb950; background-color: #0d1117; padding: 14px 20px; border-radius: 10px; display: inline-block; border: 1px solid #30363d;">
            ${otp}
          </div>
          <p style="color: #8b949e; margin: 16px 0 0 0; font-size: 12px;">This code expires in 5 minutes.</p>
        </div>
        <p style="color: #8b949e; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
          If you did not request this email verification, please ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendOTP };
