import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { BaseModel } from '../models/BaseModel.js';
import { UserModel } from '../models/UserModel.js';
import { sendNotificationEmail } from '../services/emailService.js';
import { sendWhatsAppMessageToMultiple, getWhatsAppStatus } from '../services/whatsappService.js';
import { BACKEND_URL, PLATFORM_URL } from '../config/constants.js';
import { SettingsModel } from '../models/SettingsModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NotificationModel extends BaseModel {
  constructor() {
    super('notifications.json');
  }
}

const notificationModel = new NotificationModel();
const userModel = new UserModel();
const settingsModel = new SettingsModel();

export const sendNotification = async (req, res) => {
  try {
    const { title, message } = req.body;
    let imagePath = null;

    // Handle image upload if present
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const notification = {
      id: Date.now().toString(),
      title,
      message,
      imagePath,
      createdAt: new Date().toISOString(),
      sentTo: 'all' // Could be extended to specific users
    };

    await notificationModel.create(notification);

    // Get all approved users
    const allUsers = await userModel.findAll();
    const approvedUsers = allUsers.filter(
      user => (user.role === 'student' || !user.role) && 
              (user.status === 'approved' || !user.status)
    );

    // Check notification settings
    const settings = await settingsModel.read();
    const notificationsEnabled = settings.notifications || { emailEnabled: true, whatsappEnabled: true };
    const emailEnabled = notificationsEnabled.emailEnabled !== false;
    const whatsappEnabled = notificationsEnabled.whatsappEnabled !== false;

    // Prepare notification content
    const notificationText = `*${title}*\n\n${message}\n\n🌐 Platform: ${PLATFORM_URL}`;
    const imageUrl = imagePath ? `${BACKEND_URL}${imagePath}` : null;

    // Send notifications via email and WhatsApp
    const emailResults = { sent: 0, failed: 0, errors: [] };
    const whatsappResults = { sent: 0, failed: 0, errors: [] };

    // Send emails to all approved users (if enabled)
    if (emailEnabled) {
      for (const user of approvedUsers) {
        // Check user's email notification preference
        if (user.email && user.emailNotifications !== false) {
          try {
            await sendNotificationEmail(
              user.email,
              user.name || 'Student',
              title,
              message,
              imageUrl
            );
            emailResults.sent++;
          } catch (error) {
            console.error(`Failed to send email to ${user.email}:`, error);
            emailResults.failed++;
            emailResults.errors.push({
              email: user.email,
              error: error.message
            });
          }
        }
      }
    } else {
      console.log('Email notifications are disabled in settings');
    }

    // Send WhatsApp messages to all approved users (if WhatsApp is enabled and connected)
    if (whatsappEnabled) {
      const whatsappStatus = getWhatsAppStatus();
      if (whatsappStatus.isConnected) {
        // Get phone numbers from users (check for phone, phoneNumber, or mobile fields)
        // Also check user's WhatsApp notification preference
        const usersWithWhatsApp = approvedUsers.filter(
          user => (user.phone || user.phoneNumber || user.mobile) && 
                  user.whatsappNotifications !== false
        );
        const phoneNumbers = usersWithWhatsApp
          .map(user => user.phone || user.phoneNumber || user.mobile)
          .filter(phone => phone && phone.trim() !== '');

        if (phoneNumbers.length > 0) {
          try {
            const whatsappResult = await sendWhatsAppMessageToMultiple(
              phoneNumbers,
              notificationText
            );
            whatsappResults.sent = whatsappResult.sent;
            whatsappResults.failed = whatsappResult.failed;
            whatsappResults.errors = whatsappResult.errors || [];
          } catch (error) {
            console.error('Failed to send WhatsApp messages:', error);
            whatsappResults.failed = phoneNumbers.length;
            whatsappResults.errors.push({ error: error.message });
          }
        } else {
          console.log('No phone numbers found in user profiles for WhatsApp notifications');
          console.log('Note: Users need to have a "phone", "phoneNumber", or "mobile" field to receive WhatsApp notifications');
        }
      } else {
        console.log('WhatsApp is not connected, skipping WhatsApp notifications');
      }
    } else {
      console.log('WhatsApp notifications are disabled in settings');
    }

    res.status(201).json({
      message: 'Notification sent successfully',
      notification,
      delivery: {
        email: {
          sent: emailResults.sent,
          failed: emailResults.failed,
          total: approvedUsers.length
        },
        whatsapp: {
          sent: whatsappResults.sent,
          failed: whatsappResults.failed,
          connected: whatsappStatus.isConnected
        }
      }
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await notificationModel.findAll();
    
    // Sort by date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await notificationModel.findById(id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Delete associated image if exists
    if (notification.imagePath) {
      const imageFullPath = path.join(__dirname, '..', notification.imagePath);
      try {
        await fs.unlink(imageFullPath);
      } catch (error) {
        console.error('Error deleting image:', error);
        // Continue even if image deletion fails
      }
    }

    await notificationModel.delete(id);

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

