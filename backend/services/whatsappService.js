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
/**
 * Get a readable error message from caught errors (handles minified/cryptic messages like "t: t")
 */
const getErrorMessage = (error) => {
  if (!error) return 'Unknown error';
  if (typeof error.message === 'string' && error.message.length > 2 && !/^[a-z]:\s*[a-z]$/i.test(error.message)) {
    return error.message;
  }
  if (typeof error.toString === 'function') {
    const s = error.toString();
    if (s && s !== '[object Object]') return s;
  }
  return 'Failed to send message (WhatsApp/connection error)';
};

/**
 * Normalize phone number for WhatsApp: digits only, ensure country code (94 for Sri Lanka if starts with 0)
 */
const normalizePhoneForWhatsApp = (phoneNumber) => {
  const digits = phoneNumber.replace(/[^0-9]/g, '');
  if (!digits) return '';
  // Sri Lanka: 0XXXXXXXXX -> 94XXXXXXXXX (e.g. 0779695412 -> 94779695412)
  if (digits.startsWith('0') && digits.length >= 10) {
    return '94' + digits.slice(1);
  }
  if (digits.startsWith('0')) return '94' + digits.slice(1);
  // Already has country code or international format
  return digits;
};

const handleDetachedFrameError = (error) => {
  const errorMessage = getErrorMessage(error);
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

    const normalized = normalizePhoneForWhatsApp(phoneNumber);
    if (!normalized) throw new Error(`Invalid phone number: ${phoneNumber}`);
    const chatId = `${normalized}@c.us`;
    const messageText = typeof message === 'string' ? message : String(message ?? '');

    await whatsappClient.sendMessage(chatId, messageText);
    return { success: true, message: 'Message sent successfully' };
  } catch (error) {
    if (handleDetachedFrameError(error)) {
      throw new Error('WhatsApp connection lost - please reconnect');
    }
    const errMsg = getErrorMessage(error);
    console.error('Error sending WhatsApp message:', errMsg, error);
    throw new Error(errMsg);
  }
};

/**
 * Get WhatsApp client instance
 */
export const getWhatsAppClient = () => {
  return whatsappClient;
};

/** Delay between bulk WhatsApp messages (20-30 seconds to avoid rate limits) */
const BULK_SEND_DELAY_MS = 25 * 1000; // 25 seconds

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Send WhatsApp message to multiple phone numbers
 * Waits 20-30 seconds between each message to avoid rate limiting.
 */
export const sendWhatsAppMessageToMultiple = async (phoneNumbers, message) => {
  const results = [];
  const errors = [];

  if (!isClientValid()) {
    throw new Error('WhatsApp is not connected');
  }

  const messageText = typeof message === 'string' ? message : String(message ?? '');
  const total = phoneNumbers.length;

  for (let i = 0; i < phoneNumbers.length; i++) {
    const phoneNumber = phoneNumbers[i];
    try {
      if (!isClientValid()) {
        const errorMsg = 'WhatsApp connection lost during bulk send';
        errors.push({ phoneNumber, error: errorMsg });
        results.push({ phoneNumber, success: false, error: errorMsg });
        continue;
      }

      const normalized = normalizePhoneForWhatsApp(phoneNumber);
      if (!normalized) {
        const errorMsg = 'Invalid phone number format';
        errors.push({ phoneNumber, error: errorMsg });
        results.push({ phoneNumber, success: false, error: errorMsg });
        continue;
      }
      const chatId = `${normalized}@c.us`;

      await whatsappClient.sendMessage(chatId, messageText);
      results.push({ phoneNumber, success: true });
      console.log(`WhatsApp message sent to ${phoneNumber} (${i + 1}/${total})`);
    } catch (error) {
      if (handleDetachedFrameError(error)) {
        const remainingNumbers = phoneNumbers.slice(phoneNumbers.indexOf(phoneNumber));
        for (const remainingNumber of remainingNumbers) {
          if (!results.find(r => r.phoneNumber === remainingNumber)) {
            errors.push({ phoneNumber: remainingNumber, error: 'WhatsApp connection lost' });
            results.push({ phoneNumber: remainingNumber, success: false, error: 'WhatsApp connection lost' });
          }
        }
        break;
      }

      const errMsg = getErrorMessage(error);
      console.error(`Error sending WhatsApp message to ${phoneNumber}:`, errMsg);
      errors.push({ phoneNumber, error: errMsg });
      results.push({ phoneNumber, success: false, error: errMsg });
    }

    // Wait 20-30 seconds before next message (skip after last)
    if (i < phoneNumbers.length - 1) {
      console.log(`Waiting ${BULK_SEND_DELAY_MS / 1000}s before next message...`);
      await delay(BULK_SEND_DELAY_MS);
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

/**
 * Restart WhatsApp connection without clearing session
 * This reconnects the client while preserving authentication
 */
export const restartWhatsApp = async () => {
  try {
    // Only restart if currently connected
    if (connectionStatus !== 'connected' || !whatsappClient) {
      console.log('WhatsApp is not connected, skipping restart');
      return { success: false, message: 'WhatsApp is not connected' };
    }

    console.log('🔄 Restarting WhatsApp connection...');

    // Store the current connection status
    const wasConnected = connectionStatus === 'connected';

    // Clean up the current client without clearing session
    if (whatsappClient) {
      try {
        whatsappClient.removeAllListeners();
      } catch (err) {
        console.warn('Error removing listeners during restart:', err?.message || err);
      }

      try {
        await whatsappClient.destroy();
      } catch (err) {
        console.warn('Error destroying client during restart:', err?.message || err);
      }
    }

    // Reset state (but keep session/auth directory)
    whatsappClient = null;
    qrCodeData = null;
    connectionStatus = 'disconnected';
    isConnecting = false;

    // Wait a moment before reconnecting
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Reconnect (this will use the existing session)
    if (wasConnected) {
      await connectWhatsApp();
      console.log('✅ WhatsApp connection restarted successfully');
      return { success: true, message: 'WhatsApp connection restarted successfully' };
    }

    return { success: false, message: 'WhatsApp was not connected before restart' };
  } catch (error) {
    console.error('Error restarting WhatsApp connection:', error);
    connectionStatus = 'disconnected';
    isConnecting = false;
    throw error;
  }
};

