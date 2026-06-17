const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serve the dashboard

const LOG_FILE = path.join(__dirname, 'logs.json');

// Initialize log file
if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, '[]');

// Receive logs from app
app.post('/logs', (req, res) => {
  const logs = JSON.parse(fs.readFileSync(LOG_FILE));
  logs.unshift(req.body); // newest first
  fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
  res.json({ ok: true });
});

// Get all logs
app.get('/logs', (req, res) => {
  const logs = JSON.parse(fs.readFileSync(LOG_FILE));
  res.json(logs);
});

// Clear all logs
app.delete('/logs', (req, res) => {
  fs.writeFileSync(LOG_FILE, '[]');
  res.json({ ok: true });
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Log server running on http://0.0.0.0:3000');
});