import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import QRCode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let whatsappClient = null;
let qrCodeData = null;
let isConnecting = false;
let connectionStatus = 'disconnected'; // disconnected, connecting, connected, failed

const AUTH_PATH = path.join(__dirname, '../.wwebjs_auth');

const safeRmAuthDir = async () => {
  try {
    await fs.rm(AUTH_PATH, { recursive: true, force: true });
    return true;
  } catch (err) {
    console.error('Error removing WhatsApp auth directory:', err);
    return false;
  }
};

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
        dataPath: AUTH_PATH
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
      isConnecting = false;
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
      isConnecting = false;
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
    throw error;
  } finally {
    // If initialization fails synchronously before events fire, ensure flag is reset.
    // If it succeeds, the ready/authenticated handlers will also set it false.
    if (connectionStatus !== 'connecting') {
      isConnecting = false;
    }
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
export const disconnectWhatsApp = async ({ clearSession = false } = {}) => {
  try {
    const hadClient = !!whatsappClient;

    if (whatsappClient) {
      // Prevent late events from toggling status after we disconnect.
      try {
        whatsappClient.removeAllListeners();
      } catch {
        // ignore
      }

      // Logout may fail in some states; still attempt destroy so the browser is closed.
      try {
        await whatsappClient.logout();
      } catch (err) {
        console.warn('WhatsApp logout failed (continuing to destroy):', err?.message || err);
      }

      try {
        await whatsappClient.destroy();
      } catch (err) {
        console.warn('WhatsApp destroy failed:', err?.message || err);
      }
    }

    whatsappClient = null;
    qrCodeData = null;
    connectionStatus = 'disconnected';
    isConnecting = false;

    let sessionCleared = false;
    if (clearSession) {
      sessionCleared = await safeRmAuthDir();
    }

    if (!hadClient && !clearSession) {
      return { success: true, message: 'WhatsApp was not connected' };
    }

    if (clearSession) {
      return {
        success: true,
        message: sessionCleared
          ? 'WhatsApp disconnected and session cleared successfully'
          : 'WhatsApp disconnected, but failed to clear session directory',
        sessionCleared
      };
    }

    return { success: true, message: 'WhatsApp disconnected successfully' };
  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error);
    throw error;
  }
};

/**
 * Check if WhatsApp client is actually valid and ready
 */
const isClientValid = () => {
  return !!(whatsappClient && connectionStatus === 'connected');
};

/**
 * Handle detached frame errors by marking client as disconnected
 */
const handleDetachedFrameError = (error) => {
  const errorMessage = error?.message || '';
  if (errorMessage.includes('detached Frame') || errorMessage.includes('Target closed') || errorMessage.includes('Session closed')) {
    console.warn('WhatsApp client frame detached - marking as disconnected');
    connectionStatus = 'disconnected';
    qrCodeData = null;
    isConnecting = false;
    // Clean up the client reference to prevent further use
    if (whatsappClient) {
      try {
        whatsappClient.removeAllListeners();
      } catch (e) {
        // Ignore cleanup errors
      }
      whatsappClient = null;
    }
    return true; // Indicates this was a detached frame error
  }
  return false;
};

/**
 * Send WhatsApp message
 */
export const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    if (!isClientValid()) {
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
    // Check if this is a detached frame error
    if (handleDetachedFrameError(error)) {
      throw new Error('WhatsApp connection lost - please reconnect');
    }
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

  if (!isClientValid()) {
    throw new Error('WhatsApp is not connected');
  }

  for (const phoneNumber of phoneNumbers) {
    try {
      // Check if client is still valid before each send attempt
      if (!isClientValid()) {
        const errorMsg = 'WhatsApp connection lost during bulk send';
        errors.push({ phoneNumber, error: errorMsg });
        results.push({ phoneNumber, success: false, error: errorMsg });
        continue;
      }

      // Format phone number (remove + and spaces, add country code if needed)
      const formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
      const chatId = formattedNumber.includes('@c.us') 
        ? formattedNumber 
        : `${formattedNumber}@c.us`;

      await whatsappClient.sendMessage(chatId, message);
      results.push({ phoneNumber, success: true });
      console.log(`WhatsApp message sent to ${phoneNumber}`);
    } catch (error) {
      // Check if this is a detached frame error
      if (handleDetachedFrameError(error)) {
        // Mark remaining numbers as failed due to connection loss
        const remainingNumbers = phoneNumbers.slice(phoneNumbers.indexOf(phoneNumber));
        for (const remainingNumber of remainingNumbers) {
          if (!results.find(r => r.phoneNumber === remainingNumber)) {
            errors.push({ phoneNumber: remainingNumber, error: 'WhatsApp connection lost' });
            results.push({ phoneNumber: remainingNumber, success: false, error: 'WhatsApp connection lost' });
          }
        }
        break; // Stop trying to send remaining messages
      }
      
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

