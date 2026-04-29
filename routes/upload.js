const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../config/logger');

const router = express.Router();

// Завдання 7: Валідація типу файлу
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 МБ

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error('INVALID_FILE_TYPE');
    err.code = 'INVALID_FILE_TYPE';
    cb(err, false);
  }
};

// Завдання 5/6: Кастомне збереження з оригінальним іменем + timestamp
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${name}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 5 },
});

// Завдання 5: Завантаження одного файлу
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не надано' });
  }

  logger.info(`Завантажено файл: ${req.file.originalname} (${req.file.size} байт)`);

  res.status(201).json({
    message: 'Файл успішно завантажено',
    file: {
      originalName: req.file.originalname,
      savedAs:     req.file.filename,
      size:        req.file.size,
      mimeType:    req.file.mimetype,
      path:        req.file.path,
    },
  });
});

// Завдання 6: Завантаження кількох файлів
router.post('/upload-multiple', upload.array('files', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Файли не надані' });
  }

  logger.info(`Завантажено ${req.files.length} файл(ів)`);

  res.status(201).json({
    message: `Завантажено ${req.files.length} файл(ів)`,
    files: req.files.map(f => ({
      originalName: f.originalname,
      savedAs:     f.filename,
      size:        f.size,
      mimeType:    f.mimetype,
    })),
  });
});

// Список завантажених файлів
router.get('/files', (req, res) => {
  const uploadDir = path.join(__dirname, '..', 'uploads');
  const files = fs.existsSync(uploadDir) ? fs.readdirSync(uploadDir) : [];
  res.json({ count: files.length, files });
});

// Видалення файлу
router.delete('/files/:filename', (req, res) => {
  const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Файл не знайдено' });
  }

  fs.unlinkSync(filePath);
  logger.info(`Видалено файл: ${req.params.filename}`);
  res.json({ message: `Файл ${req.params.filename} видалено` });
});

module.exports = router;
