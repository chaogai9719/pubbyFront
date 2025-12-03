# 使用 nginx 作为基础镜像
FROM nginx:alpine

# 将构建好的 dist 文件复制到 nginx 的默认目录
COPY ./dist /usr/share/nginx/html

# 复制 nginx 配置文件（可选）
COPY ./nginx.conf /etc/nginx/nginx.conf

# 暴露 80 端口（nginx容器内默认端口）
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]