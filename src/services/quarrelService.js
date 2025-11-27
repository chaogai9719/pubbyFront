import axios from 'axios';
import API_CONFIG from '../config/api';
import authService from './authService';

// 创建专门用于争吵记录服务的axios实例
const quarrelApiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 添加请求拦截器
quarrelApiClient.interceptors.request.use(
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
quarrelApiClient.interceptors.response.use(
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
   * 分页获取争吵记录列表
   * @param {Object} params 查询参数
   * @returns {Promise}
   */
  getQuarrels(params) {
    return quarrelApiClient.get('/quarrels/page', { params });
  },
  
  /**
   * 创建争吵记录
   * @param {Object} quarrelData 争吵记录数据
   * @returns {Promise}
   */
  createQuarrel(quarrelData) {
    return quarrelApiClient.post('/quarrels', quarrelData);
  },
  
  /**
   * 更新争吵记录
   * @param {Number} id 争吵记录ID
   * @param {Object} quarrelData 争吵记录数据
   * @returns {Promise}
   */
  updateQuarrel(id, quarrelData) {
    return quarrelApiClient.put(`/quarrels/${id}`, quarrelData);
  },
  
  /**
   * 删除争吵记录
   * @param {Number} id 争吵记录ID
   * @returns {Promise}
   */
  deleteQuarrel(id) {
    return quarrelApiClient.delete(`/quarrels/${id}`);
  }
};