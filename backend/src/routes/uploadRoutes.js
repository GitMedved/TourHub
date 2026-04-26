const express = require('express');
const router = express.Router();
const { upload } = require('../services/fileUploadService');
const { uploadEventImage, deleteEventImage, setPreviewImage } = require('../controllers/uploadController');
const { authMiddleware } = require('../middleware/auth');

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// Загрузка изображения для события
router.post('/events/:eventId/images', upload.single('image'), uploadEventImage);

// Удаление изображения
router.delete('/events/:eventId/images/:imageIndex', deleteEventImage);

// Установка основного изображения
router.put('/events/:eventId/images/:imageIndex/preview', setPreviewImage);

module.exports = router;
