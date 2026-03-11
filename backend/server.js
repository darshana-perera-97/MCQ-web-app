import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/userRoutes.js';
import mcqRoutes from './routes/mcqRoutes.js';
import essayRoutes from './routes/essayRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import whatsappRoutes from './routes/whatsappRoutes.js';
import materialRoutes from './routes/materialRoutes.js';
import summaryRoutes from './routes/summaryRoutes.js';
import structuredQuestionRoutes from './routes/structuredQuestionRoutes.js';
import structuredWritingRoutes from './routes/structuredWritingRoutes.js';
import { connectWhatsApp, restartWhatsApp } from './services/whatsappService.js';
import { sendInactivityReminders } from './services/inactivityReminderService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Import constants
import { PORT, BACKEND_URL } from './config/constants.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve uploaded files (PDFs)
app.use('/data/files', express.static(path.join(__dirname, 'data/files')));

// Request logging middleware (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/mcqs', mcqRoutes);
app.use('/api/essays', essayRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/summaries', summaryRoutes);
app.use('/api/structured-questions', structuredQuestionRoutes);
app.use('/api/structured-writings', structuredWritingRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve static files from React app build folder
const frontendBuildPath = path.join(__dirname, '../frontend/build');
app.use(express.static(frontendBuildPath));

// API info route (before catch-all)
app.get('/api', (req, res) => {
  res.json({ 
    message: 'MCQ Web App Backend API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      mcqs: '/api/mcqs',
      essays: '/api/essays',
      notifications: '/api/notifications',
      settings: '/api/settings',
      admin: '/api/admin'
    }
  });
});

// Error handler (must be before catch-all route)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Catch-all handler: send back React's index.html file for client-side routing
// This must be after all API routes and static file serving
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ 
      error: 'API route not found',
      path: req.path 
    });
  }
  
  // Serve React app for all other routes
  res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).json({ 
        error: 'Frontend build not found',
        message: 'Please build the frontend first by running "npm run build" in the frontend directory'
      });
    }
  });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`🚀 Server is running on ${BACKEND_URL}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Auto-connect WhatsApp on server startup
  try {
    console.log('📱 Attempting to connect WhatsApp...');
    await connectWhatsApp();
    console.log('✅ WhatsApp connection initiated');
  } catch (error) {
    console.log('⚠️  WhatsApp auto-connect failed (this is normal if not previously connected):', error.message);
    console.log('💡 You can connect WhatsApp manually from the Settings page');
  }

  // Set up automatic WhatsApp restart every 2 hours
  const RESTART_INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  console.log(`⏰ WhatsApp will automatically restart every 2 hours`);

  const restartInterval = setInterval(async () => {
    try {
      console.log(`🔄 Scheduled WhatsApp restart initiated at ${new Date().toISOString()}`);
      await restartWhatsApp();
    } catch (error) {
      console.error('❌ Error during scheduled WhatsApp restart:', error.message);
    }
  }, RESTART_INTERVAL_MS);

  // Inactivity reminders: send WhatsApp reminder to users who haven't logged in for 48+ hours
  const REMINDER_INTERVAL_MS = 6 * 60 * 60 * 1000; // every 6 hours
  console.log(`📬 Inactivity reminders will run every 6 hours (users inactive 48h+)`);

  const reminderInterval = setInterval(async () => {
    try {
      const result = await sendInactivityReminders();
      if (result.sent > 0) {
        console.log(`📬 Inactivity reminders sent: ${result.sent}`);
      }
    } catch (error) {
      console.error('❌ Inactivity reminder job error:', error.message);
    }
  }, REMINDER_INTERVAL_MS);

  // Clean up intervals on server shutdown
  const clearAll = () => {
    clearInterval(restartInterval);
    clearInterval(reminderInterval);
  };

  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, cleaning up...');
    clearAll();
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, cleaning up...');
    clearAll();
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
});

