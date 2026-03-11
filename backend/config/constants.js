/**
 * Backend Configuration Constants
 * Centralized location for all backend URLs and configuration values
 */

const PORT =  39401;
const BACKEND_URL = `http://93.127.129.102:3941`;



// const PORT =  3940;
// const BACKEND_URL = `http://93.127.129.102:3940`;
// const BACKEND_URL = `http://localhost:${PORT}`;
const API_BASE_URL = `${BACKEND_URL}/api`;

// Platform URL for frontend (can be different from backend URL)
// Use environment variable or default to backend URL
const PLATFORM_URL = process.env.PLATFORM_URL || process.env.FRONTEND_URL || BACKEND_URL;

export {
  PORT,
  BACKEND_URL,
  API_BASE_URL,
  PLATFORM_URL
};

