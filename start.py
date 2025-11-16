#!/usr/bin/env python3
"""
菜谱RAG系统 - 统一启动脚本
同时启动后端服务和前端应用
"""

import os
import sys
import subprocess
import time
import platform
import argparse
from pathlib import Path

# 获取项目根目录
PROJECT_ROOT = Path(__file__).parent.absolute()
BACKEND_DIR = PROJECT_ROOT / "backend"
FRONTEND_DIR = PROJECT_ROOT / "frontend"

# 颜色输出
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(text):
    """打印标题"""
    print(f"\n{Colors.BOLD}{Colors.OKBLUE}{'='*50}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.OKBLUE}{text}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.OKBLUE}{'='*50}{Colors.ENDC}\n")

def print_step(step, text):
    """打印步骤"""
    print(f"{Colors.OKCYAN}[{step}]{Colors.ENDC} {text}")

def print_success(text):
    """打印成功信息"""
    print(f"{Colors.OKGREEN}✅ {text}{Colors.ENDC}")

def print_error(text):
    """打印错误信息"""
    print(f"{Colors.FAIL}❌ {text}{Colors.ENDC}")

def print_warning(text):
    """打印警告信息"""
    print(f"{Colors.WARNING}⚠️  {text}{Colors.ENDC}")

def validate_port(port):
    """
    验证端口号是否有效
    
    Args:
        port: 端口号（整数或字符串）
    
    Returns:
        tuple: (是否有效, 端口号或错误信息)
    """
    try:
        port_num = int(port)
        if 1024 <= port_num <= 65535:
            return True, port_num
        else:
            return False, f"端口号必须在 1024-65535 范围内，当前值: {port_num}"
    except (ValueError, TypeError):
        return False, f"端口号必须是整数，当前值: {port}"

def read_env_file(env_file_path):
    """
    读取 .env 文件并返回环境变量字典
    
    Args:
        env_file_path: .env 文件路径
    
    Returns:
        dict: 环境变量字典
    """
    env_vars = {}
    if not env_file_path.exists():
        return env_vars
    
    try:
        with open(env_file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                # 跳过空行和注释
                if not line or line.startswith('#'):
                    continue
                # 解析 KEY=VALUE 格式
                if '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
    except Exception as e:
        print_warning(f"读取 .env 文件失败: {str(e)}")
    
    return env_vars

def get_frontend_port(cli_port=None):
    """
    根据优先级获取前端端口
    优先级: 命令行参数 > 环境变量 > .env.local > 默认值
    
    Args:
        cli_port: 命令行参数指定的端口
    
    Returns:
        tuple: (端口号, 配置来源)
    """
    default_port = 7860
    
    # 1. 检查命令行参数
    if cli_port is not None:
        is_valid, result = validate_port(cli_port)
        if is_valid:
            return result, "命令行参数"
        else:
            print_warning(f"命令行参数端口无效: {result}，将使用其他配置源")
    
    # 2. 检查环境变量 PORT
    env_port = os.environ.get('PORT')
    if env_port is not None:
        is_valid, result = validate_port(env_port)
        if is_valid:
            return result, "环境变量 PORT"
        else:
            print_warning(f"环境变量 PORT 无效: {result}，将使用其他配置源")
    
    # 3. 检查 .env.local 文件
    env_local_path = FRONTEND_DIR / ".env.local"
    env_vars = read_env_file(env_local_path)
    file_port = env_vars.get('NEXT_PUBLIC_PORT')
    if file_port is not None:
        is_valid, result = validate_port(file_port)
        if is_valid:
            return result, ".env.local 文件"
        else:
            print_warning(f".env.local 中的 NEXT_PUBLIC_PORT 无效: {result}，将使用默认值")
    
    # 4. 使用默认值
    return default_port, "默认值"

def start_backend():
    """启动后端服务"""
    print_step("1/2", "启动后端服务 (Port 8000)...")
    
    try:
        # 启动后端进程
        backend_process = subprocess.Popen(
            [sys.executable, "main.py"],
            cwd=str(BACKEND_DIR)
        )
        
        print_success("后端服务已启动")
        return backend_process
    except Exception as e:
        print_error(f"启动后端失败: {str(e)}")
        raise

def start_frontend(port):
    """
    启动前端应用
    
    Args:
        port: 前端应用端口号
    """
    print_step("2/2", f"启动前端应用 (Port {port})...")
    
    try:
        # 设置环境变量
        env = os.environ.copy()
        env['PORT'] = str(port)
        
        # 启动前端进程
        if platform.system() == "Windows":
            frontend_process = subprocess.Popen(
                "npm run dev",
                cwd=str(FRONTEND_DIR),
                shell=True,
                env=env
            )
        else:
            frontend_process = subprocess.Popen(
                ["npm", "run", "dev"],
                cwd=str(FRONTEND_DIR),
                env=env
            )
        
        print_success("前端应用已启动")
        return frontend_process
    except Exception as e:
        print_error(f"启动前端失败: {str(e)}")
        raise

def main():
    """主函数"""
    # 解析命令行参数
    parser = argparse.ArgumentParser(
        description="菜谱RAG系统 - 统一启动脚本",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python start.py                           # 使用默认端口 7860
  python start.py --frontend-port 3001     # 使用端口 3001
  PORT=3002 python start.py                # 通过环境变量指定端口
        """
    )
    parser.add_argument(
        '--frontend-port',
        type=int,
        default=None,
        help='前端应用端口 (1024-65535，默认: 7860)'
    )
    
    args = parser.parse_args()
    
    backend_process = None
    frontend_process = None
    
    try:
        print_header("菜谱RAG系统 - 统一启动脚本")
        
        # 获取前端端口配置
        frontend_port, port_source = get_frontend_port(args.frontend_port)
        
        # 启动服务
        backend_process = start_backend()
        
        # 等待后端启动
        time.sleep(3)
        
        frontend_process = start_frontend(frontend_port)
        
        # 打印启动完成信息
        print_header("✅ 系统启动完成！")
        print(f"{Colors.OKGREEN}后端服务: {Colors.BOLD}http://localhost:8000{Colors.ENDC}")
        print(f"{Colors.OKGREEN}前端应用: {Colors.BOLD}http://localhost:{frontend_port}{Colors.ENDC}")
        print(f"{Colors.OKCYAN}  (配置来源: {port_source}){Colors.ENDC}")
        print(f"{Colors.OKGREEN}API文档: {Colors.BOLD}http://localhost:8000/docs{Colors.ENDC}")
        print(f"\n{Colors.WARNING}按 Ctrl+C 停止所有服务...{Colors.ENDC}\n")
        
        # 等待进程
        if backend_process:
            backend_process.wait()
        if frontend_process:
            frontend_process.wait()
        
    except KeyboardInterrupt:
        print_warning("\n正在关闭服务...")
        if backend_process:
            backend_process.terminate()
        if frontend_process:
            frontend_process.terminate()
        
        # 等待进程终止
        try:
            if backend_process:
                backend_process.wait(timeout=5)
            if frontend_process:
                frontend_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            if backend_process:
                backend_process.kill()
            if frontend_process:
                frontend_process.kill()
        
        print_success("所有服务已关闭")
        sys.exit(0)
    except Exception as e:
        print_error(f"启动失败: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
