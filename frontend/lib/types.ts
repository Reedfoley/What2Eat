// ============================================
// 聊天消息类型定义
// ============================================
// 表示聊天中的一条消息（用户或助手）
export interface Message {
  // 消息的唯一标识符
  id: string;
  // 消息角色：用户或助手
  role: "user" | "assistant";
  // 消息内容文本
  content: string;
  // 消息发送时间
  timestamp: Date;
  // 使用的检索策略（可选）
  // hybrid_traditional: 混合传统检索
  // graph_rag: 图 RAG 检索
  // combined: 组合策略
  strategy?: "hybrid_traditional" | "graph_rag" | "combined";
  // 相关的菜谱文档列表（可选）
  documents?: Document[];
  // 消息元数据（可选）
  metadata?: MessageMetadata;
}

// ============================================
// 消息元数据类型定义
// ============================================
// 存储消息的额外信息
export interface MessageMetadata {
  // 查询复杂度（0-1 之间的数值）
  complexity?: number;
  // 关系强度（0-1 之间的数值）
  relationship_intensity?: number;
  // 处理时间（毫秒）
  processing_time?: number;
}

// ============================================
// 菜谱文档类型定义
// ============================================
// 表示一份菜谱文档
export interface Document {
  // 菜谱名称
  recipe_name: string;
  // 菜谱内容
  content: string;
  // 搜索类型（传统检索或图 RAG）
  search_type: string;
  // 相关性分数（0-1 之间，越高越相关）
  relevance_score: number;
  // 其他元数据（灵活的键值对）
  metadata: Record<string, any>;
}

// ============================================
// 查询请求类型定义
// ============================================
// 发送给后端的查询请求
export interface QueryRequest {
  // 用户的问题
  question: string;
  // 是否使用流式响应（逐步返回结果）
  stream?: boolean;
}

// ============================================
// 查询响应类型定义
// ============================================
// 后端返回的查询结果
export interface QueryResponse {
  // 助手的回答
  answer: string;
  // 使用的检索策略
  strategy: "hybrid_traditional" | "graph_rag" | "combined";
  // 查询复杂度
  complexity: number;
  // 关系强度
  relationship_intensity: number;
  // 相关的菜谱文档列表
  documents: Document[];
  // 处理时间（毫秒）
  processing_time: number;
}

// ============================================
// 统计信息响应类型定义
// ============================================
// 系统统计信息
export interface StatsResponse {
  // 知识库统计
  knowledge_base: KnowledgeBaseStats;
  // 路由统计（检索策略使用情况）
  routing: RoutingStats;
  // Milvus 向量数据库统计
  milvus: MilvusStats;
}

// ============================================
// 知识库统计类型定义
// ============================================
// 知识库中的数据统计
export interface KnowledgeBaseStats {
  // 总菜谱数量
  total_recipes: number;
  // 总食材数量
  total_ingredients: number;
  // 总烹饪步骤数量
  total_cooking_steps: number;
  // 总文档数量
  total_documents: number;
  // 总分块数量（文档被分成的块数）
  total_chunks: number;
  // 菜谱分类列表
  categories: string[];
}

// ============================================
// 路由统计类型定义
// ============================================
// 检索策略的使用统计
export interface RoutingStats {
  // 总查询数
  total_queries: number;
  // 传统检索使用次数
  traditional_count: number;
  // 传统检索使用比例
  traditional_ratio: number;
  // 图 RAG 检索使用次数
  graph_rag_count: number;
  // 图 RAG 检索使用比例
  graph_rag_ratio: number;
  // 组合策略使用次数
  combined_count: number;
  // 组合策略使用比例
  combined_ratio: number;
}

// ============================================
// Milvus 向量数据库统计类型定义
// ============================================
// Milvus 数据库的统计信息
export interface MilvusStats {
  // 向量数据库中的行数
  row_count: number;
}

// ============================================
// 健康检查响应类型定义
// ============================================
// 系统健康状态
export interface HealthResponse {
  // 系统状态：健康或不健康
  status: "healthy" | "unhealthy";
  // 系统是否准备就绪
  system_ready: boolean;
  // 状态消息
  message: string;
}
