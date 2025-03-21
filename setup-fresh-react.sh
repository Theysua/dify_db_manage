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

# 备份现有前端代码
echo -e "${YELLOW}备份现有前端代码...${RESET}"
mv frontend frontend-backup

# 创建新的React应用
echo -e "${YELLOW}创建新的React应用...${RESET}"
npx create-react-app frontend

# 迁移依赖
echo -e "${YELLOW}更新依赖...${RESET}"
cd frontend
npm install --save @ant-design/icons@5.0.1 @ant-design/pro-components@2.4.4 antd@5.3.0 axios@1.3.4 lodash@4.17.21 moment@2.29.4 react-router-dom@6.8.2

# 迁移源代码
echo -e "${YELLOW}迁移源代码...${RESET}"
cp -r ../frontend-backup/src/* src/ 2>/dev/null

# 迁移配置文件
echo -e "${YELLOW}迁移配置文件...${RESET}"
cp ../frontend-backup/public/* public/ 2>/dev/null

# 添加代理配置
echo -e "${YELLOW}添加代理配置...${RESET}"
cat << EOF > package.json.new
$(cat package.json | sed 's/"proxy": ".*",//')
EOF
cat << EOF > package.json.new
$(cat package.json.new | sed 's/"private": true,/"private": true,\n  "proxy": "http:\/\/localhost:8000",/')
EOF
mv package.json.new package.json

echo -e "${GREEN}=== 初始化完成 ===${RESET}"
echo -e "${BLUE}现在您可以使用以下命令启动应用:${RESET}"
echo -e "${BLUE}cd frontend${RESET}"
echo -e "${BLUE}npm start${RESET}"
echo
echo -e "${YELLOW}如果您需要原始代码，它已被备份到frontend-backup目录${RESET}"
