<template>
  <div class="operation-log-container">
    <div class="filter-section">
      <el-card class="filter-card">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="操作模块">
            <el-input v-model="filterForm.operationModule" placeholder="请输入操作模块" />
          </el-form-item>
          <el-form-item label="操作类型">
            <el-select v-model="filterForm.operationType" placeholder="请选择操作类型" clearable class="operation-type-select">
              <el-option label="新增" value="INSERT"></el-option>
              <el-option label="修改" value="UPDATE"></el-option>
              <el-option label="删除" value="DELETE"></el-option>
              <el-option label="登录" value="LOGIN"></el-option>
              <el-option label="登出" value="LOGOUT"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="操作人员">
            <el-input v-model="filterForm.operator" placeholder="请输入操作人员" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchLogs">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    
    <div class="table-section">
      <el-card class="table-card">
        <el-table :data="logs" class="log-table" v-loading="loading" stripe border height="100%" ref="logTable">
          <el-table-column prop="id" label="ID" min-width="80" align="center" />
          <el-table-column prop="operationModule" label="操作模块" min-width="120"/>
          <el-table-column prop="operationType" label="操作类型" min-width="100">
            <template #default="scope">
              <el-tag :type="getTypeTag(scope.row.operationType)">
                {{ formatOperationType(scope.row.operationType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="operator" label="操作人员" min-width="100"/>
          <el-table-column prop="operationTime" label="操作时间" min-width="160">
            <template #default="scope">
              {{ formatDate(scope.row.operationTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="ipAddress" label="IP地址" min-width="130"/>
          <el-table-column prop="executionTime" label="执行时间(ms)" min-width="120"/>
          <el-table-column prop="status" label="状态" min-width="80">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-section">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import logService from '../services/logService';

export default {
  name: 'OperationLog',
  data() {
    return {
      // 防抖定时器
      resizeDebounceTimer: null,
      logs: [],
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      filterForm: {
        operationModule: '',
        operationType: '',
        operator: ''
      }
    };
  },
  mounted() {
    this.fetchLogs();
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
  methods: {
    // 优化的窗口大小变化处理函数
    handleOptimizedResize() {
      this.$nextTick(() => {
        // 延迟执行布局重计算
        setTimeout(() => {
          this.$refs.logTable?.doLayout?.();
        }, 50);
      });
    },
    
    async fetchLogs() {
      this.loading = true;
      try {
        const params = {
          page: this.currentPage - 1,
          size: this.pageSize,
          operationModule: this.filterForm.operationModule || undefined,
          operationType: this.filterForm.operationType || undefined,
          operator: this.filterForm.operator || undefined
        };
        
        const response = await logService.getLogs(params);
        
        this.logs = response.data.content || [];
        this.total = response.data.totalElements || 0;
        this.currentPage = (response.data.currentPage || 0) + 1;
      } catch (error) {
        console.error('获取操作日志失败:', error);
        this.$message.error('获取操作日志失败: ' + (error.response?.data?.message || error.message));
      } finally {
        this.loading = false;
      }
    },
    
    resetFilter() {
      this.filterForm = {
        operationModule: '',
        operationType: '',
        operator: ''
      };
      this.fetchLogs();
    },
    
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.fetchLogs();
    },
    
    handleCurrentChange(val) {
      this.currentPage = val;
      this.fetchLogs();
    },
    
    getTypeTag(type) {
      switch (type) {
        case 'INSERT':
          return 'success';
        case 'UPDATE':
          return 'warning';
        case 'DELETE':
          return 'danger';
        case 'LOGOUT':
          return 'info';
        default:
          return '';
      }
    },
    
    formatOperationType(type) {
      const map = {
        'INSERT': '新增',
        'UPDATE': '修改',
        'DELETE': '删除',
        'LOGIN': '登录',
        'LOGOUT': '登出'
      };
      return map[type] || type;
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN');
    }
  }
};
</script>

<style scoped>
.operation-log-container {
  padding: 20px;
  height: calc(100vh - 60px);
  overflow: auto;
  display: flex;
  flex-direction: column;
}

/* 解决 ResizeObserver 错误 */
.operation-log-container * {
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
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.table-section .table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
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
  overflow: auto;
  height: 100%;
  /* 固定高度以避免 ResizeObserver 问题 */
  min-height: 400px;
}

.pagination-section {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.log-table {
  width: 100%;
  table-layout: fixed;
}

.operation-type-select {
  width: 150px;
}

</style>