import { UserModel } from '../models/UserModel.js';
import { SettingsModel } from '../models/SettingsModel.js';
import { v4 as uuidv4 } from 'uuid';
import { sendOTPEmail, sendApprovalEmail } from '../services/emailService.js';
import { sendWhatsAppMessage, getWhatsAppStatus } from '../services/whatsappService.js';

const userModel = new UserModel();
const settingsModel = new SettingsModel();

/**
 * Generate a 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via both email and WhatsApp
 */
async function sendOTP(email, name, otp, phone = null) {
  const results = {
    email: { sent: false, error: null },
    whatsapp: { sent: false, error: null }
  };

  // Send OTP via email
  try {
    await sendOTPEmail(email, name, otp);
    results.email.sent = true;
  } catch (emailError) {
    console.error('Failed to send OTP email:', emailError);
    results.email.error = emailError.message;
  }

  // Send OTP via WhatsApp if phone number is provided
  if (phone) {
    try {
      // Check if WhatsApp is enabled in settings
      const settings = await settingsModel.read();
      const notificationsEnabled = settings.notifications || { emailEnabled: true, whatsappEnabled: true };
      const whatsappEnabled = notificationsEnabled.whatsappEnabled !== false;

      if (whatsappEnabled) {
        const whatsappStatus = getWhatsAppStatus();
        if (whatsappStatus.isConnected) {
          const otpMessage = `Hello ${name},\n\nYour OTP for email verification is: *${otp}*\n\nThis OTP will expire in 10 minutes.\n\nPlease do not share this OTP with anyone.`;
          await sendWhatsAppMessage(phone, otpMessage);
          results.whatsapp.sent = true;
        } else {
          console.log('WhatsApp is not connected, skipping WhatsApp OTP');
          results.whatsapp.error = 'WhatsApp is not connected';
        }
      } else {
        console.log('WhatsApp notifications are disabled in settings');
        results.whatsapp.error = 'WhatsApp notifications are disabled';
      }
    } catch (whatsappError) {
      console.error('Failed to send OTP via WhatsApp:', whatsappError);
      results.whatsapp.error = whatsappError.message;
    }
  }

  return results;
}

