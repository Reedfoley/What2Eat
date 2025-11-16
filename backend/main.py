"""
FastAPI后端服务 - 菜谱RAG系统API
"""

import os
import sys
import logging
import json
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from rag import AdvancedGraphRAGSystem
from config import DEFAULT_CONFIG

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

rag_system: Optional[AdvancedGraphRAGSystem] = None


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000)
    stream: bool = Field(default=False)


class Document(BaseModel):
    recipe_name: str
    content: str
    search_type: str
    relevance_score: float
    metadata: Dict[str, Any] = Field(default_factory=dict)


class QueryResponse(BaseModel):
    answer: str
    strategy: str
    complexity: float
    relationship_intensity: float
    documents: List[Document] = Field(default_factory=list)
    processing_time: float


class KnowledgeBaseStats(BaseModel):
    total_recipes: int = 0
    total_ingredients: int = 0
    total_cooking_steps: int = 0
    total_documents: int = 0
    total_chunks: int = 0
    categories: List[str] = Field(default_factory=list)


class RoutingStats(BaseModel):
    total_queries: int = 0
    traditional_count: int = 0
    traditional_ratio: float = 0.0
    graph_rag_count: int = 0
    graph_rag_ratio: float = 0.0
    combined_count: int = 0
    combined_ratio: float = 0.0


class MilvusStats(BaseModel):
    row_count: int = 0


class StatsResponse(BaseModel):
    knowledge_base: KnowledgeBaseStats
    routing: RoutingStats
    milvus: MilvusStats


class HealthResponse(BaseModel):
    status: str
    system_ready: bool
    message: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    global rag_system
    try:
        logger.info("初始化RAG系统...")
        rag_system = AdvancedGraphRAGSystem(DEFAULT_CONFIG)
        rag_system.initialize_system()
        rag_system.build_knowledge_base()
        logger.info("✅ RAG系统初始化完成")
    except Exception as e:
        logger.error(f"❌ RAG系统初始化失败: {e}")
        rag_system = None
    
    yield
    
    if rag_system:
        logger.info("关闭RAG系统...")
        rag_system._cleanup()


