<template>
  <div id="app">
    <div class="layout-container">
      <SidebarMenu v-if="showSidebar" />
      <div class="main-content" :class="{ 'full-width': !showSidebar }">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import SidebarMenu from './components/SidebarMenu.vue';

export default {
  name: 'App',
  components: {
    SidebarMenu
  },
  computed: {
    showSidebar() {
      // 在登录页面不显示侧边栏
      return this.$route.name !== 'Login';
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
  overflow: hidden;
}

.layout-container {
  display: flex;
  height: 100%;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.main-content.full-width {
  width: 100%;
}

/* Element Plus 样式修复 */
.el-menu {
  border-right: none !important;
}
</style>