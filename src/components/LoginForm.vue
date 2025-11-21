<template>
  <div class="login-container">
    <div class="login-form">
      <h2>用户登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名:</label>
          <input 
            id="username"
            v-model="loginForm.username" 
            type="text" 
            placeholder="请输入用户名"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码:</label>
          <input 
            id="password"
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码"
            required
          />
        </div>
        
        <div class="form-group">
          <button type="submit" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import authService from '../services/authService';

export default {
  name: 'LoginForm',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loading: false,
      error: ''
    };
  },
  methods: {
    async handleLogin() {
      // 简单的表单验证
      if (!this.loginForm.username || !this.loginForm.password) {
        this.error = '用户名和密码不能为空';
        return;
      }

      if (this.loginForm.password.length < 6) {
        this.error = '密码长度不能少于6位';
        return;
      }

      this.loading = true;
      this.error = '';

      try {
        const response = await authService.login(this.loginForm);
        // 登录成功，保存token并跳转到主页
        authService.setAuth(response.data.token, response.data.user);
        this.$router.push({ name: 'Home' });
      } catch (err) {
        this.error = err.message || '登录失败，请检查用户名和密码';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-form {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.login-form h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-group button {
  width: 100%;
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.form-group button:hover:not(:disabled) {
  background-color: #359c6d;
}

.form-group button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  text-align: center;
  margin-top: 10px;
}
</style>