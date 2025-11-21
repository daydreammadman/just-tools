# Just Tools - 后端 API 设计规范

本文档定义 FastAPI 后端的 API 设计标准和实现规范。

---

## API 基础规范

### 1. 基础路径

```
开发环境: http://localhost:8000
生产环境: https://api.just-tools.com
```

### 2. 版本控制

```
/api/v1/...  # 当前版本
```

### 3. 响应格式

所有 API 响应使用统一的 JSON 格式：

```json
{
  "success": true,
  "data": {
    // 响应数据
  },
  "error": null,
  "timestamp": 1638360000,
  "requestId": "uuid-string"
}
```

错误响应：

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_INPUT",
    "message": "用户友好的错误信息",
    "details": {
      // 详细错误信息（可选）
    }
  },
  "timestamp": 1638360000,
  "requestId": "uuid-string"
}
```

---

## 状态码规范

### 成功响应

- `200 OK`: 请求成功
- `201 Created`: 资源创建成功
- `204 No Content`: 请求成功但无返回内容

### 客户端错误

- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未认证
- `403 Forbidden`: 无权限
- `404 Not Found`: 资源不存在
- `422 Unprocessable Entity`: 请求格式正确但语义错误
- `429 Too Many Requests`: 请求过于频繁

### 服务器错误

- `500 Internal Server Error`: 服务器内部错误
- `502 Bad Gateway`: 网关错误
- `503 Service Unavailable`: 服务不可用

---

## FastAPI 项目结构

```
backend/
├── app/
│   ├── main.py                 # FastAPI 应用入口
│   ├── config.py               # 配置管理
│   ├── dependencies.py         # 依赖注入
│   ├── middleware/             # 中间件
│   │   ├── __init__.py
│   │   ├── cors.py            # CORS 配置
│   │   ├── rate_limit.py      # 速率限制
│   │   └── logging.py         # 日志中间件
│   ├── routers/                # 路由模块
│   │   ├── __init__.py
│   │   ├── tools.py           # 工具列表路由
│   │   ├── ip_lookup.py       # IP 查询路由
│   │   └── ...                # 其他工具路由
│   ├── services/               # 业务逻辑层
│   │   ├── __init__.py
│   │   ├── ip_service.py      # IP 查询服务
│   │   └── ...
│   ├── models/                 # Pydantic 模型
│   │   ├── __init__.py
│   │   ├── common.py          # 通用模型
│   │   ├── ip.py              # IP 相关模型
│   │   └── ...
│   ├── utils/                  # 工具函数
│   │   ├── __init__.py
│   │   ├── validators.py      # 验证器
│   │   ├── helpers.py         # 辅助函数
│   │   └── exceptions.py      # 自定义异常
│   └── tests/                  # 测试文件
│       ├── __init__.py
│       ├── test_api.py
│       └── ...
├── requirements.txt            # Python 依赖
├── .env                        # 环境变量
├── .env.example                # 环境变量示例
├── Dockerfile                  # Docker 配置
└── README.md
```

---

## FastAPI 实现模板

### 1. 主应用 (main.py)

```python
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
import uuid

from app.config import settings
from app.routers import tools, ip_lookup
from app.utils.exceptions import APIException

# 应用生命周期管理
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时执行
    print("🚀 Starting Just Tools API...")
    yield
    # 关闭时执行
    print("👋 Shutting down Just Tools API...")

# 创建 FastAPI 应用
app = FastAPI(
    title="Just Tools API",
    description="Backend API for Just Tools platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 请求 ID 中间件
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id

    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time

    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = str(process_time)

    return response

# 全局异常处理
@app.exception_handler(APIException)
async def api_exception_handler(request: Request, exc: APIException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "data": None,
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details
            },
            "timestamp": int(time.time()),
            "requestId": request.state.request_id
        }
    )

# 注册路由
app.include_router(tools.router)
app.include_router(ip_lookup.router)

# 健康检查
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": int(time.time())}

# 根路径
@app.get("/")
async def root():
    return {
        "name": "Just Tools API",
        "version": "1.0.0",
        "docs": "/docs"
    }
```

### 2. 配置管理 (config.py)

```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # 应用配置
    APP_NAME: str = "Just Tools API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # 服务器配置
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS 配置
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://just-tools.com"
    ]

    # API 密钥配置
    IP_API_KEY: str = ""
    EXTERNAL_API_TIMEOUT: int = 10

    # 速率限制
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60  # 秒

    # 日志配置
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/app.log"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

