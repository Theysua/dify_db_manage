#!/bin/bash

# MySQL安装和配置脚本
# 适用于Dify Sales Database项目

set -e

echo "========== MySQL安装和配置脚本 =========="
echo "此脚本将帮助您安装MySQL并进行基本配置"

# 检测操作系统
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS系统
    echo "检测到macOS系统"
    
    # 检查brew是否已安装
    if ! command -v brew &> /dev/null; then
        echo "安装Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    else
        echo "Homebrew已安装，正在更新..."
        brew update
    fi
    
    # 检查MySQL是否已安装
    if ! brew list mysql &> /dev/null; then
        echo "安装MySQL..."
        brew install mysql
    else
        echo "MySQL已安装"
    fi
    
    # 启动MySQL服务
    echo "启动MySQL服务..."
    brew services start mysql
    
    # 等待MySQL启动
    echo "等待MySQL启动..."
    sleep 5
    
    # 检查MySQL服务状态
    if brew services list | grep mysql | grep started; then
        echo "MySQL服务已成功启动"
    else
        echo "MySQL服务启动失败，请检查日志"
        exit 1
    fi
    
    # 提示用户设置root密码
    echo ""
    echo "接下来需要为MySQL root用户设置密码"
    echo "请运行以下命令并按照提示操作:"
    echo "mysql_secure_installation"
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux系统
    echo "检测到Linux系统"
    
    # 检查发行版
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu系统
        echo "Debian/Ubuntu系统"
        
        # 更新包列表
        echo "更新包列表..."
        sudo apt update
        
        # 安装MySQL
        echo "安装MySQL..."
        sudo apt install -y mysql-server
        
        # 启动MySQL服务
        echo "启动MySQL服务..."
        sudo systemctl start mysql
        sudo systemctl enable mysql
        
        # 检查MySQL服务状态
        if systemctl is-active --quiet mysql; then
            echo "MySQL服务已成功启动"
        else
            echo "MySQL服务启动失败，请检查日志"
            exit 1
        fi
        
    elif [ -f /etc/redhat-release ]; then
        # RHEL/CentOS系统
        echo "RHEL/CentOS系统"
        
        # 安装MySQL仓库
        echo "安装MySQL仓库..."
        sudo rpm -Uvh https://repo.mysql.com/mysql80-community-release-el7-3.noarch.rpm
        sudo rpm --import https://repo.mysql.com/RPM-GPG-KEY-mysql-2022
        
        # 安装MySQL
        echo "安装MySQL..."
        sudo yum install -y mysql-community-server
        
        # 启动MySQL服务
        echo "启动MySQL服务..."
        sudo systemctl start mysqld
        sudo systemctl enable mysqld
        
        # 检查MySQL服务状态
        if systemctl is-active --quiet mysqld; then
            echo "MySQL服务已成功启动"
        else
            echo "MySQL服务启动失败，请检查日志"
            exit 1
        fi
        
        # 获取临时密码
        echo "MySQL已安装并启动，临时root密码是:"
        sudo grep 'temporary password' /var/log/mysqld.log | awk '{print $NF}'
        
    else
        echo "不支持的Linux发行版"
        exit 1
    fi
    
    # 提示用户设置root密码
    echo ""
    echo "接下来需要为MySQL root用户设置密码"
    echo "请运行以下命令并按照提示操作:"
    echo "sudo mysql_secure_installation"
    
else
    echo "不支持的操作系统: $OSTYPE"
    exit 1
fi

# 创建Dify Sales数据库的步骤
echo ""
echo "========== 设置Dify Sales数据库 =========="
echo "要创建数据库和用户，请按照以下步骤操作:"
echo ""
echo "1. 登录MySQL:"
echo "   mysql -u root -p"
echo ""
echo "2. 创建数据库和用户:"
echo "   CREATE DATABASE dify_sales CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "   CREATE USER 'dify_user'@'localhost' IDENTIFIED BY '您的密码';"
echo "   GRANT ALL PRIVILEGES ON dify_sales.* TO 'dify_user'@'localhost';"
echo "   FLUSH PRIVILEGES;"
echo "   EXIT;"
echo ""
echo "3. 编辑.env文件，设置数据库连接信息:"
echo "   DB_HOST=localhost"
echo "   DB_PORT=3306"
echo "   DB_USER=dify_user"
echo "   DB_PASSWORD=您的密码"
echo "   DB_NAME=dify_sales"
echo ""
echo "4. 运行数据库初始化脚本:"
echo "   python init_db_and_users.py"
echo ""
echo "安装完成！"
