"use client";

import React from "react";
import { DocumentListProps } from "@/lib/types";
import DocumentCard from "./DocumentCard";

/**
 * DocumentList - Container component for displaying a list of retrieved documents
 * Shows all documents returned from the RAG system query
 */
const DocumentList: React.FC<DocumentListProps> = ({ documents, strategy }) => {
  if (!documents || documents.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
          相关文档 ({documents.length})
        </h3>
        {strategy && (
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
            检索策略: {strategy}
          </span>
        )}
      </div>
      <div className="space-y-2">
        {documents.map((document, index) => (
          <DocumentCard key={`${document.recipe_name}-${index}`} document={document} index={index} />
        ))}
      </div>
    </div>
  );
};

export default DocumentList;
