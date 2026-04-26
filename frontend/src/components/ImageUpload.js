import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const ImageUpload = ({ eventId, onImageUploaded }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const response = await api.post(`/upload/events/${eventId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Изображение загружено');
      onImageUploaded(response.data.event);
    } catch (error) {
      toast.error('Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload">
      <label className="upload-button">
        <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
        {uploading ? 'Загрузка...' : '📷 Загрузить фото'}
      </label>
    </div>
  );
};

export default ImageUpload;
