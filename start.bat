@echo off
REM 统一启动脚本 - 同时启动后端和前端
setlocal enabledelayedexpansion

REM 初始化变量
set "FRONTEND_PORT="
set "DEFAULT_PORT=7860"
set "PORT_SOURCE=默认值"

REM 解析命令行参数
:parse_args
if "%1"=="" goto args_done
if "%1"=="--frontend-port" (
    set "FRONTEND_PORT=%2"
    shift
    shift
    goto parse_args
)
if "%1"=="--help" goto show_help
if "%1"=="-h" goto show_help
echo 未知选项: %1
echo 使用 --help 查看帮助信息
exit /b 1

:show_help
echo 菜谱RAG系统 - 统一启动脚本
echo.
echo 用法: %0 [选项]
echo.
echo 选项:
echo   --frontend-port PORT  前端应用端口 (1024-65535，默认: 7860)
echo   --help, -h           显示此帮助信息
echo.
echo 示例:
echo   %0                           REM 使用默认端口 7860
echo   %0 --frontend-port 3001     REM 使用端口 3001
echo   set PORT=3002 ^& %0         REM 通过环境变量指定端口
exit /b 0

:args_done
REM 获取前端端口配置
REM 优先级: 命令行参数 > 环境变量 > .env.local > 默认值

REM 1. 检查命令行参数
if not "!FRONTEND_PORT!"=="" (
    call :validate_port !FRONTEND_PORT!
    if not errorlevel 1 (
        set "PORT_SOURCE=命令行参数"
        goto port_determined
    ) else (
        echo 警告: 命令行参数端口无效: !FRONTEND_PORT!，将使用其他配置源
        set "FRONTEND_PORT="
    )
)

REM 2. 检查环境变量 PORT
if not "!PORT!"=="" (
    call :validate_port !PORT!
    if not errorlevel 1 (
        set "FRONTEND_PORT=!PORT!"
        set "PORT_SOURCE=环境变量 PORT"
        goto port_determined
    ) else (
        echo 警告: 环境变量 PORT 无效: !PORT!，将使用其他配置源
    )
)

REM 3. 检查 .env.local 文件
if exist "frontend\.env.local" (
    for /f "tokens=1,2 delims==" %%A in (frontend\.env.local) do (
        if "%%A"=="NEXT_PUBLIC_PORT" (
            call :validate_port %%B
            if not errorlevel 1 (
                set "FRONTEND_PORT=%%B"
                set "PORT_SOURCE=.env.local 文件"
                goto port_determined
            ) else (
                echo 警告: .env.local 中的 NEXT_PUBLIC_PORT 无效: %%B，将使用默认值
            )
        )
    )
)

REM 4. 使用默认值
:port_determined
if "!FRONTEND_PORT!"=="" (
    set "FRONTEND_PORT=!DEFAULT_PORT!"
    set "PORT_SOURCE=默认值"
)

echo ========================================
echo 菜谱RAG系统 - 统一启动脚本
echo ========================================
echo.

REM 启动后端
echo [1/2] 启动后端服务 (Port 8000)...
start "Recipe RAG Backend" cmd /k "cd backend && venv\Scripts\activate.bat && python main.py"

REM 等待后端启动
timeout /t 3 /nobreak

REM 启动前端
echo [2/2] 启动前端应用 (Port !FRONTEND_PORT!)...
start "Recipe RAG Frontend" cmd /k "cd frontend && set PORT=!FRONTEND_PORT! && npm run dev"

echo.
echo ========================================
echo ✅ 系统启动完成！
echo ========================================
echo.
echo 后端服务: http://localhost:8000
echo 前端应用: http://localhost:!FRONTEND_PORT!
echo   (配置来源: !PORT_SOURCE!)
echo API文档: http://localhost:8000/docs
echo.
echo 按任意键关闭此窗口...
pause
exit /b 0

REM 验证端口号的子程序
REM 参数: %1 = 端口号
REM 返回: errorlevel 0 = 有效, errorlevel 1 = 无效
:validate_port
setlocal
set "port=%1"

REM 检查是否为空
if "!port!"=="" (
    endlocal
    exit /b 1
)

REM 检查是否为数字（简单检查）
for /f %%A in ('echo !port! ^| findstr /r "^[0-9]*$"') do (
    set "is_number=1"
)

if not defined is_number (
    endlocal
    exit /b 1
)

REM 检查范围 1024-65535
if !port! LSS 1024 (
    endlocal
    exit /b 1
)
if !port! GTR 65535 (
    endlocal
    exit /b 1
)

endlocal
exit /b 0