app = FastAPI(title="Recipe RAG API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:7860",
        "http://127.0.0.1:7860",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Recipe RAG API", "version": "1.0.0", "docs": "/docs"}


@app.options("/api/query")
async def options_query():
    return {"status": "ok"}


@app.post("/api/query", response_model=QueryResponse)
async def query_endpoint(request: QueryRequest):
    if not rag_system or not rag_system.system_ready:
        raise HTTPException(status_code=503, detail="RAG系统未就绪")
    
    try:
        import time
        start_time = time.time()
        
        if request.stream:
            return await stream_query(request.question)
        
        result, analysis = rag_system.ask_question_with_routing(
            question=request.question, stream=False, explain_routing=False
        )
        
        relevant_docs, _ = rag_system.query_router.route_query(
            request.question, rag_system.config.top_k
        )
        
        documents = [
            Document(
                recipe_name=doc.metadata.get('recipe_name', '未知'),
                content=doc.page_content,
                search_type=doc.metadata.get('search_type', doc.metadata.get('route_strategy', 'unknown')),
                relevance_score=doc.metadata.get('final_score', doc.metadata.get('relevance_score', 0.0)),
                metadata=doc.metadata
            )
            for doc in relevant_docs
        ]
        
        return QueryResponse(
            answer=result,
            strategy=analysis.recommended_strategy.value,
            complexity=analysis.query_complexity,
            relationship_intensity=analysis.relationship_intensity,
            documents=documents,
            processing_time=time.time() - start_time
        )
    except Exception as e:
        logger.error(f"查询失败: {e}")
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")


async def stream_query(question: str):
    import asyncio
    
    async def generate():
        try:
            logger.info(f"开始流式查询: {question}")
            
            relevant_docs, analysis = rag_system.query_router.route_query(
                question, rag_system.config.top_k
            )
            
            logger.info(f"查询路由完成，找到 {len(relevant_docs)} 个相关文档")
            
            metadata = {
                "type": "metadata",
                "strategy": analysis.recommended_strategy.value,
                "complexity": analysis.query_complexity,
                "relationship_intensity": analysis.relationship_intensity,
                "document_count": len(relevant_docs)
            }
            logger.info(f"发送元数据: {metadata}")
            yield f"data: {json.dumps(metadata, ensure_ascii=False)}\n\n"
            # 让出控制权，让 FastAPI 立即发送数据
            await asyncio.sleep(0)
            
            logger.info("开始流式生成回答...")
            chunk_count = 0
            for chunk_text in rag_system.generation_module.generate_adaptive_answer_stream(
                question, relevant_docs
            ):
                chunk_count += 1
                logger.info(f"生成块 {chunk_count}: {chunk_text[:50]}...")
                # 立即发送每个块，不缓冲
                yield f"data: {json.dumps({'type': 'content', 'content': chunk_text}, ensure_ascii=False)}\n\n"
                # 让出控制权，让 FastAPI 立即发送数据
                await asyncio.sleep(0)
            
            logger.info(f"回答生成完成，共 {chunk_count} 个块")
            
            documents_data = [
                {
                    "recipe_name": doc.metadata.get('recipe_name', '未知'),
                    "content": doc.page_content,
                    "search_type": doc.metadata.get('search_type', doc.metadata.get('route_strategy', 'unknown')),
                    "relevance_score": doc.metadata.get('final_score', doc.metadata.get('relevance_score', 0.0)),
                    "metadata": doc.metadata
                }
                for doc in relevant_docs
            ]
            
            logger.info(f"发送 {len(documents_data)} 个文档")
            yield f"data: {json.dumps({'type': 'documents', 'documents': documents_data}, ensure_ascii=False)}\n\n"
            yield f"data: {json.dumps({'type': 'done'}, ensure_ascii=False)}\n\n"
            logger.info("流式查询完成")
            
        except Exception as e:
            logger.error(f"流式查询失败: {e}", exc_info=True)
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)}, ensure_ascii=False)}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )


@app.get("/api/stats", response_model=StatsResponse)
async def get_stats():
    if not rag_system or not rag_system.system_ready:
        raise HTTPException(status_code=503, detail="RAG系统未就绪")
    
    try:
        kb_stats = rag_system.data_module.get_statistics()
        route_stats = rag_system.query_router.get_route_statistics()
        milvus_stats = rag_system.index_module.get_collection_stats()
        
        return StatsResponse(
            knowledge_base=KnowledgeBaseStats(
                total_recipes=kb_stats.get('total_recipes', 0),
                total_ingredients=kb_stats.get('total_ingredients', 0),
                total_cooking_steps=kb_stats.get('total_cooking_steps', 0),
                total_documents=kb_stats.get('total_documents', 0),
                total_chunks=kb_stats.get('total_chunks', 0),
                categories=list(kb_stats.get('categories', {}).keys())[:20]
            ),
            routing=RoutingStats(
                total_queries=route_stats.get('total_queries', 0),
                traditional_count=route_stats.get('traditional_count', 0),
                traditional_ratio=route_stats.get('traditional_ratio', 0.0),
                graph_rag_count=route_stats.get('graph_rag_count', 0),
                graph_rag_ratio=route_stats.get('graph_rag_ratio', 0.0),
                combined_count=route_stats.get('combined_count', 0),
                combined_ratio=route_stats.get('combined_ratio', 0.0)
            ),
            milvus=MilvusStats(row_count=milvus_stats.get('row_count', 0))
        )
    except Exception as e:
        logger.error(f"获取统计信息失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取统计信息失败: {str(e)}")


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    if not rag_system:
        return HealthResponse(status="unhealthy", system_ready=False, message="RAG系统未初始化")
    
    if not rag_system.system_ready:
        return HealthResponse(status="unhealthy", system_ready=False, message="RAG系统未就绪")
    
    return HealthResponse(status="healthy", system_ready=True, message="系统运行正常")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False, log_level="info")
