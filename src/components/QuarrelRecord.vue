<template>
  <div class="quarrel-record">
    <div class="page-header">
      <h2>吵架记录</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAddQuarrel">
          添加吵架记录
        </el-button>
      </div>
    </div>
    
    <!-- 添加/编辑吵架记录的弹窗 -->
    <el-dialog
      :title="isEditMode ? '编辑吵架记录' : '添加吵架记录'"
      v-model="addQuarrelDialogVisible"
      width="500px"
      @close="handleCancelAddQuarrel"
    >
      <el-form
        :model="addQuarrelForm"
        :rules="addQuarrelRules"
        ref="addQuarrelFormRef"
        label-width="100px"
      >
        <el-form-item label="吵架主题" prop="theme">
          <el-input 
            v-model="addQuarrelForm.theme" 
            placeholder="请输入吵架主题"
            :disabled="isEditMode"
          />
        </el-form-item>
        <el-form-item label="吵架日期" prop="quarrelDate">
          <el-date-picker
            v-model="addQuarrelForm.quarrelDate"
            type="date"
            placeholder="请选择吵架日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="吵架原因" prop="reason">
          <el-input 
            v-model="addQuarrelForm.reason" 
            type="textarea"
            placeholder="请输入吵架原因"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="事后反思" prop="reflection">
          <el-input 
            v-model="addQuarrelForm.reflection" 
            type="textarea"
            placeholder="请输入事后反思"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancelAddQuarrel">取消</el-button>
          <el-button type="primary" @click="submitAddQuarrel" :loading="addQuarrelLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <div class="table-section">
      <el-card class="table-card">
        <el-table 
          :data="quarrels" 
          style="width: 100%" 
          v-loading="loading"
          stripe
          border
          height="100%"
          ref="quarrelTable"
        >
          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column prop="theme" label="吵架主题" width="150" />
          <el-table-column prop="quarrelDate" label="吵架日期" width="120" align="center">
            <template #default="scope">
              {{ formatDate(scope.row.quarrelDate) }}
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="吵架原因" />
          <el-table-column prop="reflection" label="事后反思" />
          <el-table-column prop="createBy" label="创建人" width="100" />
          <el-table-column prop="createTime" label="创建时间" width="180" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.createTime) }}
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
import quarrelService from '../services/quarrelService';

