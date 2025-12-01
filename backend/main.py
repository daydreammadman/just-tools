"""
Just Tools - Backend API Server
FastAPI 后端服务，用于获取客户端网络信息
"""

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import httpx
import os

app = FastAPI(
    title="Just Tools API",
    description="后端 API 服务",
    version="1.0.0"
)

# 需要排除的敏感 Headers
EXCLUDED_HEADERS = {
    "cookie",
    "authorization",
    "x-api-key",
    "x-auth-token",
}


def get_client_ip(request: Request) -> str:
    """获取客户端真实 IP"""
    # 优先检查代理转发的头
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip

    # 直接连接的客户端 IP
    return request.client.host if request.client else "unknown"


def filter_headers(headers: dict) -> dict:
    """过滤敏感 Headers"""
    return {
        key: value
        for key, value in headers.items()
        if key.lower() not in EXCLUDED_HEADERS
    }


async def get_ip_location(ip: str) -> dict:
    """通过第三方 API 获取 IP 地理位置信息"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            # 使用 ip-api.com (免费，支持中文)
            response = await client.get(f"http://ip-api.com/json/{ip}?lang=zh-CN")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success":
                    return {
                        "location": f"{data.get('country', '')} {data.get('regionName', '')} {data.get('city', '')}".strip(),
                        "isp": data.get("isp", "未知"),
                    }
    except Exception as e:
        print(f"获取 IP 位置失败: {e}")

    return {"location": "未知", "isp": "未知"}


@app.get("/api/system-info")
async def get_system_info(request: Request):
    """
    获取客户端系统信息
    返回: IP 地址、地理位置、ISP、HTTP Headers
    """
    # 获取客户端 IP
    client_ip = get_client_ip(request)

    # 获取 IP 地理位置
    location_info = await get_ip_location(client_ip)

    # 过滤并获取 Headers
    headers = dict(request.headers)
    filtered_headers = filter_headers(headers)

    return {
        "ip": client_ip,
        "location": location_info["location"],
        "isp": location_info["isp"],
        "headers": filtered_headers,
    }


@app.get("/api/health")
async def health_check():
    """健康检查端点"""
    return {"status": "ok"}


# Mount the static files directory (without html=True to prevent auto-serving)
app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")


@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    """
    Catch-all 路由：处理所有未匹配的请求
    如果是静态文件存在则返回，否则返回 index.html（用于 SPA 路由）
    """
    # 构建文件路径
    file_path = os.path.join("dist", full_path)
    
    # 如果文件存在，直接返回
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # 否则返回 index.html（SPA fallback）
    return FileResponse("dist/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
