/**
 * API Configuration
 * Centralized configuration for backend API URL
 */

// Get API base URL from environment variable or use default
const API_BASE_URL = 'http://93.127.129.102:3940/api';
// const API_BASE_URL = 'http://localhost:3940/api';

// Backend server URL (without /api) for image URLs and other direct server access
const BACKEND_URL =  'http://93.127.129.102:3940';
// const BACKEND_URL =  'http://localhost:3940';

export { API_BASE_URL, BACKEND_URL };

