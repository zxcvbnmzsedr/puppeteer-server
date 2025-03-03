FROM node:18-slim

# 安装 Chromium 和中文字体
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-noto-cjk \
    fonts-noto-cjk-extra \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 设置环境变量
ENV CHROME_PATH=/usr/bin/chromium
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 启动服务
CMD ["node", "src/index.js"] 