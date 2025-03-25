# Dify Sales Database Management System - 开发文档

## 项目概述

Dify Sales Database Management System（DSMS）是一套企业级销售和许可证管理系统，专为Dify企业产品设计。本系统采用前后端分离架构，使用FastAPI构建后端服务，React作为前端框架。

## 技术栈

### 后端
- **框架**: FastAPI
- **语言**: Python 3.8+
- **数据库**: MySQL
- **ORM**: SQLAlchemy
- **API文档**: Swagger UI / OpenAPI
- **迁移工具**: Alembic
- **认证机制**: JWT (JSON Web Tokens)

### 前端
- **框架**: React 18
- **UI库**: Ant Design 5
- **状态管理**: React Hooks
- **路由**: React Router
- **HTTP客户端**: Axios
- **构建工具**: Webpack
- **包管理器**: npm/yarn

## 系统架构

```
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  前端应用      |<--->|  后端API       |<--->|   数据库       |
|  React + Antd  |     |    FastAPI    |     |     MySQL      |
|                |     |                |     |                |
+----------------+     +----------------+     +----------------+
```

### 代码组织结构

```
dify_sales_db/
├── backend/                # 后端代码
│   ├── app/                # 主应用
│   │   ├── api/            # API相关
│   │   │   └── v1/         # API v1版本
│   │   │       ├── endpoints/    # API端点
│   │   │       └── api.py        # API路由注册
│   │   ├── core/           # 核心配置
│   │   ├── db/             # 数据库相关
│   │   ├── models/         # 数据模型
│   │   ├── schemas/        # 数据模式
│   │   ├── services/       # 业务服务
│   │   └── utils/          # 工具函数
│   ├── alembic/            # 数据库迁移
│   └── requirements.txt    # 依赖项
├── frontend/               # 前端代码
│   ├── public/             # 静态资源
│   ├── src/                # 源代码
│   │   ├── components/     # 公共组件
│   │   ├── context/        # React上下文
│   │   ├── hooks/          # 自定义hooks
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API服务
│   │   ├── styles/         # 样式文件
│   │   ├── utils/          # 工具函数
│   │   ├── App.js          # 主应用组件
│   │   └── index.js        # 入口文件
│   └── package.json        # 依赖配置
└── README.md               # 项目说明
```

## 核心数据模型

### 主要实体和关系

#### 许可证管理
```
+-------------+     +-------------+     +-------------+
|  Customer   |<--->|   License   |<--->|  SalesRep   |
+-------------+     +------+------+     +-------------+
                           |
           +--------------------------+
           |              |           |
+----------v----+  +------v------+  +-v------------+
|PurchaseRecord |  |DeployRecord |  |  ChangeLog   |
+---------------+  +-------------+  +--------------+
```

#### 合作伙伴与订单管理
```
+-------------+     +-------------+
|   Partner   |---->|    Order    |
+-------------+     +------+------+
                           |
                    +------v------+
                    |  OrderItem  |
                    +-------------+
```

#### 许可证生命周期
```
+----------+     +-----------+     +--------+     +---------+     +--------+
| Created  |---->| Deployed  |---->| In Use |---->| Renewed |---->| Expired |
+----------+     +-----------+     +--------+     +---------+     +--------+
```

## API设计

### RESTful API原则

本系统API遵循以下RESTful设计原则：
1. 资源基于URL路径
2. 使用HTTP方法表示操作（GET、POST、PUT、DELETE）
3. 状态码表示操作结果
4. 使用查询参数进行过滤和分页
5. 使用JSON作为数据交换格式

### 认证与授权

系统使用JWT进行身份验证，通过请求头中的Authorization字段携带token：

```
Authorization: Bearer <token>
```

授权基于角色实现，主要角色包括：
- 管理员(admin)
- 销售代表(sales_rep)
- 工厂工程师(engineer)
- 合作伙伴(partner)

### 依赖注入

API端点使用FastAPI的依赖注入系统实现认证和授权：

```python
# 管理员权限验证
@router.get("/items", response_model=List[schemas.Item])
def get_items(
    db: Session = Depends(get_db),
    current_admin: deps.TokenData = Depends(deps.get_current_admin_user)
):
    # 只有管理员可访问的代码
    pass

# 字段人员（销售代表或工程师）权限验证
@router.get("/customers", response_model=List[schemas.CustomerInfo])
def get_customers(
    db: Session = Depends(get_db),
    current_user: deps.TokenData = Depends(deps.get_current_field_staff)
):
    # 销售代表和工程师均可访问的代码
    pass
```

## 前端设计

### 组件结构

前端采用组件化设计，主要包括：
1. 布局组件(Layout)
2. 页面组件(Pages)
3. 业务组件(BusinessComponents)
4. 通用组件(CommonComponents)

### 状态管理

使用React Hooks和Context API进行状态管理：

