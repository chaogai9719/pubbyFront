<template>
  <div class="dog-gallery">
    <div class="page-header">
      <h2>狗娃娃照片墙</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAddDog">
          添加狗狗照片
        </el-button>
      </div>
    </div>
    
    <!-- 添加/编辑狗狗照片的弹窗 -->
    <el-dialog
      :title="isEditMode ? '编辑狗狗照片' : '添加狗狗照片'"
      v-model="addDogDialogVisible"
      width="500px"
      @close="handleCancelAddDog"
    >
      <el-form
        :model="addDogForm"
        :rules="addDogRules"
        ref="addDogFormRef"
        label-width="100px"
      >
        <el-form-item label="狗狗图片" prop="dogImage" v-if="!isEditMode">
          <el-upload
            class="dog-image-uploader"
            :action="uploadImageUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleImageSuccess"
            :before-upload="beforeImageUpload"
          >
            <img v-if="addDogForm.dogImage" :src="getCachedImagePreviewUrl(addDogForm.dogImage)" class="dog-image">
            <i v-else class="el-icon-plus dog-image-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="addDogForm.description" 
            type="textarea"
            placeholder="请输入描述"
            :rows="4"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancelAddDog">取消</el-button>
          <el-button type="primary" @click="submitAddDog" :loading="addDogLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 查看大图的弹窗 -->
    <el-dialog
      v-model="previewDialogVisible"
      width="80%"
      top="50px"
      @close="handlePreviewClose"
    >
      <img :src="previewImageUrl" class="preview-image" alt="狗狗照片">
    </el-dialog>
    
    <div class="gallery-container">
      <div 
        v-for="dog in dogs" 
        :key="dog.id" 
        class="dog-card"
        @mouseenter="showActions(dog.id)"
        @mouseleave="hideActions(dog.id)"
      >
        <div class="dog-image-wrapper" @click="previewImage(dog.dogImage)">
          <img 
            v-if="dog.dogImage" 
            :src="getCachedImagePreviewUrl(dog.dogImage)" 
            :alt="dog.description"
            class="dog-image-display"
          >
          <div v-else class="no-image">暂无图片</div>
        </div>
        <div class="dog-description">
          <p>{{ dog.description }}</p>
        </div>
        <div class="dog-actions" v-show="activeCard === dog.id">
          <el-button size="small" type="primary" @click.stop="handleEdit(dog)" plain>
            编辑
          </el-button>
          <el-button size="small" type="danger" @click.stop="handleDelete(dog)" plain>
            删除
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dogService from '../services/dogService';

