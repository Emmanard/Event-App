import { post } from '../http';

// Upload image to Cloudinary
export const uploadToCloudinary = async (file, folder = 'users') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id
    };
  } catch (error) {
    throw new Error('Upload failed: ' + error.message);
  }
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const response = await post('/api/cloudinary/delete', { publicId });
    return response.data;
  } catch (error) {
    throw new Error('Delete failed: ' + error.message);
  }
};
