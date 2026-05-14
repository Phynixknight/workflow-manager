# Workflow Manager

可视化工作流编辑与管理系统，支持节点配置、流程编排、发布上线等功能。

## 技术栈

**前端：**
- React 19 + React Router 7
- React Flow（流程图编辑）
- Vite 7（构建工具）

**后端：**
- FastAPI（Python Web 框架）
- SQLAlchemy + SQLite（数据库）
- Uvicorn（ASGI 服务器）

## 项目结构

```
├── src/                    # 前端源码
│   ├── components/         # 组件（导航、侧边栏、配置面板、节点等）
│   ├── pages/              # 页面（首页、管理页、流程列表、流程编辑器）
│   └── App.jsx             # 路由入口
├── backend/                # 后端源码
│   ├── main_api.py         # API 入口（FastAPI）
│   ├── workflow.db          # SQLite 数据库文件
│   └── src/
│       ├── database.py     # 数据库模型与初始化
│       ├── graph/          # 图相关逻辑
│       ├── node/           # 节点相关逻辑
│       └── element/        # 元素相关逻辑
├── package.json            # 前端依赖
└── vite.config.js          # Vite 配置
```

## 快速开始

### 环境要求

- Node.js >= 18
- Python >= 3.9
- pip

### 1. 安装前端依赖

```bash
npm install
```

### 2. 安装后端依赖

```bash
cd backend
pip install fastapi uvicorn sqlalchemy pydantic
```

### 3. 启动后端服务

```bash
cd backend
python main_api.py
```

后端运行在 `http://localhost:8000`。

### 4. 启动前端开发服务器

```bash
npm run dev
```

前端运行在 `http://localhost:5173`。

## 常见问题

### "Failed to fetch" 错误

这是因为后端服务未启动。前端请求 `http://localhost:8000` 时连接被拒绝。

**解决方法：** 确保后端服务正在运行：

```bash
cd backend
python main_api.py
```

> 注意：每次重启电脑或关闭终端后，后端进程会丢失，需要重新启动。

### 端口冲突

如果 5173 端口被占用，Vite 会自动使用 5174 或 5175。后端 CORS 已配置允许这三个端口。

## API 接口

后端提供以下 REST API：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/flow/list` | 获取所有流程图 |
| GET | `/api/flow/load/{flow_id}` | 加载指定流程图 |
| POST | `/api/flow/save` | 保存流程图 |
| POST | `/api/flow/publish/{flow_id}` | 发布流程图 |
| POST | `/api/flow/unpublish/{flow_id}` | 取消发布流程图 |
| DELETE | `/api/flow/delete/{flow_id}` | 删除流程图 |
| GET | `/api/node/list` | 获取所有节点 |
| GET | `/api/node/load/{node_id}` | 加载指定节点 |
| POST | `/api/node/save` | 保存节点 |
| POST | `/api/node/publish/{node_id}` | 发布节点 |
| POST | `/api/node/online/{node_id}` | 上线节点 |
| POST | `/api/node/offline/{node_id}` | 下线节点 |
| DELETE | `/api/node/delete/{node_id}` | 删除节点 |
| GET | `/api/node/published` | 获取已发布节点 |
| GET | `/api/node/online` | 获取已上线节点 |

## 构建部署

```bash
# 构建前端
npm run build

# 产物在 dist/ 目录
```

生产环境需要将 `dist/` 目录部署到静态文件服务器，并确保后端 API 服务持续运行。
