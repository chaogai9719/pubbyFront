<template>
  <div class="food-review">
    <div class="page-header">
      <h2>狗娃娃菜单</h2>
      <div class="header-actions">
        <el-select v-model="selectedRating" placeholder="请选择等级" @change="fetchFoodReviews" clearable style="width: 150px">
          <el-option
            v-for="item in ratings"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-button type="primary" @click="handleAddFoodReview">
          添加美食点评
        </el-button>
      </div>
    </div>
    
    <!-- 添加/编辑美食点评的弹窗 -->
    <el-dialog
      :title="isEditMode ? '编辑美食点评' : '添加美食点评'"
      v-model="addFoodReviewDialogVisible"
      width="500px"
      @close="handleCancelAddFoodReview"
    >
      <el-form
        :model="addFoodReviewForm"
        :rules="addFoodReviewRules"
        ref="addFoodReviewFormRef"
        label-width="100px"
      >
        <el-form-item label="餐厅名称" prop="restaurantName">
          <el-input 
            v-model="addFoodReviewForm.restaurantName" 
            placeholder="请输入餐厅名称"
            :disabled="isEditMode"
          />
        </el-form-item>
        <el-form-item label="餐厅位置" prop="restaurantLocation">
          <el-input 
            v-model="addFoodReviewForm.restaurantLocation" 
            placeholder="请输入餐厅位置"
            :disabled="isEditMode"
          />
        </el-form-item>
        <el-form-item label="评分" prop="rating">
          <el-rate
            v-model="addFoodReviewForm.rating"
            :max="5"
            show-score
            score-template="{value}星"
          />
        </el-form-item>
        <el-form-item label="美食图片" prop="foodImage">
          <el-upload
            class="food-image-uploader"
            :action="uploadImageUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleImageSuccess"
            :before-upload="beforeImageUpload"
          >
            <img v-if="addFoodReviewForm.foodImage" :src="getCachedImagePreviewUrl(addFoodReviewForm.foodImage)" class="food-image">
            <i v-else class="el-icon-plus food-image-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="addFoodReviewForm.remark" 
            type="textarea"
            placeholder="请输入备注"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancelAddFoodReview">取消</el-button>
          <el-button type="primary" @click="submitAddFoodReview" :loading="addFoodReviewLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <div class="reviews-container">
      <div 
        v-for="review in reviews" 
        :key="review.id" 
        class="review-card"
      >
        <div class="review-image">
          <img 
            v-if="review.foodImage" 
            :src="getCachedImagePreviewUrl(review.foodImage)" 
            :alt="review.restaurantName"
            class="food-image-display"
          >
          <div v-else class="no-image">暂无图片</div>
        </div>
        <div class="review-content">
          <div class="restaurant-info">
            <h3>{{ review.restaurantName }}</h3>
            <p>{{ review.restaurantLocation }}</p>
          </div>
          <div class="rating">
            <el-rate
              v-model="review.rating"
              :max="5"
              disabled
            />
          </div>
          <div class="remark">
            <p>{{ review.remark }}</p>
          </div>
          <div class="meta-info">
            <span>创建人: {{ review.createBy }}</span>
            <span>创建时间: {{ formatDateTime(review.createTime) }}</span>
          </div>
          <div class="actions">
            <el-button size="small" type="primary" @click="handleEdit(review)" plain>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(review)" plain>
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import foodReviewService from '../services/foodReviewService';

