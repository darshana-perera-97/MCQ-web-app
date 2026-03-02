# MCQ Web App - Backend Server

A Node.js Express RESTful API for the Learning Management Center (LMC) using JSON file storage.

## Features

- ✅ **User System**: Student signup/login and Admin authentication
- ✅ **MCQ Engine**: Fetch random unseen MCQs, track seen questions
- ✅ **Daily Limits**: Global daily limit with per-user tracking
- ✅ **Admin CRUD**: Full CRUD operations for Students, MCQs, and Essays
- ✅ **Notification System**: Send notifications with optional image uploads
- ✅ **Scoring System**: Automatic score calculation on MCQ submission
- ✅ **MVC Architecture**: Clean separation of concerns (Models, Views, Controllers)
- ✅ **Atomic Writes**: Prevents JSON file corruption

## Project Structure

```
backend/
├── data/              # JSON database files
│   ├── users.json
│   ├── mcqs.json
│   ├── essays.json
│   ├── notifications.json
│   └── settings.json
├── uploads/           # Uploaded images
├── controllers/       # Business logic
├── models/            # Data access layer
├── routes/            # API routes
├── middleware/        # Middleware functions
├── server.js          # Main server file
├── seed.js            # Database initialization script
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Seed the database (creates initial JSON files):
```bash
npm run seed
```

3. Create a `.env` file (optional):
```env
PORT=3940
NODE_ENV=development
ADMIN_SECRET=admin123
```

### Building the Frontend

Before running the server in production, you need to build the frontend:

```bash
cd ../frontend
npm run build
cd ../backend
```

This creates a `build` folder in the frontend directory that the backend will serve.

### Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3940`

**Note:** The backend serves both the API and the frontend React app. After building the frontend, the backend will automatically serve the static files from `../frontend/build`. All routes except `/api/*` will serve the React app for client-side routing.

## API Endpoints

### Authentication

#### Student Signup
```http
POST /api/users/signup
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Student Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123"
}
```

#### Admin Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "secret": "admin123"
}
```

### Users

- `GET /api/users` - Get all users (Admin only, requires `?adminSecret=admin123`)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `GET /api/users/:id/stats` - Get user stats (daily count, score, etc.)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### MCQs

- `GET /api/mcqs/random?userId=<user-id>` - Get random unseen MCQ
- `POST /api/mcqs/submit` - Submit MCQ answer
  ```json
  {
    "userId": "user-id",
    "mcqId": "MCQ-123",
    "selectedAnswer": "A"
  }
  ```
- `GET /api/mcqs` - Get all MCQs
- `GET /api/mcqs/:id` - Get MCQ by ID
- `POST /api/mcqs` - Create MCQ (Admin only)
- `PUT /api/mcqs/:id` - Update MCQ (Admin only)
- `DELETE /api/mcqs/:id` - Delete MCQ (Admin only)

### Essays

- `GET /api/essays` - Get all essay questions
- `GET /api/essays/:id` - Get essay by ID
- `POST /api/essays` - Create essay (Admin only)
- `PUT /api/essays/:id` - Update essay (Admin only)
- `DELETE /api/essays/:id` - Delete essay (Admin only)

### Notifications

- `GET /api/notifications` - Get all notifications
- `POST /api/notifications` - Send notification (Admin only, supports image upload)
  ```bash
  # Using curl with image
  curl -X POST http://localhost:3940/api/notifications?adminSecret=admin123 \
    -F "title=New Quiz" \
    -F "message=Check out new questions" \
    -F "image=@/path/to/image.jpg"
  ```
- `DELETE /api/notifications/:id` - Delete notification (Admin only)

### Settings

- `GET /api/settings` - Get settings (Admin only)
- `PUT /api/settings` - Update settings (Admin only)
  ```json
  {
    "globalDailyLimit": 15
  }
  ```

## How It Works

### Seen MCQ Logic

1. Each user has a `seenMcqs` array in their user object
2. When fetching a random MCQ, the system:
   - Gets all MCQs
   - Filters out MCQs whose IDs are in the user's `seenMcqs` array
   - Returns a random MCQ from the unseen list
3. When a user submits an answer, the MCQ ID is added to their `seenMcqs` array

### Daily Limit System

1. Admin sets a `globalDailyLimit` in `settings.json`
2. Each user has:
   - `dailyCount`: Number of MCQs attempted today
   - `lastAttemptDate`: Date of last attempt (YYYY-MM-DD)
3. On each request, the system checks if it's a new day and resets `dailyCount` if needed
4. Users cannot fetch new MCQs if `dailyCount >= globalDailyLimit`

### Scoring

- Correct answer: +10 points
- Incorrect answer: 0 points
- Score is automatically updated in the user's record

## Data Models

### User
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "password": "hashed-password",
  "name": "User Name",
  "role": "student",
  "score": 0,
  "dailyCount": 0,
  "lastAttemptDate": "2024-01-01",
  "seenMcqs": []
}
```

### MCQ
```json
{
  "id": "MCQ-240101-001",
  "question": "What is...?",
  "optionA": "Option A",
  "optionB": "Option B",
  "optionC": "Option C",
  "optionD": "Option D",
  "answer": "A",
  "category": "JavaScript",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Essay
```json
{
  "id": "ESSAY-240101-001",
  "question": "Explain...",
  "category": "Programming",
  "answer": "Sample answer",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Security Notes

⚠️ **This is an MVP implementation. For production:**

- Hash passwords using bcrypt
- Implement JWT authentication
- Add rate limiting
- Validate and sanitize all inputs
- Use HTTPS
- Add CORS restrictions
- Implement proper error handling

## Next Steps

- [ ] Add password hashing (bcrypt)
- [ ] Implement JWT authentication
- [ ] Add input validation middleware
- [ ] Add rate limiting
- [ ] Add API documentation (Swagger)
- [ ] Migrate to MongoDB/PostgreSQL
- [ ] Add unit tests
- [ ] Add integration tests
