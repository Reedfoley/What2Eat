# 🚀 最终重启指南

## ✅ 所有问题已修复

1. ✅ 环境变量配置已修复
2. ✅ 模型名称配置已修复
3. ✅ API 密钥配置已修复

## 🚀 立即重启（3 步）

### 第一步：停止所有服务

按 `Ctrl+C` 停止所有运行的服务

### 第二步：清除缓存

```bash
# 清除 Python 缓存
find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

# 清除 npm 缓存（可选）
npm cache clean --force
```

### 第三步：重新启动

```bash
python start.py
```

## ✅ 预期输出

### 后端启动

```
INFO:     Started server process [34800]
INFO:     Waiting for application startup.
✅ RAG系统初始化完成
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 前端启动

```
> next dev
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.5s
```

## 📍 访问应用

打开浏览器访问：http://localhost:7860

## 🧪 测试功能

1. 在输入框输入问题：`番茄和鸡蛋可以做什么菜？`
2. 点击发送
3. 应该看到流式输出的回答

## 🐛 如果仍然出现错误

### 错误：模型不存在

```
Error code: 404 - Not found the model xxx
```

**检查 .env 文件：**
```bash
cat .env | grep LLM_MODEL
```

**应该看到：**
```
LLM_MODEL=kimi-k2-0711-preview
```

### 错误：API 密钥无效

```
Error code: 401 - Unauthorized
```

**检查 API 密钥：**
```bash
cat .env | grep LLM_API_KEY
```

**确保密钥有效且没有引号**

### 错误：无法连接数据库

```
Failed to connect to Neo4j
```

**检查 Docker：**
```bash
docker ps
```

**应该看到 neo4j 和 milvus 容器**

## 📝 修复内容

### 修复 1：环境变量配置
- ✅ 改为使用 `LLM_API_KEY` 而不是 `MOONSHOT_API_KEY`
- ✅ 改为使用 `LLM_BASE_URL` 而不是硬编码 URL
- ✅ 移除了 .env 中 API 密钥的引号

### 修复 2：模型名称配置
- ✅ 改为从环境变量 `LLM_MODEL` 读取
- ✅ 移除了 config.yaml 中的占位符 `${LLM_MODEL}`
- ✅ 使用实际的默认值

### 修复 3：代码更新
- ✅ 更新了 `backend/rag_modules/generation_integration.py`
- ✅ 更新了 `backend/config.py`

## 📚 相关文档

- [ENV_FIX.md](ENV_FIX.md) - 环境变量修复
- [MODEL_NAME_FIX.md](MODEL_NAME_FIX.md) - 模型名称修复
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - 快速参考

## ✨ 完成后

项目启动成功后，你可以：

1. 访问应用：http://localhost:7860
2. 查看 API 文档：http://localhost:8000/docs
3. 开始使用菜谱 RAG 系统

## 🎯 下一步

```bash
# 一键重启
find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true && python start.py
```

---

**修复日期**: 2024 年 11 月
**状态**: ✅ 所有问题已修复，可以重启
**下一步**: 运行 `python start.py`
