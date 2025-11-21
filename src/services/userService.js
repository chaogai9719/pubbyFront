import axios from 'axios';
import API_CONFIG from '../config/api';
import authService from './authService';

// 创建专门用于用户服务的axios实例
const userApiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 添加请求拦截器
userApiClient.interceptors.request.use(
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
userApiClient.interceptors.response.use(
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
   * 获取用户列表
   * @returns {Promise}
   */
  getUsers() {
    return userApiClient.get('/users');
  },
  
  /**
   * 根据ID获取用户详情
   * @param {Number} id 用户ID
   * @returns {Promise}
   */
  getUserById(id) {
    return userApiClient.get(`/users/${id}`);
  },
  
  /**
   * 创建用户
   * @param {Object} userData 用户数据
   * @returns {Promise}
   */
  createUser(userData) {
    return userApiClient.post('/users', userData);
  },
  
  /**
   * 更新用户
   * @param {Number} id 用户ID
   * @param {Object} userData 用户数据
   * @returns {Promise}
   */
  updateUser(id, userData) {
    return userApiClient.put(`/users/${id}`, userData);
  },
  
  /**
   * 删除用户
   * @param {Number} id 用户ID
   * @returns {Promise}
   */
  deleteUser(id) {
    return userApiClient.delete(`/users/${id}`);
  }
};