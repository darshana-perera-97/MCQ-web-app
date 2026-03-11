import { UserModel } from '../models/UserModel.js';
import { SettingsModel } from '../models/SettingsModel.js';
import { sendWhatsAppMessage, getWhatsAppStatus } from './whatsappService.js';
import { PLATFORM_URL } from '../config/constants.js';

const userModel = new UserModel();
const settingsModel = new SettingsModel();

/** Inactivity threshold: 48 hours in milliseconds */
const INACTIVITY_THRESHOLD_MS = 48 * 60 * 60 * 1000;

/** Minimum gap between sending reminders to the same user: 48 hours */
const REMINDER_COOLDOWN_MS = 48 * 60 * 60 * 1000;

/**
 * Get a pleasant reminder message for inactive users
 */
function getReminderMessage(name) {
  const firstName = name && name.trim() ? name.trim().split(/\s+/)[0] : 'there';
  return (
    `Hi ${firstName}! 👋\n\n` +
    `We noticed you haven’t dropped by in a while — we’d love to see you back!\n\n` +
    `✨ *A quick reminder:*\n` +
    `• Your daily tasks are waiting for you\n` +
    `• There may be new questions to help you practice\n` +
    `• A few minutes each day can keep your progress on track\n\n` +
    `Whenever you’re ready, we’re here. Just log in and pick up where you left off. 🌟\n\n` +
    `Login: ${PLATFORM_URL}\n\n` +
    `— Your Learning Platform`
  );
}

/**
 * Find approved students who haven’t logged in for 48+ hours and haven’t been reminded in the last 48 hours
 */
export async function getUsersNeedingReminder() {
  const users = await userModel.findAll();
  const now = Date.now();
  const cutoff = now - INACTIVITY_THRESHOLD_MS;
  const reminderCutoff = now - REMINDER_COOLDOWN_MS;

  return users.filter((user) => {
    if (user.role === 'admin') return false;
    if ((user.status || 'approved') !== 'approved') return false;
    const phone = user.phone || user.phoneNumber || user.mobile;
    if (!phone || !String(phone).trim()) return false;
    if (user.whatsappNotifications === false) return false;

    const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt).getTime() : 0;
    const lastReminder = user.lastReminderAt ? new Date(user.lastReminderAt).getTime() : 0;

    // Only remind users who have logged in at least once and have been inactive for 48+ hours
    const inactiveLongEnough = lastLogin > 0 && lastLogin < cutoff;
    const canSendReminder = lastReminder === 0 || lastReminder < reminderCutoff;

    return inactiveLongEnough && canSendReminder;
  });
}

/**
 * Send WhatsApp inactivity reminders to eligible users (one message per user, with delay between sends)
 */
export async function sendInactivityReminders() {
  try {
    const settings = await settingsModel.read();
    const notifications = settings.notifications || { whatsappEnabled: true };
    if (notifications.whatsappEnabled === false) {
      console.log('[InactivityReminder] WhatsApp notifications disabled, skipping reminders');
      return { sent: 0, skipped: 0, errors: [] };
    }

    const status = getWhatsAppStatus();
    if (!status.isConnected) {
      console.log('[InactivityReminder] WhatsApp not connected, skipping reminders');
      return { sent: 0, skipped: 0, errors: [] };
    }

    const users = await getUsersNeedingReminder();
    if (users.length === 0) {
      return { sent: 0, skipped: 0, errors: [] };
    }

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const DELAY_BETWEEN_MESSAGES_MS = 25 * 1000; // 25 seconds between reminders

    let sent = 0;
    const errors = [];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const phone = (user.phone || user.phoneNumber || user.mobile || '').trim();
      if (!phone) continue;

      try {
        const message = getReminderMessage(user.name || 'Student');
        await sendWhatsAppMessage(phone, message);
        await userModel.update(user.id, { lastReminderAt: new Date().toISOString() });
        sent++;
        console.log(`[InactivityReminder] Sent to ${user.email} (${user.name})`);
      } catch (err) {
        console.error(`[InactivityReminder] Failed for ${user.email}:`, err.message);
        errors.push({ email: user.email, error: err.message });
      }

      if (i < users.length - 1) {
        await delay(DELAY_BETWEEN_MESSAGES_MS);
      }
    }

    return { sent, skipped: users.length - sent - errors.length, errors };
  } catch (error) {
    console.error('[InactivityReminder] Error:', error);
    return { sent: 0, skipped: 0, errors: [{ error: error.message }] };
  }
}
