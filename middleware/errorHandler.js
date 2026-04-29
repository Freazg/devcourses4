const logger = require('../config/logger');

// Завдання 4: Middleware для обробки помилок
const errorHandler = (err, req, res, next) => {
  // Логуємо помилку через Winston
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method}`);

  // Multer-специфічні помилки
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'Файл занадто великий. Максимальний розмір: 5 МБ',
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: 'Перевищено максимальну кількість файлів (5)',
    });
  }

  if (err.message === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      error: 'Недозволений тип файлу. Дозволені: JPG, PNG, PDF',
    });
  }

  // Загальна помилка
  res.status(err.status || 500).json({
    error: err.message || 'Внутрішня помилка сервера',
  });
};

module.exports = errorHandler;
