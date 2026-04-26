const { upload, optimizeImage, deleteFile, uploadDir } = require('../services/fileUploadService');
const Event = require('../models/Event');
const path = require('path');
const fs = require('fs');

// Загрузка одного изображения
const uploadEventImage = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findByPk(eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Оптимизация изображения
    const optimizedPath = path.join(uploadDir, 'events', `optimized_${req.file.filename}`);
    await optimizeImage(req.file.path, optimizedPath);
    
    // Формируем URL
    const imageUrl = `/uploads/events/${req.file.filename}`;
    const optimizedUrl = `/uploads/events/optimized_${req.file.filename}`;
    
    // Обновляем событие
    const currentImages = event.images || [];
    currentImages.push({
      url: imageUrl,
      optimizedUrl: optimizedUrl,
      originalName: req.file.originalname,
      size: req.file.size,
      uploadedAt: new Date()
    });
    
    // Если это первое изображение, устанавливаем как превью
    if (!event.previewImage) {
      event.previewImage = optimizedUrl;
    }
    
    event.images = currentImages;
    await event.save();
    
    res.json({
      success: true,
      image: {
        url: imageUrl,
        optimizedUrl: optimizedUrl,
        originalName: req.file.originalname
      },
      event
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Удаление изображения
const deleteEventImage = async (req, res) => {
  try {
    const { eventId, imageIndex } = req.params;
    const event = await Event.findByPk(eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const images = event.images || [];
    const imageToDelete = images[imageIndex];
    
    if (!imageToDelete) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Удаляем файлы
    const filePath = path.join(uploadDir, 'events', path.basename(imageToDelete.url));
    const optimizedPath = path.join(uploadDir, 'events', path.basename(imageToDelete.optimizedUrl));
    
    deleteFile(filePath);
    deleteFile(optimizedPath);
    
    // Удаляем из массива
    images.splice(imageIndex, 1);
    event.images = images;
    
    // Если удалили превью, устанавливаем новое
    if (event.previewImage === imageToDelete.optimizedUrl && images.length > 0) {
      event.previewImage = images[0].optimizedUrl;
    } else if (images.length === 0) {
      event.previewImage = null;
    }
    
    await event.save();
    
    res.json({ success: true, event });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Обновление превью изображения
const setPreviewImage = async (req, res) => {
  try {
    const { eventId, imageIndex } = req.params;
    const event = await Event.findByPk(eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const images = event.images || [];
    const image = images[imageIndex];
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    event.previewImage = image.optimizedUrl;
    await event.save();
    
    res.json({ success: true, event });
  } catch (error) {
    console.error('Set preview error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadEventImage, deleteEventImage, setPreviewImage };
