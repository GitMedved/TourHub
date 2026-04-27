const express = require('express');
const router = express.Router();
const { upload } = require('../services/fileUploadService');
const { uploadEventImage, deleteEventImage, setPreviewImage } = require('../controllers/uploadController');
const { authMiddleware } = require('../middleware/auth');

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// Загрузка временного изображения (без eventId)
router.post('/temp', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const url = `/uploads/events/${req.file.filename}`;
    res.json({ url, path: url, filename: req.file.filename });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Загрузка изображения для события
router.post('/events/:eventId/images', upload.single('image'), uploadEventImage);

// Удаление изображения
router.delete('/events/:eventId/images/:imageIndex', deleteEventImage);

// Установка основного изображения
router.put('/events/:eventId/images/:imageIndex/preview', setPreviewImage);

module.exports = router;
