# HTML/URL to PDF Generator Service

一个基于 Node.js 和 Puppeteer 的 PDF 生成服务，支持从 URL 或 HTML 内容生成 PDF 文件，完整支持中文。

## 功能特点

- ✨ 支持从 URL 生成 PDF
- 📝 支持从 HTML 内容生成 PDF
- 🈶 完整的中文字体支持
- 🔄 自动重试机制
- 🧹 自动内存管理和实例清理
- 🐳 Docker 支持
- 💪 健壮的浏览器实例管理

## 系统要求

### Docker 环境（推荐）
- Docker 20.10+
- Docker Compose 2.0+

### 本地开发环境
- Node.js 18+
- Chromium 浏览器
- 中文字体支持

## 快速开始

### 使用 Docker（推荐）

1. 克隆项目：
```bash
git clone https://github.com/zxcvbnmzsedr/puppeteer-server.git 
cd pdf-generator-service
```

2. 启动服务：
```bash
docker compose up --build
```

服务将在 http://localhost:3000 启动

### 本地开发

1. 安装依赖：
```bash
pnpm install
```

2. 启动服务：
```bash
pnpm start
```

## API 使用说明

### 1. 从 URL 生成 PDF

**接口**: `POST /generate-pdf/url`

**请求体**:
```json
{
  "url": "https://example.com",
  "options": {
    "format": "A4",
    "landscape": false
  }
}
```

**示例**:
```bash
curl -X POST http://localhost:3000/generate-pdf/url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "options": {
      "format": "A4"
    }
  }' \
  --output output.pdf
```

### 2. 从 HTML 内容生成 PDF

**接口**: `POST /generate-pdf/html`

**请求体**:
```json
{
  "html": "<h1>你好，世界！</h1>",
  "options": {
    "format": "A4"
  }
}
```

**示例**:
```bash
curl -X POST http://localhost:3000/generate-pdf/html \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<h1>你好，世界！</h1>",
    "options": {
      "format": "A4"
    }
  }' \
  --output output.pdf
```

## PDF 生成选项

可以通过 `options` 参数自定义 PDF 输出：

```json
{
  "format": "A4",
  "landscape": false,
  "margin": {
    "top": "20px",
    "right": "20px",
    "bottom": "20px",
    "left": "20px"
  },
  "printBackground": true,
  "displayHeaderFooter": false,
  "scale": 1
}
```

## 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `PORT` | 服务端口号 | 3000 |
| `NODE_ENV` | 运行环境 | production |
| `CHROME_PATH` | Chromium 浏览器路径 | 系统默认 |

## 项目结构

```
.
├── src/
│   ├── index.js          # 服务入口
│   └── pdfGenerator.js   # PDF 生成核心逻辑
├── Dockerfile            # Docker 构建文件
├── docker-compose.yml    # Docker Compose 配置
└── README.md            # 项目文档
```

## 注意事项

1. 内存管理
   - 服务会自动监控内存使用情况
   - 当内存使用超过阈值时，会自动清理浏览器实例

2. 错误处理
   - 服务内置重试机制，最多重试 3 次
   - 每次重试间隔会递增，以避免立即重试可能导致的问题

3. Docker 部署
   - 确保给予容器足够的系统权限（SYS_ADMIN）
   - 配置了 seccomp=unconfined 以确保 Chromium 正常运行
