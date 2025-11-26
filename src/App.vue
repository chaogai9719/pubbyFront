<template>
  <div id="app">
    <TopNavbar :title="navbarTitle" />
    <div class="layout-container">
      <SidebarMenu v-if="showSidebar" />
      <div class="main-content" :class="{ 'full-width': !showSidebar }">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" :key="$route.fullPath" />
          </keep-alive>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script>
import SidebarMenu from './components/SidebarMenu.vue';
import TopNavbar from './components/TopNavbar.vue';

export default {
  name: 'App',
  components: {
    SidebarMenu,
    TopNavbar
  },
  computed: {
    showSidebar() {
      // 在登录页面不显示侧边栏
      return this.$route.name !== 'Login';
    }
  },
  data() {
    return {
      navbarTitle: 'Pubby 管理系统'
    };
  },
  mounted() {
    // 添加全局防抖处理
    this.initGlobalResizeHandler();
  },
  methods: {
    initGlobalResizeHandler() {
      let resizeTimer = null;
      const handleResize = () => {
        if (resizeTimer) {
          clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(() => {
          // 触发自定义事件，让子组件可以监听
          window.dispatchEvent(new CustomEvent('optimizedResize'));
        }, 300);
      };
      
      window.addEventListener('resize', handleResize);
    }
  }
};
</script>

<style>
#app {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
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

.layout-container {
  display: flex;
  flex: 1;
  min-height: 0;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow: hidden;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(5px);
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  height: calc(100vh - 60px);
  box-sizing: border-box;
}

.main-content.full-width {
  width: 100%;
}

/* Element Plus 样式修复 */
.el-menu {
  border-right: none !important;
}

/* 全局解决 ResizeObserver 错误 */
* {
  box-sizing: border-box;
}
</style>