<template>
  <div class="top-navbar">
    <div class="navbar-title">{{ title }}</div>
    <div v-if="currentUser" class="navbar-actions">
      <el-dropdown @command="handleCommand">
        <span class="el-dropdown-link">
          {{ currentUser.username }}<i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import authService from '../services/authService';

export default {
  name: 'TopNavbar',
  props: {
    title: {
      type: String,
      default: '系统标题'
    }
  },
  data() {
    return {
      currentUser: null
    };
  },
  mounted() {
    this.currentUser = authService.getCurrentUser();
    // 监听路由变化，确保在登录后能及时更新用户信息
    this.$router.afterEach(this.onRouteChange);
  },
  methods: {
    onRouteChange() {
      // 路由变化时更新当前用户信息
      this.currentUser = authService.getCurrentUser();
    },
    handleCommand(command) {
      switch (command) {
        case 'logout':
          this.logout();
          break;
        case 'profile':
          // 进入个人资料页面
          break;
        case 'settings':
          // 进入设置页面
          break;
      }
    },
    logout() {
      authService.logout().then(() => {
        this.$router.push({ name: 'Login' });
      }).catch(() => {
        // 即使登出请求失败，也跳转到登录页面
        this.$router.push({ name: 'Login' });
      });
    }
  },
  beforeUnmount() {
    // 清理路由监听
    this.$router.afterEach(null);
  }
};
</script>

<style scoped>
.top-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, #2c3e50 0%, #3498db 100%);
  color: white;
  padding: 0 20px;
  height: 60px;
  box-shadow: 0 2px 10px rgba(0,0,0,.15);
  z-index: 1000;
}

.navbar-title {
  font-size: 1.5rem;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.navbar-actions {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  cursor: pointer;
  color: #fff;
  font-size: 1rem;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.el-dropdown-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>