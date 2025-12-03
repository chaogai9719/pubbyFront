# Pubby Management System Frontend

这是一个基于Vue 3的管理系统前端项目，用于管理各种个人信息和记录。

## 功能特性

- 用户登录和权限验证
- 吵架记录管理
- 狗娃娃菜单点评
- 狗娃娃照片墙
- 用户管理
- 操作日志查看

## 技术栈

- Vue 3
- Vue Router
- Element Plus UI库
- Axios HTTP客户端

## 项目设置

```
npm install
```

### 开发环境编译和热重载

```
npm run serve
```

### 生产环境编译和压缩

```
npm run build
```

### 代码检查和修复

```
npm run lint
```

## 使用Docker部署

构建Docker镜像:

```
docker build -t pubby-front .
```

运行容器:

```
docker run -d -p 8080:80 pubby-front:latest
```

访问地址: http://localhost:8080

## 使用Nginx部署

1. 执行构建命令生成生产环境代码：
```
npm run build
```

2. 构建完成后会在项目根目录生成 `dist` 文件夹

3. 将 `dist` 文件夹中的所有文件复制到Nginx的html目录下

4. 配置Nginx，参考项目中的 [nginx.conf](nginx.conf) 文件：

```nginx
server {
    listen 80;
    server_name localhost;
    
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://192.168.1.5/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

5. 重新加载Nginx配置：
```
nginx -s reload
```

访问地址: http://localhost

## 自定义配置

参见 [Configuration Reference](https://cli.vuejs.org/config/).