import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { MaterialModel } from '../models/MaterialModel.js';
import { UserModel } from '../models/UserModel.js';
import { sendNotificationEmail } from '../services/emailService.js';
import { sendWhatsAppMessageToMultiple, getWhatsAppStatus } from '../services/whatsappService.js';
import { BACKEND_URL, PLATFORM_URL } from '../config/constants.js';
import { SettingsModel } from '../models/SettingsModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const materialModel = new MaterialModel();
const userModel = new UserModel();
const settingsModel = new SettingsModel();

/**
 * Upload a new material (PDF)
 */
export const uploadMaterial = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const filePath = `/data/files/${req.file.filename}`;
    const fileSize = req.file.size;

    const material = {
      id: `MAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: title.trim(),
      description: description?.trim() || '',
      category: category?.trim() || 'General',
      filePath,
      fileName: req.file.originalname,
      fileSize,
      uploadedAt: new Date().toISOString(),
      uploadedBy: req.isAdmin ? 'admin' : 'unknown'
    };

    await materialModel.create(material);

    // Send notifications to all approved students
    const emailResults = { sent: 0, failed: 0 };
    const whatsappResults = { sent: 0, failed: 0 };

    try {
      // Check notification settings
      const settings = await settingsModel.read();
      const notificationsEnabled = settings.notifications || { emailEnabled: true, whatsappEnabled: true };
      const emailEnabled = notificationsEnabled.emailEnabled !== false;
      const whatsappEnabled = notificationsEnabled.whatsappEnabled !== false;

      if (!emailEnabled && !whatsappEnabled) {
        console.log('Notifications are disabled in settings');
      } else {
        const allUsers = await userModel.findAll();
        const approvedUsers = allUsers.filter(
          user => (user.role === 'student' || !user.role) && 
                  (user.status === 'approved' || !user.status)
        );

        const notificationTitle = 'New Study Material Available';
        const notificationMessage = `A new study material "${title}" has been uploaded. Check the Materials section to view and download it.`;
        const platformLink = `${PLATFORM_URL}/student/materials`;
        const notificationText = `*${notificationTitle}*\n\n${notificationMessage}\n\n📚 Access Materials: ${platformLink}`;

        // Send emails if enabled
        if (emailEnabled) {
          for (const user of approvedUsers) {
            // Check user's email notification preference
            if (user.email && user.emailNotifications !== false) {
              try {
                await sendNotificationEmail(
                  user.email,
                  user.name || 'Student',
                  notificationTitle,
                  notificationMessage
                );
                emailResults.sent++;
              } catch (error) {
                console.error(`Failed to send email to ${user.email}:`, error);
                emailResults.failed++;
              }
            }
          }
        }

        // Send WhatsApp messages if enabled
        if (whatsappEnabled) {
          const whatsappStatus = getWhatsAppStatus();
          if (whatsappStatus.isConnected) {
            // Filter users who have WhatsApp enabled in their preferences
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
              } catch (error) {
                console.error('Failed to send WhatsApp messages:', error);
                whatsappResults.failed = phoneNumbers.length;
              }
            }
          }
        }

        console.log(`Notifications sent - Email: ${emailResults.sent}/${approvedUsers.length} (enabled: ${emailEnabled}), WhatsApp: ${whatsappResults.sent} (enabled: ${whatsappEnabled})`);
      }
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
      // Don't fail the upload if notifications fail
    }

    res.status(201).json({
      message: 'Material uploaded successfully',
      material,
      notifications: {
        email: { sent: emailResults.sent, failed: emailResults.failed },
        whatsapp: { sent: whatsappResults.sent, failed: whatsappResults.failed }
      }
    });
  } catch (error) {
    console.error('Upload material error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all materials
 */
export const getAllMaterials = async (req, res) => {
  try {
    const materials = await materialModel.findAll();
    
    // Sort by date (newest first)
    materials.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    
    res.json({
      materials,
      count: materials.length
    });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get material by ID
 */
export const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await materialModel.findById(id);

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json(material);
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Download material
 */
export const downloadMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await materialModel.findById(id);

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const filePath = path.join(__dirname, '..', material.filePath);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, material.fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to download file' });
        }
      }
    });
  } catch (error) {
    console.error('Download material error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete material
 */
export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await materialModel.findById(id);

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Delete file
    if (material.filePath) {
      const fileFullPath = path.join(__dirname, '..', material.filePath);
      try {
        await fs.unlink(fileFullPath);
      } catch (error) {
        console.error('Error deleting file:', error);
        // Continue even if file deletion fails
      }
    }

    await materialModel.delete(id);

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

