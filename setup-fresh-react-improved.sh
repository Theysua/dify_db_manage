#!/bin/bash

# 脚本用于创建全新的React应用并迁移现有代码

# 颜色设置
BLUE="\033[1;34m"
GREEN="\033[1;32m"
RED="\033[1;31m"
YELLOW="\033[1;33m"
RESET="\033[0m"

echo -e "${YELLOW}=== 创建全新的React应用 ====${RESET}"

# 检查是否在项目根目录
if [ ! -d "frontend" ]; then
  echo -e "${RED}错误：请在项目根目录运行此脚本${RESET}"
  exit 1
fi

# 停止可能正在运行的React服务
echo -e "${YELLOW}停止可能运行中的React服务...${RESET}"
pkill -f 'node.*react-scripts' || true

# 备份现有前端代码
echo -e "${YELLOW}备份现有前端代码...${RESET}"
if [ -d "frontend-backup" ]; then
  rm -rf frontend-backup
fi
mv frontend frontend-backup

# 创建新的React应用
echo -e "${YELLOW}创建新的React应用...${RESET}"
npx create-react-app frontend

# 迁移依赖
echo -e "${YELLOW}更新依赖...${RESET}"
cd frontend
npm install --save @ant-design/icons@5.0.1 @ant-design/pro-components@2.4.4 antd@5.3.0 axios@1.3.4 lodash@4.17.21 moment@2.29.4 react-router-dom@6.8.2

# 确保index.js和index.css正确
echo -e "${YELLOW}确保基础文件正确...${RESET}"
cat << EOF > src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

cat << EOF > src/index.css
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

.site-layout-content {
  min-height: 280px;
  padding: 24px;
  background: #fff;
}

.logo {
  float: left;
  margin-right: 20px;
  width: 120px;
  height: 31px;
  line-height: 31px;
  color: white;
  font-weight: bold;
  font-size: 18px;
  text-align: center;
}

.site-layout-background {
  background: #fff;
}

.ant-layout-header {
  display: flex;
  align-items: center;
}

.ant-layout-header .trigger {
  padding: 0 24px;
  font-size: 18px;
  line-height: 64px;
  cursor: pointer;
  transition: color 0.3s;
}

.ant-layout-sider-children .logo {
  height: 32px;
  margin: 16px;
  text-align: center;
  color: white;
  font-weight: bold;
  line-height: 32px;
  white-space: nowrap;
  overflow: hidden;
}
EOF

# 创建简单的初始App.js
cat << EOF > src/App.js
import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 一个简单的欢迎页
const WelcomePage = () => (
  <div style={{ textAlign: 'center', marginTop: '100px' }}>
    <h1>许可证管理系统</h1>
    <p>系统正在初始化，请稍候...</p>
  </div>
);

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          <Route path="*" element={<WelcomePage />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
EOF

# 迁移public文件
echo -e "${YELLOW}迁移public文件...${RESET}"
rm -f public/*
cp -r ../frontend-backup/public/* public/ 2>/dev/null

# 修改index.html确保有root元素
cat << EOF > public/index.html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="许可证管理系统 - 管理许可证、部署和客户的综合平台"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>许可证管理系统</title>
  </head>
  <body>
    <noscript>您需要启用 JavaScript 来运行此应用。</noscript>
    <div id="root"></div>
  </body>
</html>
EOF

# 添加代理配置
echo -e "${YELLOW}添加代理配置...${RESET}"
cat << EOF > package.json.new
$(cat package.json | sed 's/"private": true,/"private": true,\n  "proxy": "http:\/\/localhost:8000",/')
EOF
mv package.json.new package.json

# 创建src目录结构
echo -e "${YELLOW}创建目录结构...${RESET}"
mkdir -p src/components/layouts
mkdir -p src/pages/{dashboard,licenses,deployments,customers,engineers}
mkdir -p src/services
mkdir -p src/utils

echo -e "${GREEN}=== 初始化完成 ===${RESET}"
echo -e "${BLUE}现在您可以使用以下命令启动应用:${RESET}"
echo -e "${BLUE}cd frontend${RESET}"
echo -e "${BLUE}npm start${RESET}"
echo
echo -e "${YELLOW}如果您需要原始代码，它已被备份到frontend-backup目录${RESET}"
echo -e "${YELLOW}您可以稍后将frontend-backup/src下的组件迁移到新应用中${RESET}"
