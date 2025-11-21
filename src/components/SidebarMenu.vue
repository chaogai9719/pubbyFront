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
    >
      <el-sub-menu index="1">
        <template #title>
          <el-icon><setting /></el-icon>
          <span>系统管理</span>
        </template>
        <el-menu-item index="/users">用户管理</el-menu-item>
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
  background-color: #f5f5f5;
  border-right: 1px solid #e6e6e6;
  width: 200px;
}

.menu-header {
  padding: 16px;
  border-bottom: 1px solid #e6e6e6;
}

.menu-header h3 {
  margin: 0;
  color: #333;
}

.el-menu-vertical {
  border: none;
  height: calc(100% - 56px); /* 56px is header height */
}

.el-menu-item:focus {
  outline: none;
  background-color: #ecf5ff !important;
}
</style>