```jsx
// 认证上下文示例
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const login = async (credentials) => {
    // 登录实现
  };
  
  const logout = () => {
    // 登出实现
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### 路由设计

使用React Router实现路由管理，包括公共路由和受保护路由：

```jsx
<Routes>
  {/* 公共路由 */}
  <Route path="/login" element={<Login />} />
  <Route path="/partner-login" element={<PartnerLogin />} />
  
  {/* 受保护路由 - 管理员 */}
  <Route 
    path="/admin/*" 
    element={
      <ProtectedRoute role="admin">
        <AdminLayout />
      </ProtectedRoute>
    } 
  />
  
  {/* 受保护路由 - 合作伙伴 */}
  <Route 
    path="/partner/*" 
    element={
      <ProtectedRoute role="partner">
        <PartnerLayout />
      </ProtectedRoute>
    } 
  />
</Routes>
```

## 权限设计

系统采用基于角色(RBAC)的权限管理：

### 角色与权限关系

| 角色 | 查看权限 | 创建权限 | 编辑权限 | 删除权限 |
|------|----------|----------|----------|----------|
| 管理员 | 全部 | 全部 | 全部 | 全部 |
| 销售代表 | 全部客户、许可证、部署、工程师、合作伙伴 | 购买记录 | 客户和许可证信息(有限) | 无 |
| 工程师 | 全部部署、销售代表、客户、许可证 | 部署记录 | 部署状态 | 无 |
| 合作伙伴 | 自己的订单和资料 | 订单 | 自己的资料 | 无 |

### 权限控制实现

#### 后端实现

```python
# 在deps.py中

def get_current_admin_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> TokenData:
    """验证当前用户是否为管理员"""
    credentials_exception = HTTPException(...)
    try:
        payload = jwt.decode(token, ...)
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        
        # 验证是否为管理员账号
        admin = db.query(Admin).filter(Admin.username == username).first()
        if not admin:
            raise credentials_exception
            
        return TokenData(username=username, user_id=admin.id, role="admin")
    except JWTError:
        raise credentials_exception

