import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 更加强大的 ResizeObserver 错误拦截器
(function () {
  // 捕获所有可能的 ResizeObserver 错误
  const resizeObserverErrRegex = /ResizeObserver/gi;
  
  // 重写 console.error 方法以过滤掉 ResizeObserver 错误
  const originalConsoleError = console.error;
  console.error = function (...args) {
    if (args.some(arg => typeof arg === 'string' && resizeObserverErrRegex.test(arg))) {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // 重写 console.warn 方法以过滤掉 ResizeObserver 警告
  const originalConsoleWarn = console.warn;
  console.warn = function (...args) {
    if (args.some(arg => typeof arg === 'string' && resizeObserverErrRegex.test(arg))) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };

  // 全局错误处理
  const resizeObserverErrHandler = (e) => {
    if (e.message && resizeObserverErrRegex.test(e.message)) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return false;
    }
  };

  // Promise rejection 处理
  const unhandledRejectionHandler = (event) => {
    if (event.reason && (
      (typeof event.reason === 'string' && resizeObserverErrRegex.test(event.reason)) ||
      (event.reason.message && resizeObserverErrRegex.test(event.reason.message))
    )) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  };

  // MutationObserver 错误处理
  const mutationObserverErrHandler = (e) => {
    if (e.message && /ResizeObserver loop completed with undelivered notifications/.test(e.message)) {
      e.stopImmediatePropagation();
      return false;
    }
  };

  // 添加所有错误处理器
  window.addEventListener('error', resizeObserverErrHandler);
  window.addEventListener('unhandledrejection', unhandledRejectionHandler);
  window.addEventListener('error', mutationObserverErrHandler);

  // 尝试 patch ResizeObserver 构造函数
  try {
    if (window.ResizeObserver && !window.ResizeObserver._patched) {
      const OriginalResizeObserver = window.ResizeObserver;
      window.ResizeObserver = class PatchedResizeObserver extends OriginalResizeObserver {
        constructor(callback) {
          // 包装回调函数以添加错误处理
          super((entries, observer) => {
            try {
              callback(entries, observer);
            } catch (err) {
              if (!resizeObserverErrRegex.test(err.message)) {
                throw err;
              }
            }
          });
        }
      };
      window.ResizeObserver._patched = true;
    }
  } catch (e) {
    // 忽略 patch 错误
  }
})();

createApp(App).use(router).use(ElementPlus).mount('#app')