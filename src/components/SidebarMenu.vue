<template>
  <div class="sidebar-menu">
    <div class="menu-header">
      <h3>管理系统</h3>
    </div>
    <el-menu
      :default-active="activeIndex"
      class="el-menu-vertical"
      @open="handleOpen"
      @close="handleClose"
      router
      background-color="#2c3e50"
      text-color="#ecf0f1"
      active-text-color="#3498db"
    >
      <!-- 添加首页菜单项 -->
      <el-menu-item index="/" class="home-menu-item">首页</el-menu-item>
      <el-menu-item index="/quarrels">吵架记录</el-menu-item>
      <el-menu-item index="/food-reviews">狗娃娃菜单</el-menu-item>
      <el-sub-menu index="1">
        <template #title>
          <el-icon><setting /></el-icon>
          <span>系统管理</span>
        </template>
        <el-menu-item index="/users">用户管理</el-menu-item>
        <el-menu-item index="/logs">操作日志</el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script>
export default {
  name: 'SidebarMenu',
  data() {
    return {
      activeIndex: '/'
    };
  },
  mounted() {
    this.activeIndex = this.$route.path;
  },
  watch: {
    '$route'(to) {
      this.activeIndex = to.path;
    }
  },
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    }
  }
};
</script>

<style scoped>
.sidebar-menu {
  height: 100%;
  background: linear-gradient(180deg, #2c3e50 0%, #1a2530 100%);
  width: 220px;
  box-shadow: 3px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.menu-header {
  padding: 20px;
  border-bottom: 1px solid #34495e;
  background: linear-gradient(90deg, #3498db 0%, #2c3e50 100%);
}

.menu-header h3 {
  margin: 0;
  color: white;
  font-size: 1.4rem;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.el-menu-vertical {
  border: none;
  flex: 1;
  background-color: transparent !important;
}

.el-menu-item:focus {
  outline: none;
  background-color: #34495e !important;
}

.el-menu-item:hover {
  background-color: #34495e !important;
}

.home-menu-item {
  text-align: center;
}

:deep(.home-menu-item .el-menu-item__content) {
  justify-content: center;
}

:deep(.el-sub-menu__title:hover) {
  background-color: #34495e !important;
}
</style>