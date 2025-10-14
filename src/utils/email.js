import nodemailer from 'nodemailer';
import getEnvVar from './getEnvVar.js';
import createError from 'http-errors';

const createTransporter = () => {
  const host = getEnvVar('SMTP_HOST');
  const port = parseInt(getEnvVar('SMTP_PORT'));
  const user = getEnvVar('SMTP_USER');
  const password = getEnvVar('SMTP_PASSWORD');

  return nodemailer.createTransport({
    host: host,
    port: port,
    secure: false,
    auth: {
      user: user,
      pass: password,
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false,
    },
  });
};

export const sendResetPasswordEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();
    await transporter.verify();

    const resetUrl = `${getEnvVar(
      'APP_DOMAIN',
    )}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: getEnvVar('SMTP_FROM'),
      to: email,
      subject: 'Password Reset Request - Your App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested to reset your password for Your App account.</p>
          <p>Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Reset Password
          </a>
          <p><strong>This link will expire in 10 minutes.</strong></p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated message from Your App.</p>
        </div>
      `,
      text: `Password Reset Request\n\nPlease use the following link to reset your password: ${resetUrl}\n\nThis link expires in 10 minutes.`,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    throw createError(500, 'Failed to send the email, please try again later.');
  }
};
