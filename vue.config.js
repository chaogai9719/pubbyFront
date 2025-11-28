const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,
  configureWebpack: {
    devtool: 'source-map'
  },
  devServer: {
    // 禁用 webpack-dev-server 的错误覆盖层
    client: {
      overlay: false
    },
    proxy: {
      '/api': {
        target: 'http://192.168.1.5',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        }
      }
    }
  }
})