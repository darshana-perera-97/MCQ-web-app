import { getWhatsAppStatus, disconnectWhatsApp } from '../services/whatsappService.js';

async function main() {
  console.log('status_before', getWhatsAppStatus());
  try {
    const result = await disconnectWhatsApp({ clearSession: true });
    console.log('disconnect_result', result);
  } catch (err) {
    console.error('disconnect_threw', err?.stack || err);
    process.exitCode = 1;
  } finally {
    console.log('status_after', getWhatsAppStatus());
  }
}

main();