export default {
  name: 'DogGallery',
  data() {
    return {
      dogs: [],
      loading: false,
      activeCard: null,
      
      // 添加狗狗照片的弹窗控制
      addDogDialogVisible: false,
      // 编辑模式标志
      isEditMode: false,
      // 当前编辑的狗狗照片ID
      editingDogId: null,
      addDogForm: {
        dogImage: '',
        description: ''
      },
      addDogRules: {
        dogImage: [
          { required: true, message: '请上传狗狗图片', trigger: 'change' }
        ],
        description: [
          { required: true, message: '请输入描述', trigger: 'blur' }
        ]
      },
      addDogLoading: false,
      addDogFormRef: null,
      
      // 查看大图弹窗控制
      previewDialogVisible: false,
      previewImageUrl: '',
      
      // 上传相关
      uploadImageUrl: '/api/dogs/upload-image',
      
      // 存储图片预览URL的对象
      imagePreviewUrls: {}
    };
  },
  computed: {
    uploadHeaders() {
      return {
        Authorization: localStorage.getItem('token') || ''
      };
    }
  },
  mounted() {
    this.fetchDogs();
  },
  // 添加路由监听，当路由被激活时刷新数据
  watch: {
    '$route'(to) {
      // 当路由是狗狗照片墙页面时，自动刷新列表
      if (to.name === 'DogGallery') {
        this.fetchDogs();
      }
    }
  },
  methods: {
    async fetchDogs() {
      this.loading = true;
      try {
        const response = await dogService.getDogs();
        this.dogs = response.data || [];
        
        // 为所有有图片的狗狗生成预览URL
        for (const dog of this.dogs) {
          if (dog.dogImage && !this.imagePreviewUrls[dog.dogImage]) {
            this.imagePreviewUrls[dog.dogImage] = await dogService.getImageBlobUrl(dog.dogImage);
          }
        }
      } catch (error) {
        console.error('获取狗狗照片列表失败:', error);
        this.$message.error('获取狗狗照片列表失败: ' + (error.response?.data?.message || error.message));
        this.dogs = [];
      } finally {
        this.loading = false;
      }
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
    
    getCachedImagePreviewUrl(imageName) {
      // 同步方法，仅返回已缓存的URL，不发起新的请求
      return this.imagePreviewUrls[imageName] || '';
    },
    
    showActions(id) {
      this.activeCard = id;
    },
    
    hideActions() {
      this.activeCard = null;
    },
    
    previewImage(imageName) {
      if (imageName) {
        this.previewImageUrl = this.imagePreviewUrls[imageName];
        this.previewDialogVisible = true;
      }
    },
    
    handlePreviewClose() {
      this.previewImageUrl = '';
      this.previewDialogVisible = false;
    },
    
    handleAddDog() {
      // 显示添加狗狗照片弹窗
      this.isEditMode = false;
      this.addDogDialogVisible = true;
    },
    
    handleCancelAddDog() {
      // 取消添加/编辑狗狗照片
      this.addDogDialogVisible = false;
      this.resetAddDogForm();
    },
    
    resetAddDogForm() {
      // 重置添加狗狗照片表单
      this.addDogForm = {
        dogImage: '',
        description: ''
      };
      
      // 清除表单校验
      if (this.$refs.addDogFormRef) {
        this.$refs.addDogFormRef.resetFields();
      }
      
      // 重置编辑模式标志
      this.isEditMode = false;
      this.editingDogId = null;
    },
    
    beforeImageUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;
      
      if (!isJPG) {
        this.$message.error('上传图片只能是 JPG/PNG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },
    
    handleImageSuccess(response) {
      // 处理图片上传成功
      this.addDogForm.dogImage = response.data || response;
      this.$message.success('图片上传成功');
    },
    
    async submitAddDog() {
      // 提交添加/编辑狗狗照片
      this.$refs.addDogFormRef.validate(async (valid) => {
        if (valid) {
          this.addDogLoading = true;
          try {
            if (this.isEditMode) {
              // 编辑狗狗照片（只能修改描述）
              const dogData = {
                description: this.addDogForm.description
              };
              
              await dogService.updateDog(this.editingDogId, dogData);
              this.$message.success('狗狗照片更新成功');
            } else {
              // 添加狗狗照片
              const dogData = {
                dogImage: this.addDogForm.dogImage,
                description: this.addDogForm.description
              };
              
              await dogService.createDog(dogData);
              this.$message.success('狗狗照片添加成功');
            }
            
            this.addDogDialogVisible = false;
            this.resetAddDogForm();
            // 重新获取狗狗照片列表
            this.fetchDogs();
          } catch (error) {
            console.error('保存狗狗照片失败:', error);
            this.$message.error('保存狗狗照片失败: ' + (error.response?.data?.message || error.message));
          } finally {
            this.addDogLoading = false;
          }
        }
      });
    },
    
    async handleEdit(row) {
      // 编辑狗狗照片逻辑
      this.isEditMode = true;
      this.editingDogId = row.id;
      
      // 填充表单数据（只填描述，因为图片不能修改）
      this.addDogForm.description = row.description;
      
      // 显示弹窗
      this.addDogDialogVisible = true;
    },
    
    handleDelete(row) {
      // 删除狗狗照片逻辑
      this.$confirm(`确定要删除这条狗狗照片记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await dogService.deleteDog(row.id);
          this.$message.success('删除成功');
          this.fetchDogs(); // 重新加载狗狗照片列表
        } catch (error) {
          console.error('删除狗狗照片失败:', error);
          this.$message.error('删除狗狗照片失败: ' + (error.response?.data?.message || error.message));
        }
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    }
  },
  beforeUnmount() {
    // 组件销毁前释放所有图片的blob URL
    for (const key in this.imagePreviewUrls) {
      if (this.imagePreviewUrls[key]) {
        URL.revokeObjectURL(this.imagePreviewUrls[key]);
      }
    }
  }
};
</script>

<style scoped>
.dog-gallery {
  padding: 20px;
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

.gallery-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.dog-card {
  width: calc(33.333% - 14px);
  border: 1px solid #ebeef5;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
  background-color: #fff;
  position: relative;
}

.dog-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.dog-image-wrapper {
  height: 200px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  cursor: pointer;
}

.dog-image-wrapper img.dog-image-display {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  color: #909399;
  font-size: 14px;
}

.dog-description {
  padding: 10px;
}

.dog-description p {
  margin: 0 0 0 0;
  color: #606266;
  line-height: 1.5;
}

.dog-meta-info {
  font-size: 12px;
  color: #909399;
  padding: 0 15px 15px;
}

.dog-meta-info span {
  display: block;
}

.dog-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  padding: 5px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
}

.dog-image-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.dog-image-uploader .el-upload:hover {
  border-color: #409eff;
}

.dog-image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  text-align: center;
  line-height: 120px;
}

.dog-image {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: cover;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.preview-image {
  width: 100%;
  height: auto;
  max-height: 70vh;
  object-fit: contain;
}

@media (max-width: 1200px) {
  .dog-card {
    width: calc(50% - 10px);
  }
}

@media (max-width: 768px) {
  .dog-card {
    width: 100%;
  }
}
</style>