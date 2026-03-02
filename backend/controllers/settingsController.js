import { SettingsModel } from '../models/SettingsModel.js';
import { testSMTPConnection } from '../services/emailService.js';

const settingsModel = new SettingsModel();

export const getSettings = async (req, res) => {
  try {
    const settings = await settingsModel.read();
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { globalDailyLimit, smtp } = req.body;
    const settings = await settingsModel.read();

    if (globalDailyLimit !== undefined) {
      if (typeof globalDailyLimit !== 'number' || globalDailyLimit < 1) {
        return res.status(400).json({ error: 'globalDailyLimit must be a positive number' });
      }
      await settingsModel.updateDailyLimit(globalDailyLimit);
    }

    if (smtp !== undefined) {
      settings.smtp = {
        host: smtp.host || settings.smtp?.host || '',
        port: smtp.port || settings.smtp?.port || '587',
        secure: smtp.secure !== undefined ? smtp.secure : (settings.smtp?.secure || false),
        user: smtp.user || settings.smtp?.user || '',
        password: smtp.password || settings.smtp?.password || '',
      };
      await settingsModel.write(settings);
    }

    const updatedSettings = await settingsModel.read();
    res.json({
      message: 'Settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const testSMTP = async (req, res) => {
  try {
    const result = await testSMTPConnection();
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Test SMTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

