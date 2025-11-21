<template>
  <div class="user-management">
    <div class="page-header">
      <h2>用户管理</h2>
    </div>
    
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="用户名">
          <el-input v-model="filterForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchUsers">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <div class="table-section">
      <el-table :data="users" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="180" />
        <el-table-column prop="nickname" label="昵称" width="180" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="phone" label="电话" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="200">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import userService from '../services/userService';

export default {
  name: 'UserManagement',
  data() {
    return {
      filterForm: {
        username: ''
      },
      users: [],
      loading: false,
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      }
    };
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      this.loading = true;
      try {
        const response = await userService.getUsers();
        this.users = response.data;
        this.pagination.total = response.data.length;
      } catch (error) {
        console.error('获取用户列表失败:', error);
        this.$message.error('获取用户列表失败');
      } finally {
        this.loading = false;
      }
    },
    
    resetFilter() {
      this.filterForm.username = '';
      this.fetchUsers();
    },
    
    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.fetchUsers();
    },
    
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
      this.fetchUsers();
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString();
    }
  }
};
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #e6e6e6;
  padding-bottom: 10px;
}

.filter-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.table-section {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination-section {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>