export const signup = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      name,
      // Contact details
      phone,
      alternatePhone,
      address,
      city,
      state,
      zipCode,
      // Location
      currentLocation,
      country,
      timezone,
      // Bio data
      dateOfBirth,
      gender,
      nationality,
      // Education
      highestEducation,
      institution,
      fieldOfStudy,
      graduationYear,
      additionalEducation
    } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Create new user with pending status and all additional fields
    const newUser = {
      id: uuidv4(),
      email,
      password, // In production, hash this password
      name,
      role: 'student',
      status: 'pending', // New users need admin approval
      emailVerified: false,
      otp: otp,
      otpExpiry: otpExpiry.toISOString(),
      score: 0,
      dailyCount: 0,
      lastAttemptDate: new Date().toISOString().split('T')[0],
      seenMcqs: [],
      createdAt: new Date().toISOString(),
      // Contact details
      phone: phone || null,
      alternatePhone: alternatePhone || null,
      address: address || null,
      city: city || null,
      state: state || null,
      zipCode: zipCode || null,
      // Location
      currentLocation: currentLocation || null,
      country: country || null,
      timezone: timezone || null,
      // Bio data
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      nationality: nationality || null,
      // Education
      highestEducation: highestEducation || null,
      institution: institution || null,
      fieldOfStudy: fieldOfStudy || null,
      graduationYear: graduationYear || null,
      additionalEducation: additionalEducation || null
    };

    await userModel.create(newUser);

    // Send OTP via both email and WhatsApp
    const otpResults = await sendOTP(email, name, otp, phone);

    // Build response message based on what was sent
    let message = 'User created successfully. ';
    if (otpResults.email.sent && otpResults.whatsapp.sent) {
      message += 'Please check your email and WhatsApp for OTP verification.';
    } else if (otpResults.email.sent) {
      message += 'Please check your email for OTP verification.';
    } else if (otpResults.whatsapp.sent) {
      message += 'Please check your WhatsApp for OTP verification.';
    } else {
      message += 'OTP could not be sent. Please use the resend option.';
    }

    // Remove password and OTP from response
    const { password: _, otp: __, ...userResponse } = newUser;

    res.status(201).json({
      message: message,
      user: userResponse,
      requiresOTP: true,
      otpSent: {
        email: otpResults.email.sent,
        whatsapp: otpResults.whatsapp.sent
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await userModel.findByEmail(email);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Skip email verification and status checks for admin users
    const isAdmin = user.role === 'admin';
    
    if (!isAdmin) {
      // Check if email is verified (only for non-admin users)
      if (user.emailVerified === false) {
        // Return user info (without password) so frontend can show OTP form
        const { password: _, ...userResponse } = user;
        return res.status(403).json({ 
          error: 'EMAIL_VERIFICATION_REQUIRED',
          message: 'Please verify your email address before logging in.',
          user: {
            email: user.email,
            name: user.name
          }
        });
      }

      // Check if user is approved (default to approved for existing users without status)
      const userStatus = user.status || 'approved';
      if (userStatus === 'pending') {
        return res.status(403).json({ error: 'Your account is pending approval. Please wait for admin approval.' });
      }

      if (userStatus === 'rejected') {
        return res.status(403).json({ error: 'Your account has been rejected. Please contact admin.' });
      }

      // Check and reset daily count if needed (only for non-admin users)
      await userModel.checkAndResetDailyCount(user.id);
    }
    
    const updatedUser = await userModel.findById(user.id);

    // Remove password from response
    const { password: _, ...userResponse } = updatedUser;

    res.json({
      message: 'Login successful',
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.findAll();
    
    // Remove passwords from response
    const safeUsers = users.map(({ password, ...user }) => user);
    
    res.json({
      users: safeUsers,
      count: safeUsers.length
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userResponse } = user;
    res.json(userResponse);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateNotificationPreferences = async (req, res) => {
  try {
    const { id } = req.params;
    const { emailNotifications, whatsappNotifications } = req.body;

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update notification preferences
    const updates = {};
    if (emailNotifications !== undefined) {
      updates.emailNotifications = emailNotifications;
    }
    if (whatsappNotifications !== undefined) {
      updates.whatsappNotifications = whatsappNotifications;
    }

    await userModel.update(id, updates);
    const updatedUser = await userModel.findById(id);

    res.json({
      message: 'Notification preferences updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating password, id, role, or status through this endpoint
    // Status should only be changed through approve/reject endpoints
    delete updates.password;
    delete updates.id;
    delete updates.role;
    delete updates.status;

    const updatedUser = await userModel.update(id, updates);

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userResponse } = updatedUser;
    res.json({
      message: 'User updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userModel.delete(id);

    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const dailyLimit = await settingsModel.getDailyLimit();
    const remaining = Math.max(0, dailyLimit - (user.dailyCount || 0));

    const { password, ...userResponse } = user;

    res.json({
      ...userResponse,
      dailyLimit,
      remainingToday: remaining
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await userModel.update(id, { status: 'approved' });

    // Send approval email
    try {
      await sendApprovalEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Continue even if email fails
    }

    const updatedUser = await userModel.findById(id);
    const { password, ...userResponse } = updatedUser;

    res.json({
      message: 'User approved successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const user = await userModel.findByEmail(email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Check if OTP is expired
    const now = new Date();
    const otpExpiry = new Date(user.otpExpiry);
    if (now > otpExpiry) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Verify email and clear OTP
    await userModel.update(user.id, {
      emailVerified: true,
      otp: null,
      otpExpiry: null
    });

    res.json({
      message: 'Email verified successfully',
      emailVerified: true
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await userModel.findByEmail(email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await userModel.update(user.id, {
      otp: otp,
      otpExpiry: otpExpiry.toISOString()
    });

    // Send OTP via both email and WhatsApp
    const phone = user.phone || user.phoneNumber || user.mobile || null;
    const otpResults = await sendOTP(email, user.name, otp, phone);

    // Build response message based on what was sent
    let message = '';
    if (otpResults.email.sent && otpResults.whatsapp.sent) {
      message = 'OTP has been resent to your email and WhatsApp.';
    } else if (otpResults.email.sent) {
      message = 'OTP has been resent to your email.';
    } else if (otpResults.whatsapp.sent) {
      message = 'OTP has been resent to your WhatsApp.';
    } else {
      return res.status(500).json({ 
        error: 'Failed to send OTP. Please check your email and WhatsApp settings.',
        details: {
          email: otpResults.email.error,
          whatsapp: otpResults.whatsapp.error
        }
      });
    }

    res.json({
      message: message,
      otpSent: {
        email: otpResults.email.sent,
        whatsapp: otpResults.whatsapp.sent
      }
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await userModel.update(id, { status: 'rejected' });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userResponse } = updatedUser;
    res.json({
      message: 'User rejected successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

