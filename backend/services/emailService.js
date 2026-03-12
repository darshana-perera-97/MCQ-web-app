import nodemailer from 'nodemailer';
import { SettingsModel } from '../models/SettingsModel.js';

const settingsModel = new SettingsModel();

/**
 * Get email transporter from settings
 */
async function getTransporter() {
  const settings = await settingsModel.read();
  const smtp = settings.smtp || {};

  if (!smtp.host || !smtp.port || !smtp.user || !smtp.password) {
    throw new Error('SMTP settings not configured. Please configure in admin settings.');
  }

  return nodemailer.createTransport({
    host: smtp.host,
    port: parseInt(smtp.port),
    secure: smtp.secure === true || smtp.port === '465', // true for 465, false for other ports
    auth: {
      user: smtp.user,
      pass: smtp.password,
    },
  });
}

/**
 * Email template for OTP verification
 */
function getOTPEmailTemplate(name, otp) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 12px; margin-bottom: 16px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: white;">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
                </svg>
              </div>
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 600; margin: 0; line-height: 1.2;">Verify Your Email</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello <strong>${name}</strong>,
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Thank you for creating an account with us! To complete your registration, please verify your email address using the OTP code below:
              </p>
              
              <!-- OTP Box -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; text-align: center; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                      <p style="color: #ffffff; font-size: 14px; font-weight: 500; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                      <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 20px; display: inline-block;">
                        <p style="color: #ffffff; font-size: 36px; font-weight: 700; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</p>
                      </div>
                      <p style="color: rgba(255, 255, 255, 0.9); font-size: 12px; margin: 16px 0 0 0;">This code will expire in 10 minutes</p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                If you didn't create an account, please ignore this email or contact our support team.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0;">
                This is an automated email. Please do not reply to this message.<br>
                © ${new Date().getFullYear()} Learning Management System. All rights reserved.
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
}

/**
 * Email template for account approval
 */
function getApprovalEmailTemplate(name) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Approved</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); padding: 40px 30px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 12px; margin-bottom: 16px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: white;">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                </svg>
              </div>
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 600; margin: 0; line-height: 1.2;">Account Approved!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello <strong>${name}</strong>,
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Great news! Your account has been approved by our administrator. You can now log in and start using the Learning Management System.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="#" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                      Log In to Your Account
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                If you have any questions or need assistance, please don't hesitate to contact our support team.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0;">
                This is an automated email. Please do not reply to this message.<br>
                © ${new Date().getFullYear()} Learning Management System. All rights reserved.
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
}

/**
 * Send OTP verification email
 */
export async function sendOTPEmail(email, name, otp) {
  try {
    const transporter = await getTransporter();
    const settings = await settingsModel.read();
    const smtp = settings.smtp || {};

    const mailOptions = {
      from: `"Learning Management System" <${smtp.user}>`,
      to: email,
      subject: 'Verify Your Email Address - OTP Code',
      html: getOTPEmailTemplate(name, otp),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
}

/**
 * Email template for "account created - next steps to activate"
 */
function getAccountCreatedNextStepsEmailTemplate(name) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Created - Next Steps</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 600; margin: 0;">Step 1 Completed</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 12px 0 0 0;">Your account has been created successfully</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hello <strong>${name}</strong>,</p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">To activate your account and get full access, please complete <strong>Step 2</strong> and <strong>Step 3</strong> below.</p>
              
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <p style="color: #166534; font-size: 15px; font-weight: 600; margin: 0 0 8px 0;">Step 2 – Activate</p>
                <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0;">Complete a one-time payment of LKR 399 to one of our bank accounts:</p>
                <ul style="color: #374151; font-size: 14px; line-height: 1.8; margin: 12px 0 0 0; padding-left: 20px;">
                  <li><strong>Bank of Ceylon</strong> — Account: MCQ Exam Registration, No: 1234567890, Branch: Colombo Main</li>
                  <li><strong>Commercial Bank</strong> — Account: NexGen AI Education, No: 9876543210, Branch: Kandy</li>
                </ul>
              </div>
              
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px;">
                <p style="color: #1e40af; font-size: 15px; font-weight: 600; margin: 0 0 8px 0;">Step 3 – Get Access</p>
                <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0;">Send your payment slip (screenshot or photo) to our WhatsApp <strong>+94 77 123 4567</strong> or Email <strong>exam-admin@nexgenai.asia</strong>. Include the name and email you used to register. Your account will be activated within 2–3 hours after verification.</p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">If you have any questions, contact us at exam-admin@nexgenai.asia.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Learning Management System.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Send "account created - next steps to activate" email
 */
export async function sendAccountCreatedNextStepsEmail(email, name) {
  try {
    const transporter = await getTransporter();
    const settings = await settingsModel.read();
    const smtp = settings.smtp || {};

    const mailOptions = {
      from: `"Learning Management System" <${smtp.user}>`,
      to: email,
      subject: 'Account Created – Complete Step 2 & 3 to Activate',
      html: getAccountCreatedNextStepsEmailTemplate(name),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Account created next-steps email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending account created next-steps email:', error);
    throw error;
  }
}

/**
 * Send account approval email
 */
export async function sendApprovalEmail(email, name) {
  try {
    const transporter = await getTransporter();
    const settings = await settingsModel.read();
    const smtp = settings.smtp || {};

    const mailOptions = {
      from: `"Learning Management System" <${smtp.user}>`,
      to: email,
      subject: 'Your Account Has Been Approved',
      html: getApprovalEmailTemplate(name),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Approval email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending approval email:', error);
    throw error;
  }
}

/**
 * Test SMTP connection
 */
export async function testSMTPConnection() {
  try {
    const transporter = await getTransporter();
    await transporter.verify();
    return { success: true, message: 'SMTP connection successful' };
  } catch (error) {
    console.error('SMTP connection test failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Email template for notifications
 */
function getNotificationEmailTemplate(title, message, imageUrl = null) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 600; margin: 0; line-height: 1.2;">${title}</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${imageUrl ? `<img src="${imageUrl}" alt="Notification Image" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;" />` : ''}
              <div style="color: #374151; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0;">
                This is an automated notification from Learning Management System.<br>
                © ${new Date().getFullYear()} Learning Management System. All rights reserved.
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
}

/**
 * Send notification email to a user
 */
export async function sendNotificationEmail(email, name, title, message, imageUrl = null) {
  try {
    const transporter = await getTransporter();
    const settings = await settingsModel.read();
    const smtp = settings.smtp || {};

    const mailOptions = {
      from: `"Learning Management System" <${smtp.user}>`,
      to: email,
      subject: title,
      html: getNotificationEmailTemplate(title, message, imageUrl),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Notification email sent to ${email}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Error sending notification email to ${email}:`, error);
    throw error;
  }
}

