<template>
  <div class="hello-wrapper">
    <!-- <div class="hello-content">
      <div class="welcome-card">
        <h1>{{ msg }}</h1>
        <p>欢迎使用 Pubby 管理系统</p>
        <div class="card-actions">
          <el-button type="primary" @click="goToUserManagement">用户管理</el-button>
          <el-button type="success" @click="goToOperationLog">操作日志</el-button>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  methods: {
    goToUserManagement() {
      this.$router.push('/users');
    },
    goToOperationLog() {
      this.$router.push('/logs');
    }
  }
};
</script>

<style scoped>
.hello-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* 添加背景图片 */
  background-image: url('@/assets/pubby.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
}

.hello-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
}

.welcome-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  text-align: center;
  max-width: 600px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.3s ease;
}

.welcome-card:hover {
  transform: translateY(-5px);
}

h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

p {
  color: #7f8c8d;
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.card-actions {
  margin-top: 2rem;
}
</style>