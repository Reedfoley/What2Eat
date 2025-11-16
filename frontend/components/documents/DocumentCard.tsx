"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DocumentCardProps } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

/**
 * DocumentCard - Expandable card component for displaying document details
 * Shows recipe name, relevance score, search type, and full content when expanded
 */
const DocumentCard: React.FC<DocumentCardProps> = ({ document, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine badge variant based on search type
  const getBadgeVariant = (searchType: string): "traditional" | "graphRag" | "combined" | "default" => {
    const type = searchType.toLowerCase();
    if (type.includes("traditional") || type.includes("vector")) {
      return "traditional";
    } else if (type.includes("graph")) {
      return "graphRag";
    } else if (type.includes("combined") || type.includes("hybrid")) {
      return "combined";
    }
    return "default";
  };

  // Format relevance score as percentage
  const formatScore = (score: number): string => {
    return `${(score * 100).toFixed(1)}%`;
  };

  // Animation variants for card expansion
  const cardVariants = {
    collapsed: {
      height: "auto",
    },
    expanded: {
      height: "auto",
    },
  };

  const contentVariants = {
    collapsed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    expanded: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05,
        ease: 'easeOut'
      }}
      whileHover={{
        y: -2,
        transition: { duration: 0.2, ease: 'easeOut' }
      }}
      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
    >
      <motion.div
        variants={cardVariants}
        initial="collapsed"
        animate={isExpanded ? "expanded" : "collapsed"}
      >
        {/* Card Header - Always Visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-start justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-left"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {document.recipe_name}
              </h4>
              <Badge variant={getBadgeVariant(document.search_type)}>
                {document.search_type}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                相关度: {formatScore(document.relevance_score)}
              </span>
              {document.metadata?.category && (
                <span className="flex items-center gap-1">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  {document.metadata.category}
                </span>
              )}
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="ml-2 flex-shrink-0"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.div>
        </button>

        {/* Card Content - Expandable */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {document.content}
                  </p>
                </div>
                
                {/* Additional Metadata */}
                {document.metadata && Object.keys(document.metadata).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      元数据
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(document.metadata).map(([key, value]) => (
                        <div key={key} className="flex gap-1">
                          <span className="font-medium text-gray-600 dark:text-gray-400">
                            {key}:
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {typeof value === "object" ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default DocumentCard;
