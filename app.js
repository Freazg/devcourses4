const express = require('express');
const morgan  = require('morgan');
const path    = require('path');
const fs      = require('fs');

const logger          = require('./config/logger');
const responseTime    = require('./middleware/responseTime');
const errorHandler    = require('./middleware/errorHandler');
const uploadRoutes    = require('./routes/upload');
const monitorRoutes   = require('./routes/monitor');

const app  = express();
const PORT = 3003;

// ── Завдання 1: Базовий сервер ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Роздача завантажених файлів
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Завдання 2: Логування HTTP-запитів через Morgan ─────────────────────────
// Зберігаємо Morgan-логи у окремий файл
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'logs', 'access.log'),
  { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream })); // у файл
app.use(morgan('dev'));                                    // у консоль

// ── Завдання 5/9: Middleware вимірювання часу відповіді ─────────────────────
app.use(responseTime);

// ── Маршрути ─────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'DevCourses API — ЛР №4',
    version: '1.0.0',
    endpoints: {
      'GET  /':                'Ця сторінка',
      'GET  /status':          'Стан сервера (uptime, memory, CPU)',
      'GET  /logs':            'Останні 50 записів логів',
      'POST /upload':          'Завантажити один файл (поле: file)',
      'POST /upload-multiple': 'Завантажити до 5 файлів (поле: files)',
      'GET  /files':           'Список завантажених файлів',
      'DELETE /files/:name':   'Видалити файл',
    },
  });
});

app.use('/', uploadRoutes);
app.use('/', monitorRoutes);

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  logger.warn(`404 — ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Маршрут не знайдено' });
});

// ── Завдання 4: Обробка помилок ──────────────────────────────────────────────
app.use(errorHandler);

// ── Старт ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  logger.info(`NodeJS ${process.version} | PID ${process.pid}`);

  // Завдання 5 (демо): Моніторинг кожні 30 секунд
  setInterval(() => {
    const mem = process.memoryUsage();
    const cpu = process.cpuUsage();
    logger.info(
      `[monitor] heap: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB | ` +
      `cpu_user: ${cpu.user} μs | uptime: ${Math.floor(process.uptime())}s`
    );
  }, 30_000);
});

module.exports = app;