export default {
  name: 'FoodReview',
  data() {
    return {
      reviews: [],
      loading: false,
      selectedRating: null,
      ratings: [
        { value: 1, label: '1星' },
        { value: 2, label: '2星' },
        { value: 3, label: '3星' },
        { value: 4, label: '4星' },
        { value: 5, label: '5星' }
      ],
      
      // 添加美食点评的弹窗控制
      addFoodReviewDialogVisible: false,
      // 编辑模式标志
      isEditMode: false,
      // 当前编辑的美食点评ID
      editingFoodReviewId: null,
      addFoodReviewForm: {
        restaurantName: '',
        restaurantLocation: '',
        rating: 1,
        foodImage: '',
        remark: ''
      },
      addFoodReviewRules: {
        restaurantName: [
          { required: true, message: '请输入餐厅名称', trigger: 'blur' }
        ],
        restaurantLocation: [
          { required: true, message: '请输入餐厅位置', trigger: 'blur' }
        ],
        rating: [
          { required: true, message: '请评分', trigger: 'change' }
        ],
        foodImage: [
          { required: true, message: '请上传美食图片', trigger: 'change' }
        ]
      },
      addFoodReviewLoading: false,
      addFoodReviewFormRef: null,
      
      // 上传相关
      uploadImageUrl: '/api/food-reviews/upload-image',
      
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
    this.fetchFoodReviews();
  },
  // 添加路由监听，当路由被激活时刷新数据
  watch: {
    '$route'(to) {
      // 当路由是美食点评页面时，自动刷新列表
      if (to.name === 'FoodReviews') {
        this.fetchFoodReviews();
      }
    }
  },
  methods: {
    async fetchFoodReviews() {
      this.loading = true;
      try {
        const params = {
          rating: this.selectedRating
        };
        
        const response = await foodReviewService.getFoodReviews(params);
        this.reviews = response.data || [];
        
        // 为所有有图片的评论生成预览URL
        for (const review of this.reviews) {
          if (review.foodImage && !this.imagePreviewUrls[review.foodImage]) {
            this.imagePreviewUrls[review.foodImage] = await foodReviewService.getImageBlobUrl(review.foodImage);
          }
        }
      } catch (error) {
        console.error('获取美食点评列表失败:', error);
        this.$message.error('获取美食点评列表失败: ' + (error.response?.data?.message || error.message));
        this.reviews = [];
      } finally {
        this.loading = false;
      }
    },
    
    handleSizeChange() {
      // 移除分页相关逻辑
    },
    
    handleCurrentChange() {
      // 移除分页相关逻辑
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
    
    handleAddFoodReview() {
      // 显示添加美食点评弹窗
      this.isEditMode = false;
      this.addFoodReviewDialogVisible = true;
    },
    
    handleCancelAddFoodReview() {
      // 取消添加/编辑美食点评
      this.addFoodReviewDialogVisible = false;
      this.resetAddFoodReviewForm();
    },
    
    resetAddFoodReviewForm() {
      // 重置添加美食点评表单
      this.addFoodReviewForm = {
        restaurantName: '',
        restaurantLocation: '',
        rating: 1,
        foodImage: '',
        remark: ''
      };
      
      // 清除表单校验
      if (this.$refs.addFoodReviewFormRef) {
        this.$refs.addFoodReviewFormRef.resetFields();
      }
      
      // 重置编辑模式标志
      this.isEditMode = false;
      this.editingFoodReviewId = null;
    },
    
    beforeImageUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;
      
      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },
    
    handleImageSuccess(response) {
      // 处理图片上传成功
      this.addFoodReviewForm.foodImage = response.data || response;
      this.$message.success('图片上传成功');
    },
    
    async submitAddFoodReview() {
      // 提交添加/编辑美食点评
      this.$refs.addFoodReviewFormRef.validate(async (valid) => {
        if (valid) {
          this.addFoodReviewLoading = true;
          try {
            if (this.isEditMode) {
              // 编辑美食点评
              const foodReviewData = {
                restaurantName: this.addFoodReviewForm.restaurantName,
                restaurantLocation: this.addFoodReviewForm.restaurantLocation,
                rating: this.addFoodReviewForm.rating,
                foodImage: this.addFoodReviewForm.foodImage,
                remark: this.addFoodReviewForm.remark
              };
              
              await foodReviewService.updateFoodReview(this.editingFoodReviewId, foodReviewData);
              this.$message.success('美食点评更新成功');
            } else {
              // 添加美食点评
              const foodReviewData = {
                restaurantName: this.addFoodReviewForm.restaurantName,
                restaurantLocation: this.addFoodReviewForm.restaurantLocation,
                rating: this.addFoodReviewForm.rating,
                foodImage: this.addFoodReviewForm.foodImage,
                remark: this.addFoodReviewForm.remark
              };
              
              await foodReviewService.createFoodReview(foodReviewData);
              this.$message.success('美食点评添加成功');
            }
            
            this.addFoodReviewDialogVisible = false;
            this.resetAddFoodReviewForm();
            // 重新获取美食点评列表
            this.fetchFoodReviews();
          } catch (error) {
            console.error('保存美食点评失败:', error);
            this.$message.error('保存美食点评失败: ' + (error.response?.data?.message || error.message));
          } finally {
            this.addFoodReviewLoading = false;
          }
        }
      });
    },
    
    async handleEdit(row) {
      // 编辑美食点评逻辑
      this.isEditMode = true;
      this.editingFoodReviewId = row.id;
      
      // 填充表单数据
      this.addFoodReviewForm.restaurantName = row.restaurantName;
      this.addFoodReviewForm.restaurantLocation = row.restaurantLocation;
      this.addFoodReviewForm.rating = row.rating;
      this.addFoodReviewForm.foodImage = row.foodImage || '';
      this.addFoodReviewForm.remark = row.remark || '';
      
      // 如果有图片且还没有预览URL，则生成一个
      if (this.addFoodReviewForm.foodImage && !this.imagePreviewUrls[this.addFoodReviewForm.foodImage]) {
        try {
          this.imagePreviewUrls[this.addFoodReviewForm.foodImage] = await foodReviewService.getImageBlobUrl(this.addFoodReviewForm.foodImage);
        } catch (error) {
          console.error('获取图片预览URL失败:', error);
          this.$message.error('获取图片预览URL失败: ' + (error.response?.data?.message || error.message));
        }
      }
      
      // 显示弹窗
      this.addFoodReviewDialogVisible = true;
    },
    
    handleDelete(row) {
      // 删除美食点评逻辑
      this.$confirm(`确定要删除美食点评 "${row.restaurantName}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await foodReviewService.deleteFoodReview(row.id);
          this.$message.success('删除成功');
          this.fetchFoodReviews(); // 重新加载美食点评列表
        } catch (error) {
          console.error('删除美食点评失败:', error);
          this.$message.error('删除美食点评失败: ' + (error.response?.data?.message || error.message));
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
.food-review {
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

.reviews-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.review-card {
  width: calc(50% - 10px);
  border: 1px solid #ebeef5;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
  background-color: #fff;
}

.review-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.review-image {
  height: 200px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.review-image img.food-image-display {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  color: #909399;
  font-size: 14px;
}

.review-content {
  padding: 15px;
}

.restaurant-info h3 {
  margin: 0 0 5px 0;
  color: #303133;
}

.restaurant-info p {
  margin: 0 0 10px 0;
  color: #606266;
}

.rating {
  margin-bottom: 10px;
}

.remark p {
  margin: 0 0 15px 0;
  color: #606266;
  line-height: 1.5;
}

.meta-info {
  font-size: 12px;
  color: #909399;
  margin-bottom: 15px;
}

.meta-info span {
  display: block;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}


.food-image-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.food-image-uploader .el-upload:hover {
  border-color: #409eff;
}

.food-image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  text-align: center;
  line-height: 120px;
}

.food-image {
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

@media (max-width: 768px) {
  .review-card {
    width: 100%;
  }
}
</style>