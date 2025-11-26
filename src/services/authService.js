import axios from 'axios';
import API_CONFIG from '../config/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 添加请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('token');
    if (token) {
      // 验证token格式是否基本合法
      if (isValidTokenFormat(token)) {
        config.headers.Authorization = token;
      } else {
        // 如果token格式不正确，清除它
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return config;
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
apiClient.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    return response;
  },
  error => {
    // 对响应错误做点什么
    if (error.response && error.response.status === 401) {
      // token过期或无效，清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 可以在这里添加跳转到登录页的逻辑
    }
    return Promise.reject(error);
  }
);

/**
 * 验证JWT token的基本格式
 * @param {String} token JWT token
 * @returns {Boolean} token是否格式正确
 */
function isValidTokenFormat(token) {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // JWT应该由三部分组成，用点分隔
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  
  // 每部分应该是base64url编码
  const base64UrlRegex = /^[A-Za-z0-9-_]+$/;
  return parts.every(part => base64UrlRegex.test(part));
}

export default {
  /**
   * 用户登录
   * @param {Object} credentials 登录凭证 {username, password}
   * @returns {Promise}
   */
  login(credentials) {
    return apiClient.post('/auth/login', credentials);
  },

  /**
   * 获取当前用户信息
   * @returns {Promise}
   */
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * 保存认证信息
   * @param {String} token JWT token
   * @param {Object} user 用户信息
   */
  setAuth(token, user) {
    // 保存前验证token格式
    if (token && isValidTokenFormat(token)) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      throw new Error('无效的token格式');
    }
  },

  /**
   * 清除认证信息
   */
  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * 检查是否已认证
   * @returns {Boolean}
   */
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token && isValidTokenFormat(token);
  },
  
  /**
   * 获取有效的认证token
   * @returns {String|null} 有效的token或null
   */
  getValidToken() {
    const token = localStorage.getItem('token');
    if (token && isValidTokenFormat(token)) {
      return token;
    } else {
      // 如果token无效，则清理掉
      this.clearAuth();
      return null;
    }
  },

  /**
   * 用户登出
   * @returns {Promise}
   */
  logout() {
    const token = this.getValidToken();
    if (token) {
      // 向后端发送登出请求
      return apiClient.post('/auth/logout', {}, {
        headers: {
          'Authorization': token
        }
      }).finally(() => {
        // 无论请求成功与否，都要清除本地认证信息
        this.clearAuth();
      });
    } else {
      // 即使没有有效token，也要确保清除本地认证信息
      this.clearAuth();
      return Promise.resolve();
    }
  }
};