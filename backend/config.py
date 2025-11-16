"""
RAG系统配置文件 - 从 config.yaml 和 .env 读取
"""

import os
import yaml
from dataclasses import dataclass
from typing import Dict, Any
from dotenv import load_dotenv

# 加载 .env 文件
load_dotenv()

def load_config() -> Dict[str, Any]:
    """从 config.yaml 加载配置"""
    config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config.yaml')
    
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"配置文件不存在: {config_path}")
    
    with open(config_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

@dataclass
class GraphRAGConfig:
    """RAG系统配置类"""

    # Neo4j数据库配置
    neo4j_uri: str
    neo4j_user: str
    neo4j_password: str
    neo4j_database: str

    # Milvus配置
    milvus_host: str
    milvus_port: int
    milvus_collection_name: str
    milvus_dimension: int

    # 模型配置
    embedding_model: str
    llm_model: str

    # LLM API 配置（从 .env 读取）
    llm_provider: str
    llm_api_key: str
    llm_base_url: str

    # 检索配置
    top_k: int

    # 生成配置
    temperature: float
    max_tokens: int

    # 图数据处理配置
    chunk_size: int
    chunk_overlap: int
    max_graph_depth: int

    @classmethod
    def from_yaml(cls) -> 'GraphRAGConfig':
        """从 config.yaml 和 .env 创建配置对象"""
        config = load_config()
        backend_config = config.get('backend', {})
        
        # 从 .env 读取 LLM API 配置
        llm_api_key = os.getenv('LLM_API_KEY')
        if not llm_api_key:
            raise ValueError(
                "❌ 错误：未找到 LLM_API_KEY 环境变量\n"
                "请按以下步骤操作：\n"
                "1. 复制 .env.example 为 .env\n"
                "2. 在 .env 中填入你的 LLM API 密钥\n"
                "3. 重新启动应用"
            )
        
        return cls(
            neo4j_uri=backend_config.get('neo4j', {}).get('uri', 'bolt://localhost:7687'),
            neo4j_user=backend_config.get('neo4j', {}).get('user', 'neo4j'),
            neo4j_password=backend_config.get('neo4j', {}).get('password', 'all-in-rag'),
            neo4j_database=backend_config.get('neo4j', {}).get('database', 'neo4j'),
            milvus_host=backend_config.get('milvus', {}).get('host', 'localhost'),
            milvus_port=backend_config.get('milvus', {}).get('port', 19530),
            milvus_collection_name=backend_config.get('milvus', {}).get('collection_name', 'cooking_knowledge'),
            milvus_dimension=backend_config.get('milvus', {}).get('dimension', 512),
            embedding_model=backend_config.get('models', {}).get('embedding_model', ''),
            llm_model=os.getenv('LLM_MODEL', backend_config.get('models', {}).get('llm_model', 'kimi-k2-0711-preview')),
            llm_provider=os.getenv('LLM_PROVIDER', 'moonshot'),
            llm_api_key=llm_api_key,
            llm_base_url=os.getenv('LLM_BASE_URL', 'https://api.moonshot.cn/v1'),
            top_k=backend_config.get('retrieval', {}).get('top_k', 5),
            temperature=float(os.getenv('GENERATION_TEMPERATURE', backend_config.get('generation', {}).get('temperature', 0.1))),
            max_tokens=int(os.getenv('GENERATION_MAX_TOKENS', backend_config.get('generation', {}).get('max_tokens', 2048))),
            chunk_size=backend_config.get('retrieval', {}).get('chunk_size', 500),
            chunk_overlap=backend_config.get('retrieval', {}).get('chunk_overlap', 50),
            max_graph_depth=backend_config.get('retrieval', {}).get('max_graph_depth', 2),
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            'neo4j_uri': self.neo4j_uri,
            'neo4j_user': self.neo4j_user,
            'neo4j_password': self.neo4j_password,
            'neo4j_database': self.neo4j_database,
            'milvus_host': self.milvus_host,
            'milvus_port': self.milvus_port,
            'milvus_collection_name': self.milvus_collection_name,
            'milvus_dimension': self.milvus_dimension,
            'embedding_model': self.embedding_model,
            'llm_model': self.llm_model,
            'llm_provider': self.llm_provider,
            'llm_api_key': '***' if self.llm_api_key else None,  # 不显示真实密钥
            'llm_base_url': self.llm_base_url,
            'top_k': self.top_k,
            'temperature': self.temperature,
            'max_tokens': self.max_tokens,
            'chunk_size': self.chunk_size,
            'chunk_overlap': self.chunk_overlap,
            'max_graph_depth': self.max_graph_depth
        }

# 从 config.yaml 和 .env 加载配置
try:
    DEFAULT_CONFIG = GraphRAGConfig.from_yaml()
except ValueError as e:
    # LLM API 密钥缺失
    print(f"\n{e}\n")
    raise
except Exception as e:
    print(f"❌ 错误: 无法加载配置: {e}")
    raise
