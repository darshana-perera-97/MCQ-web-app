/**
 * API Configuration
 * For production (HTTPS): set REACT_APP_API_URL and REACT_APP_BACKEND_URL to your HTTPS API base
 * (e.g. REACT_APP_API_URL=https://gov-exam.nexgenai.asia/api REACT_APP_BACKEND_URL=https://gov-exam.nexgenai.asia)
 * to avoid Mixed Content and "Failed to fetch" when the app is served over HTTPS.
 */
// live server
// const API_BASE_URL = "http://93.127.129.102:3941/api";
// const BACKEND_URL = "http://93.127.129.102:3941";


const API_BASE_URL ="https://gov-exam.nexgenai.asia/api";
const BACKEND_URL ="https://gov-exam.nexgenai.asia";

// testbed
// const API_BASE_URL = "http://93.127.129.102:3940/api";
// const BACKEND_URL = "http://93.127.129.102:3940";

export { API_BASE_URL, BACKEND_URL };
