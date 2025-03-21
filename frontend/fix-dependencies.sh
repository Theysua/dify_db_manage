#!/bin/bash

# Fix script for frontend dependencies
echo "=== 修复前端依赖问题 ==="

# 检查是否在frontend目录下
if [ ! -f "package.json" ]; then
  echo "错误：请在frontend目录下运行此脚本"
  exit 1
fi

# 颜色设置
BLUE="\033[1;34m"
GREEN="\033[1;32m"
RED="\033[1;31m"
YELLOW="\033[1;33m"
RESET="\033[0m"

echo -e "${YELLOW}清理可能损坏的node_modules...${RESET}"
rm -rf node_modules
rm -f package-lock.json

echo -e "${YELLOW}清理缓存...${RESET}"
npm cache clean --force

echo -e "${YELLOW}安装依赖...${RESET}"
npm install

if [ $? -ne 0 ]; then
  echo -e "${RED}仍然无法安装依赖，尝试使用yarn...${RESET}"
  if command -v yarn &> /dev/null; then
    echo -e "${YELLOW}使用yarn安装依赖...${RESET}"
    yarn install
  else
    echo -e "${RED}yarn未安装，请尝试安装yarn或手动解决依赖问题${RESET}"
    exit 1
  fi
fi

echo -e "${GREEN}依赖修复完成!${RESET}"
echo -e "${BLUE}您现在可以运行 'npm start' 启动前端应用${RESET}"
