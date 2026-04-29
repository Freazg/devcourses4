const express = require('express');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

const router = express.Router();

// Завдання 8: /status — моніторинг стану сервера
router.get('/status', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage    = process.cpuUsage();
  const uptime      = process.uptime();

  const status = {
    status:   'running',
    uptime:   `${Math.floor(uptime / 60)}хв ${Math.floor(uptime % 60)}с`,
    uptimeRaw: uptime,
    memory: {
      heapUsed:  `${(memoryUsage.heapUsed  / 1024 / 1024).toFixed(2)} МБ`,
      heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} МБ`,
      rss:       `${(memoryUsage.rss       / 1024 / 1024).toFixed(2)} МБ`,
      external:  `${(memoryUsage.external  / 1024 / 1024).toFixed(2)} МБ`,
    },
    cpu: {
      user:   cpuUsage.user,
      system: cpuUsage.system,
    },
    nodeVersion: process.version,
    platform:    process.platform,
    pid:         process.pid,
    timestamp:   new Date().toISOString(),
  };

  logger.info(`Status check — uptime: ${status.uptime}, heap: ${status.memory.heapUsed}`);
  res.json(status);
});

// Додатковий: API перегляду логів
router.get('/logs', (req, res) => {
  const logFile = path.join(__dirname, '..', 'logs', 'app.log');

  if (!fs.existsSync(logFile)) {
    return res.json({ logs: [] });
  }

  const lines = fs.readFileSync(logFile, 'utf8')
    .split('\n')
    .filter(Boolean)
    .slice(-50) // останні 50 рядків
    .map(line => {
      try { return JSON.parse(line); }
      catch { return { raw: line }; }
    });

  res.json({ count: lines.length, logs: lines });
});

module.exports = router;
