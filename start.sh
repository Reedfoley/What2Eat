#!/bin/bash

# 统一启动脚本 - 同时启动后端和前端

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印函数
print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_step() {
    echo -e "${CYAN}[$1]${NC} $2"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 验证端口号
validate_port() {
    local port=$1
    if ! [[ "$port" =~ ^[0-9]+$ ]]; then
        echo "invalid"
        return 1
    fi
    if (( port < 1024 || port > 65535 )); then
        echo "invalid"
        return 1
    fi
    echo "$port"
    return 0
}

# 读取 .env 文件
read_env_file() {
    local env_file=$1
    local key=$2
    
    if [ ! -f "$env_file" ]; then
        return 1
    fi
    
    while IFS='=' read -r k v; do
        # 跳过空行和注释
        [[ -z "$k" || "$k" =~ ^# ]] && continue
        # 移除前后空格
        k=$(echo "$k" | xargs)
        v=$(echo "$v" | xargs)
        if [ "$k" = "$key" ]; then
            echo "$v"
            return 0
        fi
    done < "$env_file"
    
    return 1
}

# 获取前端端口
# 优先级: 命令行参数 > 环境变量 > .env.local > 默认值
get_frontend_port() {
    local cli_port=$1
    local default_port=7860
    local port_source="默认值"
    
    # 1. 检查命令行参数
    if [ -n "$cli_port" ]; then
        local validated=$(validate_port "$cli_port")
        if [ $? -eq 0 ]; then
            echo "$validated|命令行参数"
            return 0
        else
            print_warning "命令行参数端口无效: $cli_port，将使用其他配置源"
        fi
    fi
    
    # 2. 检查环境变量 PORT
    if [ -n "$PORT" ]; then
        local validated=$(validate_port "$PORT")
        if [ $? -eq 0 ]; then
            echo "$validated|环境变量 PORT"
            return 0
        else
            print_warning "环境变量 PORT 无效: $PORT，将使用其他配置源"
        fi
    fi
    
    # 3. 检查 .env.local 文件
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local env_local_path="$script_dir/frontend/.env.local"
    local file_port=$(read_env_file "$env_local_path" "NEXT_PUBLIC_PORT")
    if [ $? -eq 0 ] && [ -n "$file_port" ]; then
        local validated=$(validate_port "$file_port")
        if [ $? -eq 0 ]; then
            echo "$validated|.env.local 文件"
            return 0
        else
            print_warning ".env.local 中的 NEXT_PUBLIC_PORT 无效: $file_port，将使用默认值"
        fi
    fi
    
    # 4. 使用默认值
    echo "$default_port|默认值"
    return 0
}

# 解析命令行参数
FRONTEND_PORT=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --frontend-port)
            FRONTEND_PORT="$2"
            shift 2
            ;;
        --help|-h)
            echo "菜谱RAG系统 - 统一启动脚本"
            echo ""
            echo "用法: $0 [选项]"
            echo ""
            echo "选项:"
            echo "  --frontend-port PORT  前端应用端口 (1024-65535，默认: 7860)"
            echo "  --help, -h           显示此帮助信息"
            echo ""
            echo "示例:"
            echo "  $0                           # 使用默认端口 7860"
            echo "  $0 --frontend-port 3001     # 使用端口 3001"
            echo "  PORT=3002 $0                # 通过环境变量指定端口"
            exit 0
            ;;
        *)
            print_error "未知选项: $1"
            echo "使用 --help 查看帮助信息"
            exit 1
            ;;
    esac
done

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 初始化变量
BACKEND_PID=""
FRONTEND_PID=""

# 错误处理
cleanup() {
    print_warning "正在关闭服务..."
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    # 等待进程终止
    if [ -n "$BACKEND_PID" ]; then
        wait $BACKEND_PID 2>/dev/null
    fi
    if [ -n "$FRONTEND_PID" ]; then
        wait $FRONTEND_PID 2>/dev/null
    fi
    
    print_success "所有服务已关闭"
    exit 0
}

trap cleanup SIGINT SIGTERM

print_header "菜谱RAG系统 - 统一启动脚本"

# 获取前端端口配置
PORT_INFO=$(get_frontend_port "$FRONTEND_PORT")
FRONTEND_PORT=$(echo "$PORT_INFO" | cut -d'|' -f1)
PORT_SOURCE=$(echo "$PORT_INFO" | cut -d'|' -f2)

# 启动后端
print_step "1/2" "启动后端服务 (Port 8000)..."
cd backend
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
fi
python main.py &
BACKEND_PID=$!
cd ..

if [ $? -ne 0 ]; then
    print_error "启动后端失败"
    exit 1
fi

print_success "后端服务已启动"

# 等待后端启动
sleep 3

# 启动前端
print_step "2/2" "启动前端应用 (Port $FRONTEND_PORT)..."
cd frontend
PORT=$FRONTEND_PORT npm run dev &
FRONTEND_PID=$!
cd ..

if [ $? -ne 0 ]; then
    print_error "启动前端失败"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

print_success "前端应用已启动"

print_header "✅ 系统启动完成！"
echo -e "${GREEN}后端服务: ${BLUE}http://localhost:8000${NC}"
echo -e "${GREEN}前端应用: ${BLUE}http://localhost:$FRONTEND_PORT${NC}"
echo -e "${CYAN}  (配置来源: $PORT_SOURCE)${NC}"
echo -e "${GREEN}API文档: ${BLUE}http://localhost:8000/docs${NC}"
echo ""
echo -e "${YELLOW}按 Ctrl+C 停止所有服务...${NC}"
echo ""

# 等待进程
wait $BACKEND_PID $FRONTEND_PID