def get_current_field_staff(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> TokenData:
    """验证当前用户是否为销售代表或工程师"""
    credentials_exception = HTTPException(...)
    try:
        # 类似实现
        # ...
        
        # 检查是销售代表还是工程师
        sales_rep = db.query(SalesRep).filter(SalesRep.username == username).first()
        if sales_rep:
            return TokenData(username=username, user_id=sales_rep.id, role="sales_rep")
            
        engineer = db.query(Engineer).filter(Engineer.username == username).first()
        if engineer:
            return TokenData(username=username, user_id=engineer.id, role="engineer")
            
        raise credentials_exception
    except JWTError:
        raise credentials_exception
```

#### 前端实现

```jsx
// 权限检查组件
const RequireAuth = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Spin size="large" />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
```

## 部署指南

### 开发环境

#### 后端

1. 创建虚拟环境
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: .\venv\Scripts\activate
   ```

2. 安装依赖
   ```bash
   pip install -r requirements.txt
   ```

3. 设置环境变量
   ```bash
   cp .env.example .env
   # 编辑.env文件配置数据库连接等
   ```

4. 创建数据库
   ```bash
   mysql -u root -p
   CREATE DATABASE dify_sales;
   ```

5. 迁移数据库
   ```bash
   alembic upgrade head
   ```

6. 启动开发服务器
   ```bash
   uvicorn app.main:app --reload
   ```

#### 前端

1. 安装依赖
   ```bash
   npm install
   # 或
   yarn install
   ```

2. 设置环境变量
   ```bash
   cp .env.example .env
   # 编辑.env文件配置API URL
   ```

3. 启动开发服务器
   ```bash
   npm start
   # 或
   yarn start
   ```

### 生产部署

#### Docker部署

1. 构建Docker镜像
   ```bash
   docker build -t dify-sales-backend ./backend
   docker build -t dify-sales-frontend ./frontend
   ```

2. 使用Docker Compose启动服务
   ```bash
   docker-compose up -d
   ```

#### 传统服务器部署

1. 后端部署
   ```bash
   # 安装依赖
   pip install -r requirements.txt
   
   # 使用Gunicorn作为WSGI服务器
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
   ```

2. 前端部署
   ```bash
   # 构建静态文件
   npm run build
   
   # 使用Nginx部署静态文件
   # nginx配置示例
   server {
     listen 80;
     server_name example.com;
     root /path/to/build;
     index index.html;
     
     location / {
       try_files $uri $uri/ /index.html;
     }
     
     location /api {
       proxy_pass http://backend_server:8000;
     }
   }
   ```

## 测试策略

### 单元测试

使用pytest进行后端单元测试：

```python
# 服务层测试示例
def test_get_customer_by_id():
    db = MagicMock()
    customer = Customer(id=1, name="Test Customer")
    db.query().filter().first.return_value = customer
    
    result = CustomerService.get_customer_by_id(db, 1)
    assert result.id == 1
    assert result.name == "Test Customer"
```

使用Jest进行前端单元测试：

```jsx
// 组件测试示例
test('renders login form correctly', () => {
  render(<Login />);
  expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});
```

### 集成测试

使用TestClient进行FastAPI集成测试：

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Dify Sales API"}
```

### 端到端测试

使用Cypress进行端到端测试：

```javascript
describe('Login Flow', () => {
  it('successfully logs in as admin', () => {
    cy.visit('/login');
    cy.get('[data-cy=username]').type('admin');
    cy.get('[data-cy=password]').type('admin123');
    cy.get('[data-cy=submit]').click();
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome, Admin').should('be.visible');
  });
});
```

## 代码规范

### Python代码规范

- 遵循PEP8规范
- 使用黑(Black)进行代码格式化
- 使用Flake8进行代码检查
- 使用类型注解增强代码可读性

```python
def get_customer_by_id(db: Session, customer_id: int) -> Optional[CustomerInfo]:
    """
    通过ID获取客户信息
    
    Args:
        db: 数据库会话
        customer_id: 客户ID
        
    Returns:
        CustomerInfo对象或None（如果客户不存在）
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        return None
    return CustomerService._customer_to_schema(customer)
```

### JavaScript/React代码规范

- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 遵循函数组件和Hooks设计模式
- 使用PropTypes或TypeScript进行类型检查

```jsx
import PropTypes from 'prop-types';

const CustomerCard = ({ customer, onEdit }) => {
  return (
    <Card title={customer.name}>
      <p>Email: {customer.email}</p>
      <p>Status: {customer.status}</p>
      <Button onClick={() => onEdit(customer.id)}>Edit</Button>
    </Card>
  );
};

CustomerCard.propTypes = {
  customer: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default CustomerCard;
```

## 近期更新与优化

### 2025-03-25: 合作伙伴订单按钮修复

- 修复了合作伙伴管理页面中订单按钮无法正确导航的问题
- 解决了前端与后端属性命名不一致的问题（PartnerId vs PartnerID）
- 确保API请求中正确处理合作伙伴ID的类型转换（字符串转整数）
- 修复了合作伙伴API端点的响应验证错误

### 2025-03-18: 增强访问控制

- 放宽了销售代表和工程师的访问限制
- 添加了新的依赖函数`get_current_field_staff`以增强权限处理
- 更新了API端点的权限控制

## 未来优化计划

### 短期计划

1. 修复分页功能问题
   - 解决数据加载和刷新问题
   - 优化分页性能
   - 确保记录数量显示的准确性

2. 改进订单与合作伙伴的关联
   - 重新设计订单模型，直接关联到合作伙伴
   - 优化订单查询和过滤功能

### 中期计划

1. 完善多语言支持
   - 实现完整的国际化框架
   - 支持中英文切换
   - 提供语言偏好设置

2. 增强统计和报表功能
   - 开发高级数据分析看板
   - 提供导出报表功能
   - 实现数据可视化

### 长期计划

1. 系统性能优化
   - 实现数据缓存
   - 优化数据库查询
   - 提升API响应速度

2. 移动端适配
   - 开发响应式UI
   - 适配各类移动设备
   - 考虑开发移动应用

## 贡献指南

1. 分支管理
   - `main`: 稳定发布版本
   - `develop`: 开发分支
   - `feature/*`: 功能分支
   - `bugfix/*`: 错误修复分支

2. 提交规范
   - 使用conventional commits规范
   - 格式: `type(scope): description`
   - 类型: feat, fix, docs, style, refactor, test, chore

3. 代码审查
   - 所有代码必须经过至少一名开发者的审查
   - 确保代码符合项目规范
   - 确保测试通过

4. 文档更新
   - 新功能必须更新相应文档
   - API变更必须更新API文档
   - 重要变更必须更新README和开发文档

## 常见问题与解决方案

### 1. 登录认证问题

**问题**: 登录后无法访问受保护资源，提示401错误

**解决方案**:
- 检查token是否正确发送在Authorization头中
- 验证token有效期是否已过期
- 确认用户角色是否有权限访问该资源

### 2. 数据不一致问题

**问题**: 创建或更新数据后，列表数据未更新

**解决方案**:
- 确保在创建/更新操作后重新获取最新数据
- 检查缓存是否影响了数据一致性
- 使用乐观锁或版本控制避免并发更新问题

### 3. 合作伙伴订单问题

**问题**: 合作伙伴创建订单后无法查看或状态更新失败

**解决方案**:
- 确保正确传递合作伙伴ID
- 检查订单状态更新权限
- 验证订单项数据格式是否正确

## 联系与支持

- **项目维护**: Dify技术团队
- **技术支持**: support@dify.ai
- **API文档**: http://localhost:8000/docs (本地开发环境)
- **源代码**: https://github.com/Theysua/dify_db_manage
