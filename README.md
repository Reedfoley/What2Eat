# 菜谱 RAG 系统

基于检索增强生成(RAG)技术的智能菜谱问答系统，支持流式输出和实时显示。通过结合传统向量检索和图数据库的知识图谱检索，提供精准的菜谱推荐和烹饪指导。

> 📖 **快速开始？** 查看 [README.md](README.md) 获取详细的设置步骤

## 🌟 功能特性

- 🔍 **智能检索** - 基于向量相似度和知识图谱的混合检索
- 🚀 **流式输出** - 实时显示 LLM 生成的内容，提升用户体验
- 📊 **多种检索策略** - 传统检索、图 RAG、智能路由自动选择
- 💬 **对话界面** - 现代化的前端交互体验，支持移动端
- 📈 **实时统计** - 知识库、路由、数据库等多维度统计信息
- 🔄 **自适应学习** - 基于查询复杂度自动选择最优检索策略

## 📋 快速开始

### 前置要求

- Python 3.10+
- Node.js 18+
- Neo4j 5.x
- Milvus 2.x
- Docker & Docker Compose（用于启动数据库）

### 安装步骤

```bash
# 1. 启动数据库服务
cd data
docker-compose up -d

# 2. 返回项目根目录
cd ..

# 3. 安装后端依赖
pip install -r backend/requirements.txt

# 4. 安装前端依赖
cd frontend
npm install
cd ..

# 5. 配置环境变量
# 复制 .env.example 为 .env
cp .env.example .env

# 6. 编辑 .env 文件，填入你的 LLM API 密钥
# 必需配置：
# - LLM_API_KEY: 从 LLM 提供商获取的 API 密钥
# 可选配置：
# - LLM_MODEL: LLM 模型名称（默认: kimi-k2-0711-preview）
# - LLM_PROVIDER: LLM 提供商（默认: moonshot）
# - LLM_BASE_URL: LLM API 基础 URL（默认: https://api.moonshot.cn/v1）

# 7. 配置 config.yaml（根据实际环境修改）
# 主要配置项：
# - backend.neo4j: Neo4j 连接信息
# - backend.milvus: Milvus 连接信息
# - backend.models.embedding_model: 嵌入模型路径
```

### 运行应用

**⚠️ 重要：确保已完成上述安装步骤，特别是配置 .env 文件**

```bash
# 方式一：使用统一启动脚本（推荐）
python start.py

# 方式二：分别启动前后端
# 终端 1：启动后端
python backend/main.py

# 终端 2：启动前端
cd frontend
npm run dev
```

访问应用：http://localhost:7860

**常见错误：**
- 如果看到 `LLM_API_KEY 环境变量` 错误，请检查 .env 文件是否正确配置
- 如果无法连接后端，请检查 config.yaml 中的数据库配置

## 📁 项目结构

