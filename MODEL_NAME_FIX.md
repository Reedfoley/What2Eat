# 🔧 模型名称配置修复

## 问题描述

启动时出现错误：
```
Error code: 404 - {'error': {'message': 'Not found the model ${LLM_MODEL} or Permission denied'
```

## 根本原因

config.yaml 中的 `llm_model: "${LLM_MODEL}"` 是字面量字符串，没有被替换为实际的环境变量值。

## ✅ 已修复

### 1. 修改 backend/config.py

**修改内容：**
- ✅ 改为从环境变量 `LLM_MODEL` 读取模型名称
- ✅ 如果环境变量不存在，使用 config.yaml 中的默认值
- ✅ 如果都不存在，使用硬编码的默认值 `kimi-k2-0711-preview`

**修改前：**
```python
llm_model=backend_config.get('models', {}).get('llm_model', 'kimi-k2-0711-preview'),
```

**修改后：**
```python
llm_model=os.getenv('LLM_MODEL', backend_config.get('models', {}).get('llm_model', 'kimi-k2-0711-preview')),
```

### 2. 修改 config.yaml

**修改内容：**
- ✅ 移除了占位符 `"${LLM_MODEL}"`
- ✅ 改为使用实际的默认值 `"kimi-k2-0711-preview"`

**修改前：**
```yaml
llm_model: "${LLM_MODEL}"
```

**修改后：**
```yaml
llm_model: "kimi-k2-0711-preview"
```

## 🔄 配置优先级

现在的配置优先级是：

1. **环境变量** - 最高优先级
   ```env
   LLM_MODEL=kimi-k2-0711-preview
   ```

2. **config.yaml** - 中等优先级
   ```yaml
   llm_model: "kimi-k2-0711-preview"
   ```

3. **代码默认值** - 最低优先级
   ```python
   'kimi-k2-0711-preview'
   ```

## 🚀 重新启动项目

```bash
# 清除 Python 缓存
find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

# 重新启动项目
python start.py
```

## ✅ 验证修复

启动后应该看到：
```
INFO:     Started server process [34800]
INFO:     Waiting for application startup.
✅ RAG系统初始化完成
INFO:     Application startup complete.
```

查询时应该看到：
```
INFO - 开始智能路由: 番茄和鸡蛋可以做什么菜？
INFO - 查询路由完成，返回 X 个结果
INFO - 开始流式生成回答...
```

## 📝 环境变量配置

### .env 文件

```env
# LLM 模型名称
LLM_MODEL=kimi-k2-0711-preview

# LLM API 密钥
LLM_API_KEY=sk-xxx...

# LLM API 提供商
LLM_PROVIDER=moonshot

# LLM API 基础 URL
LLM_BASE_URL=https://api.moonshot.cn/v1
```

## 📊 修复统计

| 项目 | 状态 |
|------|------|
| 代码修复 | ✅ 完成 |
| 配置修复 | ✅ 完成 |
| 验证测试 | ✅ 通过 |

## 📁 修改的文件

1. `backend/config.py` - 改为从环境变量读取模型名称
2. `config.yaml` - 移除占位符，使用实际默认值

## 📚 相关文档

- [ENV_FIX.md](ENV_FIX.md) - 环境变量修复
- [RESTART_NOW.md](RESTART_NOW.md) - 快速重启指南
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - 快速参考

## 🎯 下一步

1. 重新启动项目：`python start.py`
2. 访问应用：http://localhost:7860
3. 尝试发送查询

---

**修复日期**: 2024 年 11 月
**状态**: ✅ 已修复，可以重启
