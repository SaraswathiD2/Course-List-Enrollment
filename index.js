const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./data.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database tables
db.serialize(() => {
  // Courses table
  db.run(`CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    instructor TEXT
  )`);

  // Enrollments table
  db.run(`CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    courseId INTEGER NOT NULL,
    userId TEXT NOT NULL,
    enrolledAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (courseId) REFERENCES courses(id),
    UNIQUE(courseId, userId)
  )`);

  // Seed initial courses
  db.get('SELECT COUNT(*) as count FROM courses', (err, row) => {
    if (err) {
      console.error('Error checking courses:', err.message);
    } else if (row.count === 0) {
      const courses = [
        { title: 'Introduction to JavaScript', description: 'Learn the fundamentals of JavaScript programming', instructor: 'John Doe' },
        { title: 'React Basics', description: 'Get started with React and component-based development', instructor: 'Jane Smith' },
        { title: 'Node.js Fundamentals', description: 'Master server-side JavaScript with Node.js', instructor: 'Mike Johnson' },
        { title: 'Database Design', description: 'Learn SQL and database design principles', instructor: 'Sarah Williams' },
        { title: 'Full Stack Development', description: 'Build complete web applications from frontend to backend', instructor: 'David Brown' }
      ];

      const stmt = db.prepare('INSERT INTO courses (title, description, instructor) VALUES (?, ?, ?)');
      courses.forEach(course => {
        stmt.run(course.title, course.description, course.instructor);
      });
      stmt.finalize();
      console.log('Seeded initial courses');
    }
  });
});

// API Routes

// GET /courses - List all available courses
app.get('/courses', (req, res) => {
  const userId = req.query.userId || 'default-user'; // Default user for demo

  db.all(`
    SELECT 
      c.id,
      c.title,
      c.description,
      c.instructor,
      CASE WHEN e.id IS NOT NULL THEN 1 ELSE 0 END as enrolled
    FROM courses c
    LEFT JOIN enrollments e ON c.id = e.courseId AND e.userId = ?
    ORDER BY c.id
  `, [userId], (err, rows) => {
    if (err) {
      console.error('Error fetching courses:', err.message);
      return res.status(500).json({ error: 'Failed to fetch courses' });
    }
    res.json(rows);
  });
});

// POST /courses/:courseId/enroll - Enroll user in a course
app.post('/courses/:courseId/enroll', (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const userId = req.body.userId || 'default-user'; // Default user for demo

  if (isNaN(courseId)) {
    return res.status(400).json({ error: 'Invalid course ID' });
  }

  // Check if course exists
  db.get('SELECT id FROM courses WHERE id = ?', [courseId], (err, course) => {
    if (err) {
      console.error('Error checking course:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Enroll or re-enroll user (INSERT OR REPLACE updates enrollment timestamp)
    db.run('INSERT OR REPLACE INTO enrollments (courseId, userId, enrolledAt) VALUES (?, ?, CURRENT_TIMESTAMP)', [courseId, userId], function(err) {
      if (err) {
        console.error('Error enrolling:', err.message);
        return res.status(500).json({ error: 'Failed to enroll' });
      }

      res.json({ 
        success: true, 
        message: 'Successfully enrolled in course',
        enrollmentId: this.lastID
      });
    });
  });
});

// DELETE /courses/:courseId/enroll - Unenroll user from a course
app.delete('/courses/:courseId/enroll', (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const userId = req.body.userId || 'default-user';

  if (isNaN(courseId)) {
    return res.status(400).json({ error: 'Invalid course ID' });
  }

  db.run('DELETE FROM enrollments WHERE courseId = ? AND userId = ?', [courseId, userId], function(err) {
    if (err) {
      console.error('Error unenrolling:', err.message);
      return res.status(500).json({ error: 'Failed to unenroll' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    res.json({ 
      success: true, 
      message: 'Successfully unenrolled from course'
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

