<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <img src="../assets/logo.png" alt="Logo" class="login-logo" />
        <h2>用户登录</h2>
      </div>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名"
            prefix-icon="el-icon-user"
            size="large"
            clearable
          />
        </div>
        
        <div class="form-group">
          <el-input 
            v-model="loginForm.password" 
            type="password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            size="large"
            show-password
          />
        </div>
        
        <div class="form-group">
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
        </div>
        
        <div class="form-group">
          <el-button 
            type="primary" 
            native-type="submit" 
            :loading="loading"
            size="large"
            round
            class="login-button"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </div>
        
        <div v-if="error" class="error-message">
          <el-alert
            :title="error"
            type="error"
            show-icon
            :closable="false"
          />
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
      rememberMe: false,
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
  padding: 20px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  overflow: hidden;
}

@keyframes gradientBG {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.login-card {
  width: 100%;
  max-width: 430px;
  padding: 40px 30px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-logo {
  width: 80px;
  height: 80px;
  margin-bottom: 15px;
}

.login-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.8rem;
}

.login-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.login-button {
  width: 100%;
  margin-top: 10px;
}

.error-message {
  margin-top: 15px;
}
</style>