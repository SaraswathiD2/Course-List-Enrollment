# Course Enrollment System

A full-stack web application for listing and enrolling in courses, built as a take-home assignment.

## Tech Stack

- **Frontend:** React (with hooks), HTML/CSS
- **Backend:** Node.js with Express
- **Database:** SQLite

## Features

- Display a list of available courses
- Enroll in courses with a single click
- View enrollment status for each course
- Responsive and modern UI

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Access the Application**
   - Open your browser and navigate to: `http://localhost:3000`
   - The database will be automatically created and seeded with sample courses

## API Endpoints

### GET /courses
Returns a list of all available courses with enrollment status.

**Query Parameters:**
- `userId` (optional): User ID to check enrollment status (defaults to 'default-user')

**Response:**
```json
[
  {
    "id": 1,
    "title": "Introduction to JavaScript",
    "description": "Learn the fundamentals of JavaScript programming",
    "instructor": "John Doe",
    "enrolled": 0
  }
]
```

### POST /courses/:courseId/enroll
Enrolls a user in a specific course.

**Request Body:**
```json
{
  "userId": "default-user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully enrolled in course",
  "enrollmentId": 1
}
```

## Project Structure

```
Asgnmt-1/
├── index.js           # Express server and API routes
├── package.json       # Dependencies and scripts
├── public/
│   └── index.html    # React frontend
├── data.db           # SQLite database (auto-generated)
└── README.md         # This file
```

## Approach

1. **Database Design:**
   - `courses` table: Stores course information (id, title, description, instructor)
   - `enrollments` table: Tracks user enrollments with unique constraint on (courseId, userId)

2. **Backend Implementation:**
   - Express server with RESTful API endpoints
   - SQLite database for data persistence
   - CORS enabled for frontend communication
   - Automatic database initialization and seeding

3. **Frontend Implementation:**
   - React with functional components and hooks (useState, useEffect)
   - Fetch API for backend communication
   - Real-time UI updates on enrollment
   - Responsive grid layout with modern styling

4. **State Management:**
   - React hooks for local component state
   - Optimistic UI updates after successful enrollment

## Notes

- The application uses a default user ID ('default-user') for demo purposes
- The database file (`data.db`) is created automatically on first run
- Sample courses are seeded automatically if the database is empty