```
菜谱RAG系统/
├── backend/                          # 后端服务（Python/FastAPI）
│   ├── main.py                       # FastAPI 应用入口，定义 API 端点
│   ├── rag.py                        # RAG 系统核心类，整合所有模块
│   ├── config.py                     # 配置管理，从 config.yaml 读取配置
│   ├── requirements.txt              # Python 依赖列表
│   ├── __init__.py                   # 包初始化文件
│   └── rag_modules/                  # RAG 核心模块
│       ├── __init__.py               # 模块导出
│       ├── graph_data_preparation.py # 图数据准备：加载 Neo4j 数据，构建菜谱文档
│       ├── milvus_index_construction.py # Milvus 向量索引：构建和管理向量数据库
│       ├── hybrid_retrieval.py       # 混合检索：结合向量和关键词检索
│       ├── graph_rag_retrieval.py    # 图 RAG 检索：利用知识图谱进行深度检索
│       ├── intelligent_query_router.py # 智能路由：分析查询并选择最优策略
│       ├── generation_integration.py # 生成模块：调用 LLM 生成回答
│       └── graph_indexing.py         # 图索引：构建和管理图数据结构
│
├── frontend/                         # 前端应用（React/Next.js）
│   ├── app/                          # Next.js 应用目录
│   │   └── page.tsx                  # 主页面组件，包含欢迎屏幕和聊天界面
│   ├── components/                   # React 组件库
│   │   ├── chat/                     # 聊天相关组件
│   │   │   ├── ChatContainer.tsx     # 聊天容器，管理消息显示和输入
│   │   │   ├── MessageList.tsx       # 消息列表，显示所有聊天消息
│   │   │   └── InputBox.tsx          # 输入框，处理用户输入和发送
│   │   ├── layout/                   # 布局组件
│   │   │   └── Header.tsx            # 页面头部，包含标题和操作按钮
│   │   ├── stats/                    # 统计信息组件
│   │   │   └── StatsDashboard.tsx    # 统计仪表板，显示系统统计信息
│   │   ├── documents/                # 文档显示组件
│   │   │   └── DocumentCard.tsx      # 文档卡片，显示相关菜谱文档
│   │   └── ui/                       # 通用 UI 组件
│   │       ├── Toast.tsx             # 通知提示组件
│   │       ├── Loading.tsx           # 加载指示器
│   │       └── Button.tsx            # 按钮组件
│   ├── lib/                          # 工具函数和类型定义
│   │   ├── api.ts                    # API 客户端，处理与后端通信
│   │   ├── types.ts                  # TypeScript 类型定义
│   │   ├── errorHandler.ts           # 错误处理工具
│   │   ├── animations.ts             # 动画配置
│   │   └── utils.ts                  # 通用工具函数
│   ├── store/                        # Zustand 状态管理
│   │   ├── chatStore.ts              # 聊天状态：消息、加载状态、错误
│   │   ├── uiStore.ts                # UI 状态：侧边栏、主题、移动设备检测
│   │   ├── statsStore.ts             # 统计状态：系统统计信息
│   │   ├── toastStore.ts             # 通知状态：提示消息队列
│   │   └── index.ts                  # Store 导出
│   ├── hooks/                        # React 自定义 Hook
│   ├── package.json                  # 前端依赖和脚本
│   ├── tsconfig.json                 # TypeScript 配置
│   ├── next.config.js                # Next.js 配置
│   ├── tailwind.config.ts            # Tailwind CSS 配置
│   ├── postcss.config.js             # PostCSS 配置
│   └── .eslintrc.json                # ESLint 代码检查配置
│
├── data/                             # 数据库配置
│   ├── docker-compose.yml            # Docker Compose 配置，定义 Neo4j 和 Milvus 服务
│   └── cypher/                       # Cypher 查询脚本（Neo4j 图数据库查询语言）
│
├── dishes/                           # 菜谱数据源
│   ├── aquatic/                      # 水产菜
│   ├── breakfast/                    # 早餐
│   ├── condiment/                    # 调味料
│   ├── dessert/                      # 甜点
│   ├── drink/                        # 饮品
│   ├── meat_dish/                    # 肉类菜
│   ├── semi-finished/                # 半成品
│   ├── soup/                         # 汤类
│   ├── staple/                       # 主食
│   ├── template/                     # 菜谱模板
│   └── vegetable_dish/               # 蔬菜菜
│
├── config.yaml                       # 统一配置文件（后端、前端、数据库、日志）
├── start.py                          # Python 统一启动脚本
├── start.sh                          # Shell 统一启动脚本（Linux/Mac）
├── start.bat                         # Batch 统一启动脚本（Windows）
├── .env                              # 环境变量文件
├── .gitignore                        # Git 忽略文件
└── README.md                         # 项目说明文档
```

## 🔧 核心模块说明

### 后端模块

#### 1. **main.py** - FastAPI 应用
- 定义 REST API 端点
- 处理 CORS 跨域请求
- 实现流式响应和非流式响应
- 提供健康检查和统计接口

**主要端点：**
- `POST /api/query` - 查询接口（支持流式和非流式）
- `GET /api/stats` - 统计信息接口
- `GET /api/health` - 健康检查接口

