"""
图数据库数据准备模块
"""

import logging
import json
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

from neo4j import GraphDatabase
from langchain_core.documents import Document

logger = logging.getLogger(__name__)

@dataclass
class GraphNode:
    """图节点数据结构"""
    node_id: str
    labels: List[str]
    name: str
    properties: Dict[str, Any]

@dataclass
class GraphRelation:
    """图关系数据结构"""
    start_node_id: str
    end_node_id: str
    relation_type: str
    properties: Dict[str, Any]

class GraphDataPreparationModule:
    """图数据库数据准备模块 - 从Neo4j读取数据并转换为文档"""
    
    def __init__(self, uri: str, user: str, password: str, database: str = "neo4j"):
        """
        初始化图数据库连接
        
        Args:
            uri: Neo4j连接URI
            user: 用户名
            password: 密码
            database: 数据库名称
        """
        self.uri = uri
        self.user = user
        self.password = password
        self.database = database
        self.driver = None
        self.documents: List[Document] = []
        self.chunks: List[Document] = []
        self.recipes: List[GraphNode] = [] # 菜谱节点
        self.ingredients: List[GraphNode] = [] # 食材节点
        self.cooking_steps: List[GraphNode] = [] # 步骤节点
        
        self._connect()
    
    def _connect(self):
        """建立Neo4j连接"""
        try:
            self.driver = GraphDatabase.driver(
                self.uri, 
                auth=(self.user, self.password),
                database=self.database
            )
            logger.info(f"已连接到Neo4j数据库: {self.uri}")
            
            # 测试连接
            with self.driver.session() as session:
                result = session.run("RETURN 1 as test")
                test_result = result.single()
                if test_result:
                    logger.info("Neo4j连接测试成功")
                    
        except Exception as e:
            logger.error(f"连接Neo4j失败: {e}")
            raise
    
    def close(self):
        """关闭数据库连接"""
        if hasattr(self, 'driver') and self.driver:
            self.driver.close()
            logger.info("Neo4j连接已关闭")
    
    def load_graph_data(self) -> Dict[str, Any]:
        """
        从Neo4j加载图数据
        
        Returns:
            包含节点和关系的数据字典
        """
        logger.info("正在从Neo4j加载图数据...")
        
        with self.driver.session() as session:
            # 加载所有菜谱节点，从Category关系中读取分类信息
            recipes_query = """
            MATCH (r:Recipe)
            WHERE r.nodeId >= '200000000'
            OPTIONAL MATCH (r)-[:BELONGS_TO_CATEGORY]->(c:Category)
            WITH r, collect(c.name) as categories
            RETURN r.nodeId as nodeId, labels(r) as labels, r.name as name, 
                   properties(r) as originalProperties,
                   CASE WHEN size(categories) > 0 
                        THEN categories[0] 
                        ELSE COALESCE(r.category, '未知') END as mainCategory,
                   CASE WHEN size(categories) > 0 
                        THEN categories 
                        ELSE [COALESCE(r.category, '未知')] END as allCategories
            ORDER BY r.nodeId
            """
            # 通过 recipes_query 获取所有菜谱节点
            result = session.run(recipes_query)
            self.recipes = []
            for record in result:
                # 合并原始属性和新的分类信息
                properties = dict(record["originalProperties"]) # 转换为字典以方便修改
                properties["category"] = record["mainCategory"] # 主分类
                properties["all_categories"] = record["allCategories"] # 所有分类
                
                # 创建菜谱节点实例
                node = GraphNode(
                    node_id=record["nodeId"], # 节点ID
                    labels=record["labels"], # 节点标签
                    name=record["name"], # 节点名称
                    properties=properties # 节点属性
                )
                self.recipes.append(node)
            
            logger.info(f"加载了 {len(self.recipes)} 个菜谱节点")
            
            # 加载所有食材节点
            ingredients_query = """
            MATCH (i:Ingredient)
            WHERE i.nodeId >= '200000000'
            RETURN i.nodeId as nodeId, labels(i) as labels, i.name as name,
                   properties(i) as properties
            ORDER BY i.nodeId
            """
            # 通过 ingredients_query 获取所有食材节点
            result = session.run(ingredients_query)
            self.ingredients = []
            for record in result:
                # 创建食材节点实例
                node = GraphNode(
                    node_id=record["nodeId"], # 节点ID
                    labels=record["labels"], # 节点标签
                    name=record["name"], # 节点名称
                    properties=record["properties"] # 节点属性
                )
                self.ingredients.append(node)
            
            logger.info(f"加载了 {len(self.ingredients)} 个食材节点")
            
            # 加载所有烹饪步骤节点
            steps_query = """
            MATCH (s:CookingStep)
            WHERE s.nodeId >= '200000000'
            RETURN s.nodeId as nodeId, labels(s) as labels, s.name as name,
                   properties(s) as properties
            ORDER BY s.nodeId
            """
            # 通过 steps_query 获取所有烹饪步骤节点
            result = session.run(steps_query)
            self.cooking_steps = []
            for record in result:
                node = GraphNode(
                    node_id=record["nodeId"], # 节点ID
                    labels=record["labels"], # 节点标签
                    name=record["name"], # 节点名称
                    properties=record["properties"] # 节点属性
                )
                self.cooking_steps.append(node)
            
            logger.info(f"加载了 {len(self.cooking_steps)} 个烹饪步骤节点")
        
        # 返回加载的节点数量
        return {
            'recipes': len(self.recipes),
            'ingredients': len(self.ingredients),
            'cooking_steps': len(self.cooking_steps)
        }
    
    def build_recipe_documents(self) -> List[Document]:
        """
        构建菜谱文档，集成相关的食材和步骤信息
        
        Returns:
            结构化的菜谱文档列表
        """
        logger.info("正在构建菜谱文档...")
        
        documents = []
        
        with self.driver.session() as session:
            for recipe in self.recipes:
                try:
                    recipe_id = recipe.node_id # 菜谱节点ID
                    recipe_name = recipe.name # 菜谱名称
                    
                    # 获取菜谱的相关食材
                    ingredients_query = """
                    MATCH (r:Recipe {nodeId: $recipe_id})-[req:REQUIRES]->(i:Ingredient)
                    RETURN i.name as name, i.category as category, 
                           req.amount as amount, req.unit as unit,
                           i.description as description
                    ORDER BY i.name
                    """
                    # 通过 ingredients_query 获取菜谱的所有相关食材节点
                    ingredients_result = session.run(ingredients_query, {"recipe_id": recipe_id})
                    ingredients_info = []
                    # 遍历所有食材节点
                    for ing_record in ingredients_result:
                        amount = ing_record.get("amount", "") # 食材数量
                        unit = ing_record.get("unit", "") # 食材单位
                        ingredient_text = f"{ing_record['name']}" # 食材名称
                        # 如果有数量和单位，添加到食材名称中
                        if amount and unit:
                            ingredient_text += f"({amount}{unit})"
                        # 如果有描述，添加到食材名称中
                        if ing_record.get("description"):
                            ingredient_text += f" - {ing_record['description']}"
                        # 添加到食材列表中
                        ingredients_info.append(ingredient_text)
                    
                    # 获取菜谱的烹饪步骤
                    steps_query = """
                    MATCH (r:Recipe {nodeId: $recipe_id})-[c:CONTAINS_STEP]->(s:CookingStep)
                    RETURN s.name as name, s.description as description,
                           s.stepNumber as stepNumber, s.methods as methods,
                           s.tools as tools, s.timeEstimate as timeEstimate,
                           c.stepOrder as stepOrder
                    ORDER BY COALESCE(c.stepOrder, s.stepNumber, 999)
                    """
                    
                    steps_result = session.run(steps_query, {"recipe_id": recipe_id})
                    steps_info = []
                    # 遍历所有步骤节点
                    for step_record in steps_result:
                        step_text = f"步骤: {step_record['name']}" # 步骤名称
                        # 如果有描述，添加到步骤名称中
                        if step_record.get("description"):
                            step_text += f"\n描述: {step_record['description']}" 
                        # 如果有方法，添加到步骤名称中
                        if step_record.get("methods"):
                            step_text += f"\n方法: {step_record['methods']}"
                        # 如果有工具，添加到步骤名称中
                        if step_record.get("tools"):
                            step_text += f"\n工具: {step_record['tools']}"
                        # 如果有时间估计，添加到步骤名称中
                        if step_record.get("timeEstimate"):
                            step_text += f"\n时间: {step_record['timeEstimate']}"
                        # 添加到步骤列表中
                        steps_info.append(step_text)
                    
                    # 构建完整的菜谱文档内容
                    content_parts = [f"# {recipe_name}"]
                    
                    # 添加菜谱基本信息
                    if recipe.properties.get("description"):
                        content_parts.append(f"\n## 菜品描述\n{recipe.properties['description']}")
                    
                    if recipe.properties.get("cuisineType"):
                        content_parts.append(f"\n菜系: {recipe.properties['cuisineType']}")
                    
                    if recipe.properties.get("difficulty"):
                        content_parts.append(f"难度: {recipe.properties['difficulty']}星")
                    
                    if recipe.properties.get("prepTime") or recipe.properties.get("cookTime"):
                        time_info = []
                        if recipe.properties.get("prepTime"):
                            time_info.append(f"准备时间: {recipe.properties['prepTime']}")
                        if recipe.properties.get("cookTime"):
                            time_info.append(f"烹饪时间: {recipe.properties['cookTime']}")
                        content_parts.append(f"\n时间信息: {', '.join(time_info)}")
                    
                    if recipe.properties.get("servings"):
                        content_parts.append(f"份量: {recipe.properties['servings']}")
                    
                    # 添加食材信息
                    if ingredients_info:
                        content_parts.append("\n## 所需食材")
                        for i, ingredient in enumerate(ingredients_info, 1):
                            content_parts.append(f"{i}. {ingredient}")
                    
                    # 添加步骤信息
                    if steps_info:
                        content_parts.append("\n## 制作步骤")
                        for i, step in enumerate(steps_info, 1):
                            content_parts.append(f"\n### 第{i}步\n{step}")
                    
                    # 添加标签信息
                    if recipe.properties.get("tags"):
                        content_parts.append(f"\n## 标签\n{recipe.properties['tags']}")
                    
                    # 组合成最终内容
                    full_content = "\n".join(content_parts)
                    
                    # 创建文档对象
                    doc = Document(
                        page_content=full_content,
                        metadata={
                            "node_id": recipe_id, # 菜谱节点ID
                            "recipe_name": recipe_name, # 菜谱名称
                            "node_type": "Recipe", # 节点类型为菜谱
                            "category": recipe.properties.get("category", "未知"), # 菜谱分类
                            "cuisine_type": recipe.properties.get("cuisineType", "未知"), # 菜系
                            "difficulty": recipe.properties.get("difficulty", 0), # 难度等级
                            "prep_time": recipe.properties.get("prepTime", ""), # 准备时间
                            "cook_time": recipe.properties.get("cookTime", ""), # 烹饪时间
                            "servings": recipe.properties.get("servings", ""), # 份量
                            "ingredients_count": len(ingredients_info), # 食材数量
                            "steps_count": len(steps_info), # 步骤数量
                            "doc_type": "recipe", # 文档类型为菜谱
                            "content_length": len(full_content) # 文档内容长度
                        }
                    )
                    
                    documents.append(doc)
                    
                except Exception as e:
                    logger.warning(f"构建菜谱文档失败 {recipe_name} (ID: {recipe_id}): {e}")
                    continue
        
        self.documents = documents
        logger.info(f"成功构建 {len(documents)} 个菜谱文档")
        return documents
    
    def chunk_documents(self, chunk_size: int = 500, chunk_overlap: int = 50) -> List[Document]:
        """
        对文档进行分块处理
        
        Args:
            chunk_size: 分块大小
            chunk_overlap: 重叠大小
            
        Returns:
            分块后的文档列表
        """
        logger.info(f"正在进行文档分块，块大小: {chunk_size}, 重叠: {chunk_overlap}")
        
        if not self.documents:
            raise ValueError("请先构建文档")
        
        chunks = []
        chunk_id = 0
        
        for doc in self.documents:
            content = doc.page_content
            
            # 简单的按长度分块
            if len(content) <= chunk_size:
                # 内容较短，不需要分块
                chunk = Document(
                    page_content=content,
                    metadata={
                        **doc.metadata,
                        "chunk_id": f"{doc.metadata['node_id']}_chunk_{chunk_id}", # 分块ID：节点ID_分块索引
                        "parent_id": doc.metadata["node_id"], # 父节点ID：菜谱节点ID
                        "chunk_index": 0, # 分块索引：0
                        "total_chunks": 1, # 总分块数：1
                        "chunk_size": len(content), # 分块大小：文档内容长度
                        "doc_type": "chunk" # 文档类型为分块
                    }
                )
                chunks.append(chunk)
                chunk_id += 1
            else:
                # 按章节分块（基于标题）
                sections = content.split('\n## ')
                if len(sections) <= 1:
                    # 没有二级标题，按长度强制分块
                    total_chunks = (len(content) - 1) // (chunk_size - chunk_overlap) + 1
                    
                    for i in range(total_chunks):
                        start = i * (chunk_size - chunk_overlap) # 分块起始位置：分块索引 * (分块大小 - 重叠大小)
                        end = min(start + chunk_size, len(content)) # 分块结束位置：分块起始位置 + 分块大小，取较小值
                        
                        chunk_content = content[start:end] # 分块内容：文档内容[分块起始位置:分块结束位置]
                        
                        chunk = Document(
                            page_content=chunk_content, # 分块内容：文档内容[分块起始位置:分块结束位置]
                            metadata={
                                **doc.metadata, # 继承父节点的元数据
                                "chunk_id": f"{doc.metadata['node_id']}_chunk_{chunk_id}", # 分块ID：节点ID_分块索引
                                "parent_id": doc.metadata["node_id"], # 父节点ID：菜谱节点ID
                                "chunk_index": i, # 分块索引：分块索引
                                "total_chunks": total_chunks, # 总分块数：(文档内容长度 - 1) // (分块大小 - 重叠大小) + 1
                                "chunk_size": len(chunk_content), # 分块大小：分块内容长度
                                "doc_type": "chunk" # 文档类型为分块
                            }
                        )
                        chunks.append(chunk)
                        chunk_id += 1
                else:
                    # 按章节分块
                    total_chunks = len(sections) # 总分块数：章节数
                    for i, section in enumerate(sections): # 遍历每个章节
                        if i == 0:
                            # 第一个部分包含标题
                            chunk_content = section
                        else:
                            # 其他部分添加章节标题
                            chunk_content = f"## {section}"
                        
                        chunk = Document(
                            page_content=chunk_content, # 分块内容：章节内容（包含标题）
                            metadata={
                                **doc.metadata, # 继承父节点的元数据
                                "chunk_id": f"{doc.metadata['node_id']}_chunk_{chunk_id}", # 分块ID：节点ID_分块索引
                                "parent_id": doc.metadata["node_id"], # 父节点ID：菜谱节点ID
                                "chunk_index": i, # 分块索引：分块索引
                                "total_chunks": total_chunks, # 总分块数：章节数
                                "chunk_size": len(chunk_content), # 分块大小：分块内容长度
                                "doc_type": "chunk", # 文档类型为分块
                                "section_title": section.split('\n')[0] if i > 0 else "主标题" # 章节标题：章节内容第一行（如果存在），否则为"主标题"
                            }
                        )
                        chunks.append(chunk)
                        chunk_id += 1
        
        self.chunks = chunks
        logger.info(f"文档分块完成，共生成 {len(chunks)} 个块")
        return chunks
    

    
    def get_statistics(self) -> Dict[str, Any]:
        """
        获取数据统计信息
        
        Returns:
            统计信息字典
        """
        stats = {
            'total_recipes': len(self.recipes), # 总菜谱数：菜谱节点数
            'total_ingredients': len(self.ingredients), # 总食材数：食材节点数
            'total_cooking_steps': len(self.cooking_steps), # 总步骤数：步骤节点数
            'total_documents': len(self.documents), # 总文档数：文档节点数（包括菜谱、食材、步骤）
            'total_chunks': len(self.chunks) # 总分块数：分块节点数
        }
        
        if self.documents:
            # 分类统计
            categories = {}
            cuisines = {}
            difficulties = {}
            
            for doc in self.documents:
                category = doc.metadata.get('category', '未知')
                categories[category] = categories.get(category, 0) + 1
                
                cuisine = doc.metadata.get('cuisine_type', '未知')
                cuisines[cuisine] = cuisines.get(cuisine, 0) + 1
                
                difficulty = doc.metadata.get('difficulty', 0)
                difficulties[str(difficulty)] = difficulties.get(str(difficulty), 0) + 1
            
            stats.update({
                'categories': categories, # 分类统计：{分类: 节点数}
                'cuisines': cuisines, # 菜系统计：{菜系: 节点数}
                'difficulties': difficulties, # 难度统计：{难度: 节点数}
                'avg_content_length': sum(doc.metadata.get('content_length', 0) for doc in self.documents) / len(self.documents), # 平均文档长度：所有文档内容长度的平均值
                'avg_chunk_size': sum(chunk.metadata.get('chunk_size', 0) for chunk in self.chunks) / len(self.chunks) if self.chunks else 0 # 平均分块大小：所有分块内容长度的平均值
            })
        
        return stats
    

    
    def __del__(self):
        """析构函数，确保关闭连接"""
        self.close() 