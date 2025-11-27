<template>
  <div class="user-management">
    <div class="page-header">
      <h2>用户管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAddUser">
          添加用户
        </el-button>
      </div>
    </div>
    
    <!-- 添加/编辑用户的弹窗 -->
    <el-dialog
      :title="isEditMode ? '编辑用户' : '添加用户'"
      v-model="addUserDialogVisible"
      width="500px"
      @close="handleCancelAddUser"
    >
      <el-form
        :model="addUserForm"
        :rules="addUserRules"
        ref="addUserFormRef"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="addUserForm.username" 
            placeholder="请输入用户名"
            :disabled="isEditMode"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="addUserForm.password" 
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input 
            v-model="addUserForm.nickname" 
            placeholder="请输入昵称"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="addUserForm.email" 
            placeholder="请输入邮箱"
          />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input 
            v-model="addUserForm.phone" 
            placeholder="请输入电话"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select 
            v-model="addUserForm.status" 
            placeholder="请选择状态"
            style="width: 100%"
          >
            <el-option label="启用" :value="1"></el-option>
            <el-option label="禁用" :value="0"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancelAddUser">取消</el-button>
          <el-button type="primary" @click="submitAddUser" :loading="addUserLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <div class="filter-section">
      <el-card class="filter-card">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="用户名">
            <el-input 
              v-model="filterForm.username" 
              placeholder="请输入用户名" 
              clearable
              @clear="resetFilter"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchUsers">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    
    <div class="table-section">
      <el-card class="table-card">
        <el-table 
          :data="users" 
          style="width: 100%" 
          v-loading="loading"
          stripe
          border
          height="100%"
          ref="userTable"
        >
          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column prop="username" label="用户名" width="150" />
          <el-table-column prop="nickname" label="昵称" width="150" />
          <el-table-column prop="email" label="邮箱" />
          <el-table-column prop="phone" label="电话" width="150" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" align="center">
            <template #default="scope">
              {{ formatDate(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="scope">
              <el-button size="small" type="primary" @click="handleEdit(scope.row)" plain>
                编辑
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)" plain>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-section" v-if="pagination.total > 10">
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
      </el-card>
    </div>
  </div>
</template>

<script>
import userService from '../services/userService';

export default {
  name: 'UserManagement',
  data() {
    return {
      // 防抖定时器
      resizeDebounceTimer: null,
      filterForm: {
        username: ''
      },
      users: [],
      loading: false,
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      isSearching: false,
      
      // 添加用户的弹窗控制
      addUserDialogVisible: false,
      // 编辑模式标志
      isEditMode: false,
      // 当前编辑的用户ID
      editingUserId: null,
      addUserForm: {
        username: '',
        password: '',
        nickname: '',
        email: '',
        phone: '',
        status: 1
      },
      addUserRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择用户状态', trigger: 'change' }
        ]
      },
      addUserLoading: false,
      addUserFormRef: null
    };
  },
  mounted() {
    this.fetchUsers();
    // 使用全局优化的 resize 事件
    window.addEventListener('optimizedResize', this.handleOptimizedResize);
  },
  beforeUnmount() {
    // 清理事件监听器
    window.removeEventListener('optimizedResize', this.handleOptimizedResize);
    // 清理定时器
    if (this.resizeDebounceTimer) {
      clearTimeout(this.resizeDebounceTimer);
    }
  },
  // 添加路由监听，当路由被激活时刷新数据
  watch: {
    '$route'(to) {
      // 当路由是用户管理页面时，自动刷新列表
      if (to.name === 'Users') {
        this.fetchUsers();
      }
    }
  },
  methods: {
    // 优化的窗口大小变化处理函数
    handleOptimizedResize() {
      this.$nextTick(() => {
        // 延迟执行布局重计算
        setTimeout(() => {
          this.$refs.userTable?.doLayout?.();
        }, 50);
      });
    },
    
    async fetchUsers() {
      this.loading = true;
      try {
        let response;
        if (this.filterForm.username) {
          // 使用用户名搜索
          this.isSearching = true;
          response = await userService.getUserByUsername(this.filterForm.username);
          // 搜索结果是一个用户对象而不是数组，需要转换成数组
          const userData = response.data;
          this.users = Array.isArray(userData) ? userData : [userData];
          this.pagination.total = this.users.length;
        } else {
          // 获取所有用户
          this.isSearching = false;
          response = await userService.getUsers();
          this.users = response.data;
          this.pagination.total = response.data.length;
        }
      } catch (error) {
        console.error('获取用户列表失败:', error);
        this.$message.error('获取用户列表失败: ' + (error.response?.data?.message || error.message));
        this.users = [];
        this.pagination.total = 0;
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
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },
    
    handleAddUser() {
      // 显示添加用户弹窗
      this.isEditMode = false;
      this.addUserDialogVisible = true;
    },
    
    handleCancelAddUser() {
      // 取消添加/编辑用户
      this.addUserDialogVisible = false;
      this.resetAddUserForm();
    },
    
    resetAddUserForm() {
      // 重置添加用户表单
      this.addUserForm = {
        username: '',
        password: '',
        nickname: '',
        email: '',
        phone: '',
        status: 1
      };
      
      // 清除表单校验
      if (this.$refs.addUserFormRef) {
        this.$refs.addUserFormRef.resetFields();
      }
      
      // 重置编辑模式标志
      this.isEditMode = false;
      this.editingUserId = null;
    },
    
    async submitAddUser() {
      // 提交添加/编辑用户
      this.$refs.addUserFormRef.validate(async (valid) => {
        if (valid) {
          this.addUserLoading = true;
          try {
            if (this.isEditMode) {
              // 编辑用户
              // 准备提交的数据，只包含必要的字段
              const userData = {
                username: this.addUserForm.username,
                password: this.addUserForm.password,
                status: this.addUserForm.status
              };
              
              // 只有当字段有值时才添加到请求中
              if (this.addUserForm.nickname) {
                userData.nickname = this.addUserForm.nickname;
              }
              if (this.addUserForm.email) {
                userData.email = this.addUserForm.email;
              }
              if (this.addUserForm.phone) {
                userData.phone = this.addUserForm.phone;
              }
              
              await userService.updateUser(this.editingUserId, userData);
              this.$message.success('用户更新成功');
            } else {
              // 添加用户
              // 准备提交的数据，只包含必要的字段
              const userData = {
                username: this.addUserForm.username,
                password: this.addUserForm.password,
                status: this.addUserForm.status
              };
              
              // 只有当字段有值时才添加到请求中
              if (this.addUserForm.nickname) {
                userData.nickname = this.addUserForm.nickname;
              }
              if (this.addUserForm.email) {
                userData.email = this.addUserForm.email;
              }
              if (this.addUserForm.phone) {
                userData.phone = this.addUserForm.phone;
              }
              
              await userService.createUser(userData);
              this.$message.success('用户添加成功');
            }
            
            this.addUserDialogVisible = false;
            this.resetAddUserForm();
            // 重新获取用户列表
            this.fetchUsers();
          } catch (error) {
            console.error('保存用户失败:', error);
            this.$message.error('保存用户失败: ' + (error.response?.data?.message || error.message));
          } finally {
            this.addUserLoading = false;
          }
        }
      });
    },
    
    async handleEdit(row) {
      // 编辑用户逻辑
      this.isEditMode = true;
      this.editingUserId = row.id;
      
      // 填充表单数据
      this.addUserForm.username = row.username;
      this.addUserForm.password = '';
      this.addUserForm.nickname = row.nickname || '';
      this.addUserForm.email = row.email || '';
      this.addUserForm.phone = row.phone || '';
      this.addUserForm.status = row.status;
      
      // 显示弹窗
      this.addUserDialogVisible = true;
    },
    
    handleDelete(row) {
      // 删除用户逻辑
      this.$confirm(`确定要删除用户 ${row.username} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await userService.deleteUser(row.id);
          this.$message.success('删除成功');
          this.fetchUsers(); // 重新加载用户列表
        } catch (error) {
          console.error('删除用户失败:', error);
          this.$message.error('删除用户失败: ' + (error.response?.data?.message || error.message));
        }
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    }
  }
};
</script>

<style scoped>
.user-management {
  padding: 20px;
  height: calc(100vh - 60px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 解决 ResizeObserver 错误 */
.user-management * {
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: linear-gradient(90deg, #2c3e50 0%, #3498db 100%);
  border-radius: 8px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.page-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.table-section {
  margin-bottom: 20px;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-section .table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-card .el-table {
  flex: 1;
  overflow: auto;
}

.table-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  /* 固定高度以避免 ResizeObserver 问题 */
  min-height: 400px;
}

.pagination-section {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>