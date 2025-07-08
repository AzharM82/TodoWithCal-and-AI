const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [
    new winston.transports.File({ filename: 'server.log' }),
    new winston.transports.Console()
  ],
});

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// SQLite DB setup
const dbPath = path.resolve(__dirname, 'tasks.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    reason TEXT,
    startTime TEXT,
    endTime TEXT,
    recurrence TEXT,
    status TEXT DEFAULT 'pending',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
});

// API: Get all tasks
app.get('/tasks', (req, res) => {
  db.all('SELECT * FROM tasks ORDER BY startTime ASC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// API: Create a new task
app.post('/tasks', (req, res) => {
  logger.info(`Received new task: ${JSON.stringify(req.body)}`);
  const { title, reason, startTime, endTime, recurrence } = req.body;

  // Basic validation
  if (!title || !startTime || !endTime) {
    logger.error('Missing required fields: title, startTime, or endTime');
    return res.status(400).json({ error: 'Missing required fields: title, startTime, or endTime' });
  }

  db.run(
    'INSERT INTO tasks (title, reason, startTime, endTime, recurrence) VALUES (?, ?, ?, ?, ?)',
    [title, reason, startTime, endTime, recurrence],
    function (err) {
      if (err) {
        logger.error(`Error creating task: ${err.message}`);
        res.status(500).json({ error: err.message });
      } else {
        // Fetch and return the full inserted row
        db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err2, row) => {
          if (err2) {
            logger.error(`Error fetching new task: ${err2.message}`);
            res.status(500).json({ error: err2.message });
          } else {
            res.json(row);
          }
        });
      }
    }
  );
});

// API: Update a task
app.put('/tasks/:id', (req, res) => {
  logger.info(`Update task ${req.params.id} payload: ${JSON.stringify(req.body)}`);
  const { title, reason, startTime, endTime, recurrence, status } = req.body;
  db.run(
    'UPDATE tasks SET title = ?, reason = ?, startTime = ?, endTime = ?, recurrence = ?, status = ? WHERE id = ?',
    [title, reason, startTime, endTime, recurrence, status, req.params.id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ changes: this.changes });
      }
    }
  );
});

// API: Delete a task
app.delete('/tasks/:id', (req, res) => {
  logger.info(`Delete request for task ${req.params.id}`);
  db.run('DELETE FROM tasks WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      logger.error(`Error deleting task ${req.params.id}: ${err.message}`);
      res.status(500).json({ error: err.message });
    } else {
      logger.info(`Deleted task ${req.params.id}, changes: ${this.changes}`);
      res.json({ changes: this.changes });
    }
  });
});

// API: Mark task as completed
app.patch('/tasks/:id/complete', (req, res) => {
  db.run('UPDATE tasks SET status = ? WHERE id = ?', ['completed', req.params.id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ changes: this.changes });
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('To-Do with Calendar Backend is running.');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
