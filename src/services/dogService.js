import axios from 'axios';
import API_CONFIG from '../config/api';
import authService from './authService';

// 创建专门用于狗狗照片服务的axios实例
const dogApiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 添加请求拦截器
dogApiClient.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    const token = authService.getValidToken();
    if (token) {
      config.headers.Authorization = token;
    } else {
      // 如果没有有效token，抛出错误
      return Promise.reject(new Error('未找到有效的认证信息'));
    }
    return config;
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
dogApiClient.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    return response;
  },
  error => {
    // 对响应错误做点什么
    if (error.response && error.response.status === 401) {
      // token过期或无效，清除本地存储
      authService.clearAuth();
      // 可以在这里添加跳转到登录页的逻辑
    }
    return Promise.reject(error);
  }
);

export default {
  /**
   * 获取狗狗照片列表
   * @returns {Promise}
   */
  getDogs() {
    return dogApiClient.get('/dogs');
  },
  
  /**
   * 创建狗狗照片
   * @param {Object} dogData 狗狗照片数据
   * @returns {Promise}
   */
  createDog(dogData) {
    return dogApiClient.post('/dogs', dogData);
  },
  
  /**
   * 更新狗狗照片
   * @param {Number} id 狗狗照片ID
   * @param {Object} dogData 狗狗照片数据
   * @returns {Promise}
   */
  updateDog(id, dogData) {
    return dogApiClient.put(`/dogs/${id}`, dogData);
  },
  
  /**
   * 删除狗狗照片
   * @param {Number} id 狗狗照片ID
   * @returns {Promise}
   */
  deleteDog(id) {
    return dogApiClient.delete(`/dogs/${id}`);
  },
  
  /**
   * 上传狗狗图片
   * @param {FormData} formData 包含图片文件的表单数据
   * @returns {Promise}
   */
  uploadDogImage(formData) {
    return dogApiClient.post('/dogs/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  /**
   * 获取图片完整URL（用于img标签的src属性）
   * @param {String} imageName 图片名称
   * @returns {String} 图片完整URL
   */
  getImageUrl(imageName) {
    return `${API_CONFIG.BASE_URL}/dogs/image/${imageName}`;
  },
  
  /**
   * 获取图片的Blob URL用于预览
   * @param {String} imageName 图片名称
   * @returns {Promise<String>} 返回可用于img标签src属性的blob URL
   */
  async getImageBlobUrl(imageName) {
    try {
      const response = await dogApiClient.get(`/dogs/image/${imageName}`, {
        responseType: 'blob'
      });
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error('获取图片失败:', error);
      return null;
    }
  }
};