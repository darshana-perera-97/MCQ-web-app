import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { BaseModel } from '../models/BaseModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NotificationModel extends BaseModel {
  constructor() {
    super('notifications.json');
  }
}

const notificationModel = new NotificationModel();

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

    res.status(201).json({
      message: 'Notification sent successfully',
      notification
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