#### 2. **rag.py** - RAG 系统核心
- 整合所有 RAG 模块
- 管理系统生命周期（初始化、构建、清理）
- 提供统一的问答接口
- 支持交互式命令行界面

**主要类：**
- `AdvancedGraphRAGSystem` - 高级图 RAG 系统

#### 3. **config.py** - 配置管理
- 从 `config.yaml` 读取配置
- 提供类型安全的配置对象
- 支持配置验证和默认值

**主要类：**
- `GraphRAGConfig` - 配置数据类

#### 4. **rag_modules/** - RAG 核心模块

##### graph_data_preparation.py
- 从 Neo4j 加载图数据
- 构建菜谱文档
- 进行文本分块
- 获取知识库统计信息

**主要类：**
- `GraphDataPreparationModule` - 图数据准备模块

##### milvus_index_construction.py
- 构建 Milvus 向量索引
- 管理向量数据库集合
- 提供向量搜索功能
- 获取集合统计信息

**主要类：**
- `MilvusIndexConstructionModule` - Milvus 索引构建模块

##### hybrid_retrieval.py
- 结合向量相似度和关键词检索
- 实现混合检索策略
- 对检索结果进行排序和融合

**主要类：**
- `HybridRetrievalModule` - 混合检索模块

##### graph_rag_retrieval.py
- 利用知识图谱进行深度检索
- 实现多跳遍历
- 提取相关子图
- 进行关系推理

**主要类：**
- `GraphRAGRetrieval` - 图 RAG 检索模块

##### intelligent_query_router.py
- 分析查询复杂度
- 检测关系密集度
- 自动选择最优检索策略
- 记录路由统计信息

**主要类：**
- `IntelligentQueryRouter` - 智能查询路由器
- `QueryAnalysis` - 查询分析结果

##### generation_integration.py
- 调用 LLM API 生成回答
- 支持流式和非流式生成
- 实现自适应回答生成
- 处理 API 错误和重试

**主要类：**
- `GenerationIntegrationModule` - 生成集成模块

##### graph_indexing.py
- 构建图索引结构
- 支持高效的图查询
- 管理节点和边的关系

**主要类：**
- `GraphIndexing` - 图索引模块

### 前端模块

#### 1. **app/page.tsx** - 主页面
- 应用主入口
- 管理页面级状态
- 处理响应式设计
- 显示欢迎屏幕和聊天界面

#### 2. **components/** - React 组件

##### chat/
- `ChatContainer.tsx` - 聊天容器，管理消息流和用户交互
- `MessageList.tsx` - 消息列表，显示聊天历史
- `InputBox.tsx` - 输入框，处理用户输入和发送

##### layout/
- `Header.tsx` - 页面头部，包含标题、清除历史、统计按钮

##### stats/
- `StatsDashboard.tsx` - 统计仪表板，显示系统统计信息

##### documents/
- `DocumentCard.tsx` - 文档卡片，显示相关菜谱

##### ui/
- `Toast.tsx` - 通知提示
- `Loading.tsx` - 加载指示器
- `Button.tsx` - 按钮组件

#### 3. **lib/** - 工具函数

##### api.ts
- 创建 Axios 实例
- 实现重试机制
- 处理流式响应
- 提供统一的 API 接口

**主要函数：**
- `api.query()` - 非流式查询
- `api.queryStream()` - 流式查询
- `api.getStats()` - 获取统计信息
- `api.healthCheck()` - 健康检查

##### types.ts
- 定义所有 TypeScript 类型
- 包括消息、文档、响应等类型

##### errorHandler.ts
- 统一错误处理
- 用户友好的错误消息
- 错误分类和重试判断

##### animations.ts
- 定义 Framer Motion 动画配置
- 页面过渡动画
- 组件进入/退出动画

##### utils.ts
- 通用工具函数
- 字符串处理、日期格式化等

#### 4. **store/** - Zustand 状态管理

##### chatStore.ts
- 管理聊天消息
- 处理流式消息更新
- 提供消息持久化

