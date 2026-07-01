import apiClient from '../api/interceptors';
import { ENDPOINTS } from '../api/endpoints';

const uploadService = {
  /**
   * Uploads an image file and returns the remote URL.
   * @param {File} file
   * @returns {Promise<{ image_url: string }>}
   */
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post(ENDPOINTS.UPLOAD, formData);
    return data;
  },
};

export default uploadService;