### 3. 通用模型 (models/common.py)

```python
from pydantic import BaseModel, Field
from typing import Optional, Any, Dict
from datetime import datetime

class APIResponse(BaseModel):
    """标准 API 响应模型"""
    success: bool = Field(..., description="请求是否成功")
    data: Optional[Any] = Field(None, description="响应数据")
    error: Optional[Dict[str, Any]] = Field(None, description="错误信息")
    timestamp: int = Field(default_factory=lambda: int(datetime.now().timestamp()))
    requestId: Optional[str] = Field(None, description="请求 ID")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "data": {"result": "example"},
                "error": None,
                "timestamp": 1638360000,
                "requestId": "uuid-string"
            }
        }

class ErrorDetail(BaseModel):
    """错误详情模型"""
    code: str = Field(..., description="错误代码")
    message: str = Field(..., description="错误信息")
    details: Optional[Dict[str, Any]] = Field(None, description="详细错误信息")

class HealthResponse(BaseModel):
    """健康检查响应"""
    status: str = Field(..., description="服务状态")
    timestamp: int = Field(default_factory=lambda: int(datetime.now().timestamp()))
    version: str = Field(..., description="API 版本")
```

### 4. 自定义异常 (utils/exceptions.py)

```python
from typing import Optional, Dict, Any

class APIException(Exception):
    """API 基础异常类"""
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        details: Optional[Dict[str, Any]] = None
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)

class ValidationError(APIException):
    """验证错误"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            code="VALIDATION_ERROR",
            message=message,
            status_code=422,
            details=details
        )

class NotFoundError(APIException):
    """资源不存在"""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(
            code="NOT_FOUND",
            message=message,
            status_code=404
        )

class RateLimitError(APIException):
    """速率限制错误"""
    def __init__(self, message: str = "Too many requests"):
        super().__init__(
            code="RATE_LIMIT_EXCEEDED",
            message=message,
            status_code=429
        )

class ExternalAPIError(APIException):
    """外部 API 调用错误"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            code="EXTERNAL_API_ERROR",
            message=message,
            status_code=502,
            details=details
        )
```

### 5. 工具路由示例 (routers/ip_lookup.py)

```python
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field, validator
import re

from app.models.common import APIResponse
from app.services.ip_service import IPService
from app.utils.exceptions import ValidationError
from app.dependencies import get_ip_service

router = APIRouter(
    prefix="/api/ip",
    tags=["IP Tools"]
)

class IPLookupRequest(BaseModel):
    """IP 查询请求模型"""
    ip: str = Field(..., description="IP 地址", example="8.8.8.8")

    @validator('ip')
    def validate_ip(cls, v):
        # 简单的 IP 格式验证
        pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
        if not re.match(pattern, v):
            raise ValueError('Invalid IP address format')

        # 验证每个字段在 0-255 范围内
        parts = v.split('.')
        for part in parts:
            if not 0 <= int(part) <= 255:
                raise ValueError('IP address parts must be between 0 and 255')

        return v

class IPLookupResponse(BaseModel):
    """IP 查询响应数据"""
    ip: str = Field(..., description="IP 地址")
    country: str = Field(..., description="国家")
    region: str = Field(..., description="地区")
    city: str = Field(..., description="城市")
    isp: str = Field(..., description="ISP 提供商")
    lat: float = Field(..., description="纬度")
    lon: float = Field(..., description="经度")

@router.post(
    "/lookup",
    response_model=APIResponse,
    summary="IP 地址查询",
    description="查询 IP 地址的地理位置和 ISP 信息"
)
async def lookup_ip(
    request: Request,
    data: IPLookupRequest,
    ip_service: IPService = Depends(get_ip_service)
):
    """
    查询 IP 地址信息

    - **ip**: 要查询的 IP 地址
    """
    try:
        result = await ip_service.lookup(data.ip)

        return APIResponse(
            success=True,
            data=result,
            requestId=request.state.request_id
        )
    except Exception as e:
        raise ValidationError(
            message=f"IP lookup failed: {str(e)}",
            details={"ip": data.ip}
        )

@router.get(
    "/current",
    response_model=APIResponse,
    summary="获取当前 IP",
    description="获取请求者的 IP 地址信息"
)
async def get_current_ip(request: Request):
    """获取当前请求的 IP 地址"""
    client_ip = request.client.host

    return APIResponse(
        success=True,
        data={"ip": client_ip},
        requestId=request.state.request_id
    )
```