**主要方法：**
- `addMessage()` - 添加消息
- `startStreamingMessage()` - 开始流式消息
- `updateStreamingMessage()` - 更新流式消息
- `finalizeStreamingMessage()` - 完成流式消息
- `clearMessages()` - 清除所有消息

##### uiStore.ts
- 管理 UI 状态
- 侧边栏、主题、移动设备检测

**主要方法：**
- `toggleSidebar()` - 切换侧边栏
- `toggleStatsDashboard()` - 切换统计仪表板
- `setTheme()` - 设置主题
- `setIsMobile()` - 设置移动设备状态

##### statsStore.ts
- 管理统计信息
- 缓存系统统计数据

##### toastStore.ts
- 管理通知消息队列
- 提供通知显示和隐藏功能

## 🔌 API 文档

### 查询接口

**请求：**
```bash
POST /api/query
Content-Type: application/json

{
  "question": "如何做红烧肉？",
  "stream": false
}
```

**响应（非流式）：**
```json
{
  "answer": "红烧肉是一道经典的中式菜肴...",
  "strategy": "hybrid_traditional",
  "complexity": 0.65,
  "relationship_intensity": 0.45,
  "documents": [
    {
      "recipe_name": "红烧肉",
      "content": "材料：五花肉...",
      "search_type": "vector",
      "relevance_score": 0.92,
      "metadata": {}
    }
  ],
  "processing_time": 1.23
}
```

**流式响应：**
使用 Server-Sent Events (SSE) 格式，逐步返回内容。

### 统计接口

**请求：**
```bash
GET /api/stats
```

**响应：**
```json
{
  "knowledge_base": {
    "total_recipes": 1000,
    "total_ingredients": 500,
    "total_cooking_steps": 5000,
    "total_documents": 2000,
    "total_chunks": 10000,
    "categories": ["肉类", "蔬菜", "汤类", ...]
  },
  "routing": {
    "total_queries": 100,
    "traditional_count": 60,
    "traditional_ratio": 0.6,
    "graph_rag_count": 30,
    "graph_rag_ratio": 0.3,
    "combined_count": 10,
    "combined_ratio": 0.1
  },
  "milvus": {
    "row_count": 10000
  }
}
```

### 健康检查接口

**请求：**
```bash
GET /api/health
```

**响应：**
```json
{
  "status": "healthy",
  "system_ready": true,
  "message": "系统运行正常"
}
```

完整 API 文档：http://localhost:8000/docs

## ⚙️ 配置说明

### 环境变量配置 (.env)

**重要：LLM API 配置必须在 .env 文件中设置**

```bash
# 复制 .env.example 为 .env
cp .env.example .env
```

编辑 `.env` 文件，填入你的配置：

```env
# ============================================
# LLM API 配置（必需）
# ============================================

# LLM 模型名称
LLM_MODEL=kimi-k2-0711-preview

# LLM API 提供商
LLM_PROVIDER=moonshot

# LLM API 密钥（从 API 提供商获取）
# 例如：Moonshot API: https://platform.moonshot.cn/
LLM_API_KEY=your_api_key_here

# LLM API 基础 URL
LLM_BASE_URL=https://api.moonshot.cn/v1

# ============================================
# 生成配置（可选）
# ============================================

# 生成温度（0.0-1.0，越低越确定）
GENERATION_TEMPERATURE=0.1

# 最大生成令牌数
GENERATION_MAX_TOKENS=2048
```

### 项目配置 (config.yaml)

所有其他配置已整合到根目录的 `config.yaml` 文件中：

#### 后端配置
```yaml
backend:
  host: "0.0.0.0"
  port: 8000
  neo4j:
    uri: "bolt://localhost:7687"
    user: "neo4j"
    password: "all-in-rag"
    database: "neo4j"
  milvus:
    host: "localhost"
    port: 19530
    collection_name: "cooking_knowledge"
    dimension: 512
  models:
    embedding_model: "path/to/embedding/model"
    llm_model: "${LLM_MODEL}"  # 从 .env 读取
  retrieval:
    top_k: 5
    chunk_size: 500
    chunk_overlap: 50
    max_graph_depth: 2
  generation:
    temperature: 0.1
    max_tokens: 2048
```

