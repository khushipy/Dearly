// server/services/email.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendInviteEmail = async (email, token) => {
  const acceptUrl = `${process.env.CLIENT_URL}/invite/accept/${token}`;

  const mailOptions = {
    from: `"Secure Notes" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "You have been invited to share secure notes",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Secure Note Sharing Invitation</h2>
        <p>You've been invited to share secure notes. Click the button below to accept the invitation:</p>
        <a href="${acceptUrl}" 
           style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; 
                  color: white; text-decoration: none; border-radius: 4px; margin: 15px 0;">
          Accept Invitation
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p>${acceptUrl}</p>
        <p>This invitation will expire in 7 days.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
