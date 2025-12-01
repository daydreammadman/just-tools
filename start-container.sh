#!/bin/bash

# ==========================================
# Docker 容器启动和更新脚本
# ==========================================

set -e

# --- [配置区域] 修改这里即可复用脚本 ---
ALIYUN_REGISTRY="crpi-t61gwpgf50g1a2tn.cn-hangzhou.personal.cr.aliyuncs.com"
ALIYUN_NAMESPACE="tomoto"
ALIYUN_REPO="just-tools"
CONTAINER_NAME="just-tools-app"
# 容器端口映射 (宿主机:容器)
HOST_PORT="3000"
CONTAINER_PORT="80"
# ------------------------------------

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 辅助函数
print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# 检查 Docker 环境
check_environment() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装"
        exit 1
    fi
    if ! docker info &> /dev/null; then
        print_error "Docker 服务未运行"
        exit 1
    fi
}

# 获取默认版本
get_default_version() {
    if [ -f "package.json" ]; then
        grep -o '"version": *"[^"]*"' package.json | sed 's/"version": *"\([^"]*\)"/\1/' || echo "latest"
    else
        echo "latest"
    fi
}

# 停止并删除旧容器
remove_old_container() {
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_info "发现已存在的容器: ${CONTAINER_NAME}"
        
        # 检查容器是否正在运行
        if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
            print_info "正在停止容器..."
            docker stop "${CONTAINER_NAME}" > /dev/null
            print_success "容器已停止"
        fi
        
        print_info "正在删除容器..."
        docker rm "${CONTAINER_NAME}" > /dev/null
        print_success "旧容器已删除"
    else
        print_info "没有发现旧容器"
    fi
}

# 检查并拉取最新镜像
check_and_pull_image() {
    local IMAGE_TAG=$1
    local IMAGE_FULL="${ALIYUN_REGISTRY}/${ALIYUN_NAMESPACE}/${ALIYUN_REPO}:${IMAGE_TAG}"
    
    print_header "步骤 1/3: 检查镜像更新"
    
    # 检查本地是否有该镜像
    if docker images --format '{{.Repository}}:{{.Tag}}' | grep -q "^${IMAGE_FULL}$"; then
        print_info "本地已有镜像: ${IMAGE_FULL}"
        
        # 获取本地镜像 ID
        LOCAL_IMAGE_ID=$(docker images --format '{{.ID}}' "${IMAGE_FULL}")
        print_info "本地镜像 ID: ${LOCAL_IMAGE_ID}"
        
        # 尝试拉取最新版本
        print_info "正在检查远程是否有更新..."
        if docker pull "${IMAGE_FULL}" > /dev/null 2>&1; then
            NEW_IMAGE_ID=$(docker images --format '{{.ID}}' "${IMAGE_FULL}")
            
            if [ "${LOCAL_IMAGE_ID}" != "${NEW_IMAGE_ID}" ]; then
                print_success "发现新版本并已更新！"
                print_info "旧版本 ID: ${LOCAL_IMAGE_ID}"
                print_info "新版本 ID: ${NEW_IMAGE_ID}"
                
                # 清理旧镜像
                if docker rmi "${LOCAL_IMAGE_ID}" > /dev/null 2>&1; then
                    print_success "已清理旧镜像"
                fi
            else
                print_success "已是最新版本"
            fi
        else
            print_warning "无法检查更新，将使用本地镜像"
        fi
    else
        print_info "本地没有镜像，正在拉取..."
        if docker pull "${IMAGE_FULL}"; then
            print_success "镜像拉取成功"
        else
            print_error "镜像拉取失败！请检查："
            echo "1. 网络连接是否正常"
            echo "2. 镜像标签 ${IMAGE_TAG} 是否存在"
            echo "3. 是否需要执行 docker login ${ALIYUN_REGISTRY}"
            exit 1
        fi
    fi
    
    # 显示镜像信息
    IMAGE_SIZE=$(docker images "${IMAGE_FULL}" --format "{{.Size}}")
    print_info "镜像大小: ${IMAGE_SIZE}"
}

# 启动容器
start_container() {
    local IMAGE_TAG=$1
    local IMAGE_FULL="${ALIYUN_REGISTRY}/${ALIYUN_NAMESPACE}/${ALIYUN_REPO}:${IMAGE_TAG}"
    
    print_header "步骤 3/3: 启动容器"
    
    print_info "正在启动容器..."
    print_info "容器名称: ${CONTAINER_NAME}"
    print_info "端口映射: ${HOST_PORT}:${CONTAINER_PORT}"
    
    if docker run -d \
        --name "${CONTAINER_NAME}" \
        -p "${HOST_PORT}:${CONTAINER_PORT}" \
        --restart unless-stopped \
        "${IMAGE_FULL}"; then
        print_success "容器启动成功！"
        echo ""
        print_info "访问地址: http://localhost:${HOST_PORT}"
        echo ""
        print_info "容器管理命令："
        echo "  查看日志: docker logs ${CONTAINER_NAME}"
        echo "  停止容器: docker stop ${CONTAINER_NAME}"
        echo "  重启容器: docker restart ${CONTAINER_NAME}"
        echo "  删除容器: docker rm -f ${CONTAINER_NAME}"
    else
        print_error "容器启动失败！"
        exit 1
    fi
}

# 主函数
main() {
    print_header "Docker 容器启动工具"
    check_environment
    
    DEFAULT_VERSION=$(get_default_version)
    
    # 交互式输入
    echo ""
    read -p "$(echo -e ${YELLOW}请输入镜像版本标签 [默认: $DEFAULT_VERSION]: ${NC})" VERSION
    VERSION=${VERSION:-$DEFAULT_VERSION}
    
    IMAGE_FULL="${ALIYUN_REGISTRY}/${ALIYUN_NAMESPACE}/${ALIYUN_REPO}:${VERSION}"
    
    echo ""
    print_info "启动配置："
    echo "  - 镜像地址: ${IMAGE_FULL}"
    echo "  - 容器名称: ${CONTAINER_NAME}"
    echo "  - 端口映射: ${HOST_PORT}:${CONTAINER_PORT}"
    echo ""
    
    read -p "$(echo -e ${YELLOW}确认开始启动? [Y/n]: ${NC})" CONFIRM
    CONFIRM=${CONFIRM:-Y}
    if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
        print_warning "操作已取消"
        exit 0
    fi
    
    # 执行步骤
    check_and_pull_image "${VERSION}"
    
    print_header "步骤 2/3: 清理旧容器"
    remove_old_container
    
    start_container "${VERSION}"
    
    print_header "🎉 全部完成"
}

# 错误捕获
trap 'print_error "脚本异常中断"' ERR

main