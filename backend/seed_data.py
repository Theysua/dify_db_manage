import os
import sys

# 将当前目录添加到PATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 导入测试数据模块
from app.test_data import main

if __name__ == "__main__":
    main()
