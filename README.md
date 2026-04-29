# DevCourses — ЛР №4: Логування, файли, моніторинг

**Автор:** Сас Євгеній Олександрович, група ІО-31
Дисципліна: WEB-орієнтовані технології. Backend розробки
КПІ ім. Ігоря Сікорського, ФІОТ, кафедра ІСТ

## Тема

Розширені можливості Node.js-додатків: логування, завантаження файлів, моніторинг продуктивності.

## Структура проєкту

```
lab4/
├── app.js                  # Головний файл сервера
├── config/
│   └── logger.js           # Winston логер (app.log + error.log + console)
├── middleware/
│   ├── errorHandler.js     # Обробка помилок з Winston логуванням
│   └── responseTime.js     # Вимірювання часу відповіді
├── routes/
│   ├── upload.js           # POST /upload, POST /upload-multiple, GET /files
│   └── monitor.js          # GET /status, GET /logs
├── uploads/                # Завантажені файли
├── logs/                   # app.log, error.log, access.log
└── package.json
```

## Встановлення та запуск

```bash
npm install
npm start         # node app.js → http://localhost:3003
```

### Запуск через PM2

```bash
npm install -g pm2
pm2 start app.js --name devcourses-lab4
pm2 monit                  # моніторинг у реальному часі
pm2 logs devcourses-lab4   # перегляд логів
pm2 list                   # список процесів
```

## API

| Метод  | URL                | Опис                                  |
|--------|--------------------|---------------------------------------|
| GET    | /                  | Список ендпоінтів                     |
| GET    | /status            | Uptime, пам'ять, CPU, PID             |
| GET    | /logs              | Останні 50 записів із app.log         |
| POST   | /upload            | Завантажити один файл (поле: file)    |
| POST   | /upload-multiple   | Завантажити до 5 файлів (поле: files) |
| GET    | /files             | Список завантажених файлів            |
| DELETE | /files/:filename   | Видалити файл                         |

## Дозволені типи файлів

- `image/jpeg` (.jpg)
- `image/png` (.png)
- `application/pdf` (.pdf)
- Максимальний розмір: **5 МБ**
- Максимальна кількість файлів: **5**

## Логи

| Файл             | Вміст                              |
|------------------|------------------------------------|
| logs/app.log     | Всі події (info+) у форматі JSON   |
| logs/error.log   | Тільки помилки                     |
| logs/access.log  | HTTP-запити у форматі Morgan       |