### 6. 业务逻辑层 (services/ip_service.py)

```python
import httpx
from typing import Dict, Any
from app.config import settings
from app.utils.exceptions import ExternalAPIError

class IPService:
    """IP 查询服务"""

    def __init__(self):
        self.base_url = "http://ip-api.com/json"
        self.timeout = settings.EXTERNAL_API_TIMEOUT

    async def lookup(self, ip: str) -> Dict[str, Any]:
        """
        查询 IP 地址信息

        Args:
            ip: IP 地址

        Returns:
            IP 地址信息字典

        Raises:
            ExternalAPIError: 外部 API 调用失败
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/{ip}",
                    params={
                        "fields": "status,message,country,regionName,city,isp,lat,lon,query"
                    }
                )

                data = response.json()

                if data.get('status') == 'fail':
                    raise ExternalAPIError(
                        message=data.get('message', 'IP lookup failed'),
                        details={"ip": ip}
                    )

                return {
                    "ip": data['query'],
                    "country": data['country'],
                    "region": data['regionName'],
                    "city": data['city'],
                    "isp": data['isp'],
                    "lat": data['lat'],
                    "lon": data['lon']
                }

        except httpx.RequestError as e:
            raise ExternalAPIError(
                message=f"Network error: {str(e)}",
                details={"ip": ip}
            )
        except Exception as e:
            raise ExternalAPIError(
                message=f"Unexpected error: {str(e)}",
                details={"ip": ip}
            )
```

### 7. 依赖注入 (dependencies.py)

```python
from app.services.ip_service import IPService

def get_ip_service() -> IPService:
    """获取 IP 服务实例"""
    return IPService()
```

---

## 速率限制实现

### 使用 slowapi

```python
# requirements.txt
slowapi==0.1.9

# main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 在路由中使用
@router.post("/lookup")
@limiter.limit("10/minute")
async def lookup_ip(request: Request, ...):
    pass
```

---

## 环境变量配置

### .env.example

```env
# 应用配置
APP_NAME=Just Tools API
APP_VERSION=1.0.0
DEBUG=False

# 服务器配置
HOST=0.0.0.0
PORT=8000

# CORS 配置
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# API 密钥
IP_API_KEY=your_api_key_here
EXTERNAL_API_TIMEOUT=10

# 速率限制
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# 日志配置
LOG_LEVEL=INFO
LOG_FILE=logs/app.log
```

---

## Docker 部署

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制代码
COPY ./app ./app

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
```

---

## requirements.txt

```txt
fastapi==0.115.0
uvicorn[standard]==0.34.0
pydantic==2.10.5
pydantic-settings==2.7.1
httpx==0.28.1
python-dotenv==1.0.1
slowapi==0.1.9
```

---

## 运行和测试

### 本地运行

```bash
# 安装依赖
pip install -r requirements.txt

# 运行开发服务器
uvicorn app.main:app --reload --port 8000

# 访问文档
# http://localhost:8000/docs
```

### 测试 API

```bash
# 使用 curl
curl -X POST http://localhost:8000/api/ip/lookup \
  -H "Content-Type: application/json" \
  -d '{"ip": "8.8.8.8"}'

# 使用 httpie
http POST localhost:8000/api/ip/lookup ip=8.8.8.8
```

---

## API 文档

FastAPI 自动生成交互式文档：

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

---

## 安全建议

1. **输入验证**: 使用 Pydantic 模型验证所有输入
2. **速率限制**: 防止 API 滥用
3. **CORS 配置**: 仅允许信任的域名
4. **API 密钥**: 敏感 API 使用密钥保护
5. **日志记录**: 记录所有 API 请求和错误
6. **错误处理**: 不暴露内部错误详情
7. **HTTPS**: 生产环境必须使用 HTTPS

---

## 监控和日志

### 日志配置

```python
import logging
from logging.handlers import RotatingFileHandler

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        RotatingFileHandler(
            'logs/app.log',
            maxBytes=10485760,  # 10MB
            backupCount=5
        ),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)
```

---

## 前端集成

### API 客户端 (src/services/api.ts)

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: number;
  requestId?: string;
}

export async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<APIResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}
```

---

这套 API 设计规范为后端开发提供了完整的指导。随着项目发展，可以根据实际需求进行调整和扩展。