#### 前端配置
```yaml
frontend:
  port: 7860
  api:
    base_url: "http://localhost:8000"
    timeout: 120000
```

#### 数据库配置
```yaml
# 在 data/docker-compose.yml 中定义
# Neo4j: localhost:7687
# Milvus: localhost:19530
```

### 配置优先级

1. **环境变量 (.env)** - 最高优先级，用于敏感信息（API 密钥等）
2. **config.yaml** - 项目配置文件
3. **默认值** - 代码中的硬编码默认值

## 🚀 技术栈

### 后端
- **框架**: FastAPI - 现代 Python Web 框架
- **数据库**: 
  - Neo4j - 图数据库，存储菜谱知识图谱
  - Milvus - 向量数据库，存储文本向量
- **LLM**: LangChain + Moonshot API - 大语言模型集成
- **文本处理**: jieba - 中文分词
- **配置**: PyYAML - YAML 配置文件解析

### 前端
- **框架**: React 18 + Next.js 14 - 全栈 React 框架
- **语言**: TypeScript - 类型安全的 JavaScript
- **样式**: Tailwind CSS - 实用优先的 CSS 框架
- **状态管理**: Zustand - 轻量级状态管理
- **动画**: Framer Motion - React 动画库
- **HTTP 客户端**: Axios - Promise 基础的 HTTP 客户端
- **代码检查**: ESLint - 代码质量检查

## 💡 核心特性详解

### 1. 智能查询路由

系统自动分析查询的复杂度和关系密集度，选择最优的检索策略：

- **传统检索** - 用于简单、直接的查询
- **图 RAG 检索** - 用于复杂、需要多跳推理的查询
- **组合策略** - 结合两种方法获得最佳结果

### 2. 混合检索

结合多种检索方法：
- 向量相似度检索 - 基于语义相似性
- 关键词检索 - 基于精确匹配
- 结果融合 - 综合排序

### 3. 图 RAG 检索

利用知识图谱的结构：
- 多跳遍历 - 从菜谱出发，遍历相关食材、烹饪方法等
- 子图提取 - 提取相关的图子结构
- 关系推理 - 利用节点间的关系进行推理

### 4. 流式输出

实时显示 LLM 生成的内容：
- 使用 Server-Sent Events (SSE) 协议
- 异步生成器逐步产生内容
- 前端实时接收和显示

### 5. 自适应生成

根据检索结果自动调整生成策略：
- 简洁回答 - 对于简单查询
- 详细回答 - 对于复杂查询
- 对比分析 - 对于多个相关结果

## 📊 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                     前端应用 (React/Next.js)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  页面 (page.tsx)                                      │   │
│  │  ├─ 聊天界面 (ChatContainer)                         │   │
│  │  ├─ 消息列表 (MessageList)                           │   │
│  │  ├─ 输入框 (InputBox)                                │   │
│  │  ├─ 统计仪表板 (StatsDashboard)                      │   │
│  │  └─ 通知提示 (Toast)                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  状态管理 (Zustand Store)                             │   │
│  │  ├─ chatStore - 聊天状态                             │   │
│  │  ├─ uiStore - UI 状态                                │   │
│  │  ├─ statsStore - 统计状态                            │   │
│  │  └─ toastStore - 通知状态                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/SSE
┌─────────────────────────────────────────────────────────────┐
│                  后端 API (FastAPI)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API 端点                                             │   │
│  │  ├─ POST /api/query - 查询接口                       │   │
│  │  ├─ GET /api/stats - 统计接口                        │   │
│  │  └─ GET /api/health - 健康检查                       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  RAG 系统核心 (AdvancedGraphRAGSystem)               │   │
│  │  ├─ 数据准备模块 (GraphDataPreparationModule)        │   │
│  │  ├─ 索引构建模块 (MilvusIndexConstructionModule)     │   │
│  │  ├─ 混合检索模块 (HybridRetrievalModule)             │   │
│  │  ├─ 图 RAG 检索模块 (GraphRAGRetrieval)              │   │
│  │  ├─ 智能路由模块 (IntelligentQueryRouter)            │   │
│  │  └─ 生成模块 (GenerationIntegrationModule)           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    数据存储层                                 │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │   Neo4j          │  │   Milvus         │                 │
│  │  (图数据库)      │  │  (向量数据库)    │                 │
│  │  - 菜谱知识图    │  │  - 文本向量      │                 │
│  │  - 食材关系      │  │  - 向量索引      │                 │
│  │  - 烹饪方法      │  │                  │                 │
│  └──────────────────┘  └──────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 数据流

