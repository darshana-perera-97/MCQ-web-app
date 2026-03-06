import {
  connectWhatsApp as connectWhatsAppService,
  getWhatsAppStatus as getWhatsAppStatusService,
  disconnectWhatsApp as disconnectWhatsAppService,
  sendWhatsAppMessage
} from '../services/whatsappService.js';

/**
 * Get WhatsApp connection status and QR code
 */
export const getWhatsAppStatus = async (req, res) => {
  try {
    const status = getWhatsAppStatusService();
    res.json(status);
  } catch (error) {
    console.error('Get WhatsApp status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Connect to WhatsApp (initialize and get QR code)
 */
export const connectWhatsApp = async (req, res) => {
  try {
    const result = await connectWhatsAppService();
    res.json(result);
  } catch (error) {
    console.error('Connect WhatsApp error:', error);
    res.status(500).json({ 
      error: 'Failed to connect WhatsApp',
      message: error.message 
    });
  }
};

/**
 * Disconnect WhatsApp
 */
export const disconnectWhatsApp = async (req, res) => {
  try {
    const { clearSession } = req.body || {};
    const result = await disconnectWhatsAppService({ clearSession: !!clearSession });
    res.json(result);
  } catch (error) {
    console.error('Disconnect WhatsApp error:', error);
    res.status(500).json({ 
      error: 'Failed to disconnect WhatsApp',
      message: error.message 
    });
  }
};

/**
 * Send WhatsApp message
 */
export const sendMessage = async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        error: 'Phone number and message are required' 
      });
    }

    const result = await sendWhatsAppMessage(phoneNumber, message);
    res.json(result);
  } catch (error) {
    console.error('Send WhatsApp message error:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      message: error.message 
    });
  }
};

