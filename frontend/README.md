# 许可证管理系统前端

这是许可证管理系统的前端项目，基于React和Ant Design构建。

## 功能特性

- 仪表盘：显示许可证、部署和客户的关键统计数据
- 许可证管理：创建、查看、编辑和删除许可证记录
- 部署管理：创建、查看、编辑和删除部署记录
- 客户管理：管理客户信息
- 工程师管理：管理负责部署的工程师信息
- 响应式设计：适配不同设备屏幕尺寸

## 技术栈

- React 18
- React Router v6
- Ant Design 5
- Axios
- Moment.js

## 项目结构

```
frontend/
├── public/               # 静态资源
├── src/
│   ├── components/       # 通用组件
│   ├── layouts/          # 页面布局组件
│   ├── pages/            # 页面组件
│   ├── services/         # API服务
│   ├── utils/            # 工具函数
│   ├── App.js            # 应用根组件
│   └── index.js          # 应用入口
└── package.json          # 项目依赖
```

## 开发指南

### 安装依赖

```bash
cd frontend
npm install
```

### 启动开发服务器

```bash
npm start
```

应用将在 [http://localhost:3000](http://localhost:3000) 运行。

### 构建生产版本

```bash
npm run build
```

构建后的文件将位于 `build` 目录中。

## 接口说明

前端通过以下API端点与后端通信：

- 许可证相关: `/api/v1/licenses/*`
- 部署相关: `/api/v1/deployments/*`
- 客户相关: `/api/v1/customers/*`
- 工程师相关: `/api/v1/engineers/*`
- 销售代表相关: `/api/v1/sales-reps/*`
- 代理商相关: `/api/v1/resellers/*`

详细API文档请参考后端文档。