### 查询流程

```
用户输入问题
    ↓
前端发送查询请求 (HTTP POST)
    ↓
后端接收请求
    ↓
智能查询路由器分析查询
    ├─ 计算查询复杂度
    ├─ 检测关系密集度
    └─ 选择最优检索策略
    ↓
执行检索
    ├─ 传统检索 (向量 + 关键词)
    └─ 图 RAG 检索 (知识图谱)
    ↓
融合检索结果
    ↓
LLM 生成回答
    ├─ 流式生成 (SSE)
    └─ 非流式生成 (一次性返回)
    ↓
前端接收和显示结果
    ├─ 实时显示流式内容
    ├─ 显示相关文档
    └─ 更新统计信息
```

## 🛠️ 开发指南

### 添加新的检索策略

1. 在 `backend/rag_modules/` 中创建新模块
2. 实现检索接口
3. 在 `intelligent_query_router.py` 中注册新策略
4. 更新路由逻辑

### 自定义 LLM

1. 修改 `config.yaml` 中的 `llm_model` 配置
2. 在 `generation_integration.py` 中更新 API 调用逻辑
3. 测试生成效果

### 扩展前端功能

1. 在 `frontend/components/` 中创建新组件
2. 在 `frontend/store/` 中添加相应的状态管理
3. 在 `frontend/lib/api.ts` 中添加 API 调用
4. 在页面中集成新组件

## 📝 日志和调试

### 查看日志

```bash
# 后端日志
tail -f backend.log

# 前端日志
# 在浏览器开发者工具中查看 Console
```

### 调试模式

在 `config.yaml` 中设置：
```yaml
development:
  debug: true
```

## 🐛 常见问题

### Q: 未找到 LLM_API_KEY 环境变量
A: 
1. 确保已复制 `.env.example` 为 `.env`
2. 检查 `.env` 文件中是否有 `LLM_API_KEY=your_api_key_here`
3. 将 `your_api_key_here` 替换为真实的 API 密钥
4. 重新启动应用

详见 [SETUP.md](SETUP.md) 中的"快速设置指南"

### Q: 连接 Neo4j 失败
A: 检查 Neo4j 服务是否运行，确认连接信息在 `config.yaml` 中正确

### Q: Milvus 连接错误
A: 确保 Milvus 服务已启动，检查 `docker-compose.yml` 配置

### Q: 前端无法连接后端
A: 检查 `config.yaml` 中的 `frontend.api.base_url` 是否正确

### Q: 流式输出不工作
A: 确保浏览器支持 Server-Sent Events，检查网络连接

### Q: 如何更换 LLM 提供商？
A: 
1. 编辑 `.env` 文件
2. 修改 `LLM_PROVIDER`、`LLM_API_KEY` 和 `LLM_BASE_URL`
3. 重新启动应用

### Q: 如何修改生成参数？
A: 在 `.env` 文件中修改 `GENERATION_TEMPERATURE` 和 `GENERATION_MAX_TOKENS`

## 📄 许可证

MIT

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 GitHub Issue

---

## 致谢

### 📚 教程项目

- **[Datawhale/all-in-rag](https://github.com/datawhalechina/all-in-rag)** - 大模型应用开发实战：RAG技术全栈指南

- **[Anduin2017/HowToCook](https://github.com/Anduin2017/HowToCook)** - 程序员在家做饭方法指南

**最后更新**: 2025 年 11 月
