import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import QRCode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let whatsappClient = null;
let qrCodeData = null;
let isConnecting = false;
let connectionStatus = 'disconnected'; // disconnected, connecting, connected, failed

/**
 * Initialize WhatsApp client
 */
export const initializeWhatsApp = () => {
  if (whatsappClient) {
    return whatsappClient;
  }

  try {
    whatsappClient = new Client({
      authStrategy: new LocalAuth({
        dataPath: path.join(__dirname, '../.wwebjs_auth')
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    // QR code event
    whatsappClient.on('qr', async (qr) => {
      console.log('QR Code received');
      try {
        qrCodeData = await QRCode.toDataURL(qr);
        connectionStatus = 'connecting';
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    });

    // Ready event
    whatsappClient.on('ready', () => {
      console.log('WhatsApp client is ready!');
      qrCodeData = null;
      connectionStatus = 'connected';
      isConnecting = false;
    });

    // Authentication event
    whatsappClient.on('authenticated', () => {
      console.log('WhatsApp client authenticated');
      connectionStatus = 'connected';
    });

    // Authentication failure event
    whatsappClient.on('auth_failure', (msg) => {
      console.error('WhatsApp authentication failure:', msg);
      connectionStatus = 'failed';
      isConnecting = false;
      qrCodeData = null;
    });

    // Disconnected event
    whatsappClient.on('disconnected', (reason) => {
      console.log('WhatsApp client disconnected:', reason);
      connectionStatus = 'disconnected';
      qrCodeData = null;
      whatsappClient = null;
    });

    return whatsappClient;
  } catch (error) {
    console.error('Error initializing WhatsApp client:', error);
    connectionStatus = 'failed';
    throw error;
  }
};

/**
 * Connect to WhatsApp
 */
export const connectWhatsApp = async () => {
  if (isConnecting) {
    return { status: connectionStatus, qrCode: qrCodeData };
  }

  if (whatsappClient && connectionStatus === 'connected') {
    return { status: connectionStatus, qrCode: null };
  }

  try {
    isConnecting = true;
    connectionStatus = 'connecting';
    
    if (!whatsappClient) {
      initializeWhatsApp();
    }

    await whatsappClient.initialize();
    
    return { status: connectionStatus, qrCode: qrCodeData };
  } catch (error) {
    console.error('Error connecting WhatsApp:', error);
    connectionStatus = 'failed';
    isConnecting = false;
    throw error;
  }
};

/**
 * Get WhatsApp connection status
 */
export const getWhatsAppStatus = () => {
  return {
    status: connectionStatus,
    qrCode: qrCodeData,
    isConnected: connectionStatus === 'connected',
    isConnecting: isConnecting
  };
};

/**
 * Disconnect WhatsApp
 */
export const disconnectWhatsApp = async () => {
  try {
    if (whatsappClient) {
      await whatsappClient.logout();
      await whatsappClient.destroy();
      whatsappClient = null;
      qrCodeData = null;
      connectionStatus = 'disconnected';
      isConnecting = false;
      return { success: true, message: 'WhatsApp disconnected successfully' };
    }
    return { success: true, message: 'WhatsApp was not connected' };
  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error);
    throw error;
  }
};

/**
 * Send WhatsApp message
 */
export const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    if (!whatsappClient || connectionStatus !== 'connected') {
      throw new Error('WhatsApp is not connected');
    }

    // Format phone number (remove + and spaces, add country code if needed)
    const formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
    const chatId = formattedNumber.includes('@c.us') 
      ? formattedNumber 
      : `${formattedNumber}@c.us`;

    await whatsappClient.sendMessage(chatId, message);
    return { success: true, message: 'Message sent successfully' };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
};

/**
 * Get WhatsApp client instance
 */
export const getWhatsAppClient = () => {
  return whatsappClient;
};

/**
 * Send WhatsApp message to multiple phone numbers
 */
export const sendWhatsAppMessageToMultiple = async (phoneNumbers, message) => {
  const results = [];
  const errors = [];

  if (!whatsappClient || connectionStatus !== 'connected') {
    throw new Error('WhatsApp is not connected');
  }

  for (const phoneNumber of phoneNumbers) {
    try {
      // Format phone number (remove + and spaces, add country code if needed)
      const formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
      const chatId = formattedNumber.includes('@c.us') 
        ? formattedNumber 
        : `${formattedNumber}@c.us`;

      await whatsappClient.sendMessage(chatId, message);
      results.push({ phoneNumber, success: true });
      console.log(`WhatsApp message sent to ${phoneNumber}`);
    } catch (error) {
      console.error(`Error sending WhatsApp message to ${phoneNumber}:`, error);
      errors.push({ phoneNumber, error: error.message });
      results.push({ phoneNumber, success: false, error: error.message });
    }
  }

  return {
    success: errors.length === 0,
    sent: results.filter(r => r.success).length,
    failed: errors.length,
    results,
    errors
  };
};