export default {
  name: 'QuarrelRecord',
  data() {
    return {
      // 防抖定时器
      resizeDebounceTimer: null,
      quarrels: [],
      loading: false,
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      
      // 添加吵架记录的弹窗控制
      addQuarrelDialogVisible: false,
      // 编辑模式标志
      isEditMode: false,
      // 当前编辑的吵架记录ID
      editingQuarrelId: null,
      addQuarrelForm: {
        theme: '',
        quarrelDate: '',
        reason: '',
        reflection: ''
      },
      addQuarrelRules: {
        theme: [
          { required: true, message: '请输入吵架主题', trigger: 'blur' }
        ],
        quarrelDate: [
          { required: true, message: '请选择吵架日期', trigger: 'change' }
        ]
      },
      addQuarrelLoading: false,
      addQuarrelFormRef: null
    };
  },
  mounted() {
    this.fetchQuarrels();
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
      // 当路由是吵架记录页面时，自动刷新列表
      if (to.name === 'Quarrels') {
        this.fetchQuarrels();
      }
    }
  },
  methods: {
    // 优化的窗口大小变化处理函数
    handleOptimizedResize() {
      this.$nextTick(() => {
        // 延迟执行布局重计算
        setTimeout(() => {
          this.$refs.quarrelTable?.doLayout?.();
        }, 50);
      });
    },
    
    async fetchQuarrels() {
      this.loading = true;
      try {
        const params = {
          page: this.pagination.currentPage - 1,
          size: this.pagination.pageSize
        };
        
        const response = await quarrelService.getQuarrels(params);
        this.quarrels = response.data.content || [];
        this.pagination.total = response.data.totalElements || 0;
        this.pagination.currentPage = (response.data.currentPage || 0) + 1;
      } catch (error) {
        console.error('获取吵架记录列表失败:', error);
        this.$message.error('获取吵架记录列表失败: ' + (error.response?.data?.message || error.message));
        this.quarrels = [];
        this.pagination.total = 0;
      } finally {
        this.loading = false;
      }
    },
    
    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.pagination.currentPage = 1;
      this.fetchQuarrels();
    },
    
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
      this.fetchQuarrels();
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    },
    
    formatDateTime(dateString) {
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
    
    handleAddQuarrel() {
      // 显示添加吵架记录弹窗
      this.isEditMode = false;
      this.addQuarrelDialogVisible = true;
    },
    
    handleCancelAddQuarrel() {
      // 取消添加/编辑吵架记录
      this.addQuarrelDialogVisible = false;
      this.resetAddQuarrelForm();
    },
    
    resetAddQuarrelForm() {
      // 重置添加吵架记录表单
      this.addQuarrelForm = {
        theme: '',
        quarrelDate: '',
        reason: '',
        reflection: ''
      };
      
      // 清除表单校验
      if (this.$refs.addQuarrelFormRef) {
        this.$refs.addQuarrelFormRef.resetFields();
      }
      
      // 重置编辑模式标志
      this.isEditMode = false;
      this.editingQuarrelId = null;
    },
    
    async submitAddQuarrel() {
      // 提交添加/编辑吵架记录
      this.$refs.addQuarrelFormRef.validate(async (valid) => {
        if (valid) {
          this.addQuarrelLoading = true;
          try {
            if (this.isEditMode) {
              // 编辑吵架记录
              const quarrelData = {
                theme: this.addQuarrelForm.theme,
                quarrelDate: this.addQuarrelForm.quarrelDate,
                reason: this.addQuarrelForm.reason,
                reflection: this.addQuarrelForm.reflection
              };
              
              await quarrelService.updateQuarrel(this.editingQuarrelId, quarrelData);
              this.$message.success('吵架记录更新成功');
            } else {
              // 添加吵架记录
              const quarrelData = {
                theme: this.addQuarrelForm.theme,
                quarrelDate: this.addQuarrelForm.quarrelDate,
                reason: this.addQuarrelForm.reason,
                reflection: this.addQuarrelForm.reflection
              };
              
              await quarrelService.createQuarrel(quarrelData);
              this.$message.success('吵架记录添加成功');
            }
            
            this.addQuarrelDialogVisible = false;
            this.resetAddQuarrelForm();
            // 重新获取吵架记录列表
            this.fetchQuarrels();
          } catch (error) {
            console.error('保存吵架记录失败:', error);
            this.$message.error('保存吵架记录失败: ' + (error.response?.data?.message || error.message));
          } finally {
            this.addQuarrelLoading = false;
          }
        }
      });
    },
    
    async handleEdit(row) {
      // 编辑吵架记录逻辑
      this.isEditMode = true;
      this.editingQuarrelId = row.id;
      
      // 填充表单数据
      this.addQuarrelForm.theme = row.theme;
      this.addQuarrelForm.quarrelDate = row.quarrelDate;
      this.addQuarrelForm.reason = row.reason || '';
      this.addQuarrelForm.reflection = row.reflection || '';
      
      // 显示弹窗
      this.addQuarrelDialogVisible = true;
    },
    
    handleDelete(row) {
      // 删除吵架记录逻辑
      this.$confirm(`确定要删除吵架记录 "${row.theme}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await quarrelService.deleteQuarrel(row.id);
          this.$message.success('删除成功');
          this.fetchQuarrels(); // 重新加载吵架记录列表
        } catch (error) {
          console.error('删除吵架记录失败:', error);
          this.$message.error('删除吵架记录失败: ' + (error.response?.data?.message || error.message));
        }
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    }
  }
};
</script>

<style scoped>
.quarrel-record {
  padding: 20px;
  height: calc(100vh - 60px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 解决 ResizeObserver 错误 */
.quarrel-record * {
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