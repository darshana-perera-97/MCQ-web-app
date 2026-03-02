# Frontend-Backend API Integration

This document explains how the frontend is connected to the backend API.

## Setup

1. **Backend Server**: Make sure the backend server is running on `http://localhost:5000`
   ```bash
   cd backend
   npm start
   ```

2. **Frontend**: The frontend will automatically connect to the backend API
   ```bash
   cd frontend
   npm start
   ```

## API Configuration

The API base URL is configured in `src/services/api.js`:
- Default: `http://localhost:5000/api`
- Can be overridden with `REACT_APP_API_URL` environment variable

## Authentication

### Student Authentication
- Students can sign up and login through the `/login` route
- User data is stored in localStorage
- Protected routes check for authentication

### Admin Authentication
- Admin secret is stored in localStorage (default: `admin123`)
- Admin routes require `adminSecret` query parameter
- Can be set via `getAdminSecret()` helper function

## Key Components Updated

### 1. **AuthContext** (`src/context/AuthContext.js`)
- Manages user authentication state
- Provides login, signup, logout functions
- Stores user data in localStorage

### 2. **API Service** (`src/services/api.js`)
- Centralized API functions for all endpoints
- Handles authentication headers
- Error handling

### 3. **Student Components**
- **Dashboard**: Fetches user stats from API
- **QuizInterface**: Gets random MCQs and submits answers via API

### 4. **Admin Components**
- **UserManagement**: CRUD operations via API
- **QuestionEditor**: Create/delete MCQs and Essays via API
- **NotificationComposer**: Send notifications with image upload
- **Analytics**: Fetch analytics data from API

## API Endpoints Used

### User Endpoints
- `POST /api/users/signup` - Student signup
- `POST /api/users/login` - Student login
- `GET /api/users/:id/stats` - Get user statistics
- `GET /api/users` - Get all users (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### MCQ Endpoints
- `GET /api/mcqs/random?userId=xxx` - Get random unseen MCQ
- `POST /api/mcqs/submit` - Submit MCQ answer
- `GET /api/mcqs` - Get all MCQs
- `POST /api/mcqs` - Create MCQ (Admin)
- `DELETE /api/mcqs/:id` - Delete MCQ (Admin)

### Notification Endpoints
- `GET /api/notifications` - Get all notifications
- `POST /api/notifications` - Send notification (Admin, with image upload)

### Settings Endpoints
- `GET /api/settings` - Get settings (Admin)
- `PUT /api/settings` - Update settings (Admin)

## Testing the Connection

1. Start both servers:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm start
   
   # Terminal 2 - Frontend
   cd frontend && npm start
   ```

2. Create a test user:
   - Go to `/login`
   - Click "Sign Up"
   - Create an account

3. Test MCQ flow:
   - Login as student
   - Go to dashboard
   - Click "Start Now" to take a quiz
   - Answer questions and see scores update

4. Test Admin features:
   - Login as admin (use secret: `admin123`)
   - Access admin panel
   - Create MCQs, manage users, send notifications

## Troubleshooting

### CORS Errors
- Make sure backend CORS is enabled (already configured)
- Check that backend is running on port 5000

### API Connection Failed
- Verify backend server is running
- Check `REACT_APP_API_URL` in `.env` file
- Check browser console for errors

### Authentication Issues
- Clear localStorage and try again
- Check that user data is being stored correctly
- Verify API responses in Network tab

