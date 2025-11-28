import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from '../components/LoginForm.vue';
import HelloWorld from '../components/HelloWorld.vue';
import UserManagement from '../components/UserManagement.vue';
import OperationLog from '../components/OperationLog.vue';
import QuarrelRecord from '../components/QuarrelRecord.vue';
import FoodReview from '../components/FoodReview.vue';

// 路由守卫，检查用户是否已认证
function requireAuth(to, from, next) {
  const token = localStorage.getItem('token');
  if (!token) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  } else {
    next();
  }
}

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HelloWorld,
    beforeEnter: requireAuth
  },
  {
    path: '/users',
    name: 'Users',
    component: UserManagement,
    beforeEnter: requireAuth
  },
  {
    path: '/logs',
    name: 'Logs',
    component: OperationLog,
    beforeEnter: requireAuth
  },
  {
    path: '/quarrels',
    name: 'Quarrels',
    component: QuarrelRecord,
    beforeEnter: requireAuth
  },
  {
    path: '/food-reviews',
    name: 'FoodReviews',
    component: FoodReview,
    beforeEnter: requireAuth
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginForm,
    meta: { 
      hideForAuth: true // 已登录用户不应该访问登录页面
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token');
  
  // 如果已登录且试图访问登录页面，则重定向到主页
  if (to.meta.hideForAuth && isAuthenticated) {
    next({ name: 'Home' });
  } else {
    next();
  }
});

export default router;