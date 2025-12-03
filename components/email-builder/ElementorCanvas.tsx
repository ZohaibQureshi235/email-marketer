"use client";

import { useRef, useState, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import SortableBlock from "./SortableBlock";
import SortableLayout from "./SortableLayout";
import { EmailBlock, EmailBlockType } from "@/types/email-builder";

interface ElementorCanvasProps {
  blocks: EmailBlock[];
  selectedBlock: EmailBlock | null;
  onSelectBlock: (block: EmailBlock | null) => void;
  onUpdateBlock: (id: string, updates: Partial<EmailBlock>) => void;
  onRemoveBlock: (id: string) => void;
  onAddBlockToLayout: (
    layoutId: string,
    columnIndex: number,
    blockType: EmailBlockType
  ) => void;
  onRemoveBlockFromLayout: (
    layoutId: string,
    columnIndex: number,
    blockId: string
  ) => void;
  onUpdateBlockInLayout: (
    layoutId: string,
    columnIndex: number,
    blockId: string,
    updates: Partial<EmailBlock>
  ) => void;
  onSelectBlockInLayout: (block: EmailBlock) => void;
  onAddLayout: (layout: string, insertIndex?: number) => void;
  previewMode: "desktop" | "tablet" | "mobile";
}

export default function ElementorCanvas({
  blocks,
  selectedBlock,
  onSelectBlock,
  onUpdateBlock,
  onRemoveBlock,
  onAddBlockToLayout,
  onRemoveBlockFromLayout,
  onUpdateBlockInLayout,
  onSelectBlockInLayout,
  onAddLayout,
  previewMode,
}: ElementorCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);
  const [layoutSelectorPosition, setLayoutSelectorPosition] = useState({
    x: 0,
    y: 0,
  });
  const [insertIndex, setInsertIndex] = useState<number | null>(null);

  // Make the canvas a droppable area for sidebar elements
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-drop-area",
    data: {
      accepts: ["widget"],
    },
  });

  const handleAddClick = (e: React.MouseEvent, index?: number) => {
    e.stopPropagation();
    e.preventDefault();

    console.log("handleAddClick called with index:", index);
    console.log("Current blocks length:", blocks.length);

    const x = e.clientX;
    const y = e.clientY;

    setLayoutSelectorPosition({
      x: Math.min(x, window.innerWidth - 300),
      y: Math.min(y, window.innerHeight - 400),
    });

    // Store the insert position
    const targetIndex = index !== undefined ? index : blocks.length;
    console.log("Setting insertIndex to:", targetIndex);

    setInsertIndex(targetIndex);
    setShowLayoutSelector(true);
  };

  useEffect(() => {
    if (showLayoutSelector) {
      console.log("Layout selector opened with insertIndex:", insertIndex);
    }
  }, [showLayoutSelector, insertIndex]);

  const handleLayoutSelect = (layoutType: string) => {
    console.log(
      "Selected layout:",
      layoutType,
      "Inserting at index:",
      insertIndex
    );
    if (insertIndex !== null) {
      onAddLayout(layoutType, insertIndex);
    } else {
      onAddLayout(layoutType);
    }
    setShowLayoutSelector(false);
    setInsertIndex(null);
  };

  const getPreviewClass = () => {
    switch (previewMode) {
      case "mobile":
        return "max-w-[375px] mx-auto";
      case "tablet":
        return "max-w-[768px] mx-auto";
      default:
        return "max-w-full";
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showLayoutSelector) {
        setShowLayoutSelector(false);
        setInsertIndex(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showLayoutSelector]);

  // Debug: Log blocks when they change
  useEffect(() => {
    console.log("Canvas blocks updated:", blocks.length, blocks);
  }, [blocks]);

  return (
    <div className="h-full overflow-auto">
      <div
        className={`min-h-full bg-gradient-to-br from-gray-50 to-purple-50/20 py-8 ${getPreviewClass()}`}
      >
        {/* Main Canvas */}
        <div
          ref={(node) => {
            canvasRef.current = node;
            setNodeRef(node);
          }}
          className={`min-h-[800px] bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 transition-all duration-300 relative ${
            isOver
              ? "border-blue-400 border-dashed bg-blue-50/50"
              : "border-white"
          }`}
          onClick={() => {
            onSelectBlock(null);
          }}
        >
          {/* Glow effect when dragging */}
          {isOver && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-2xl pointer-events-none" />
          )}
          {blocks.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center h-96 text-center p-8">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0112 0c0 .459-.031.909-.086 1.333A5 5 0 0010 11z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  NEW
                </div>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Start Building Your Email
              </h3>
              <p className="text-gray-600 mb-8 max-w-md text-lg">
                Drag elements from the sidebar or click below to add your first
                section
              </p>
              <button
                onClick={(e) => handleAddClick(e, 0)}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="font-semibold text-lg">
                  Add Your First Section
                </span>
              </button>
              <p className="text-gray-400 mt-6 text-sm">
                💡 <span className="font-medium">Tip:</span> Drag elements from
                the sidebar
              </p>
            </div>
          ) : (
            // Blocks List with Add Buttons
            <div className="space-y-8 p-6 relative">
              {/* Top add button */}
              <div className="flex justify-center mb-4">
                <button
                  onClick={(e) => handleAddClick(e, 0)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 rounded-xl hover:from-gray-200 hover:to-gray-100 transition-all duration-300 flex items-center space-x-2 border-2 border-dashed border-gray-300 hover:border-blue-400 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="font-medium">Add Section at Top</span>
                </button>
              </div>

              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  className="relative section-container group"
                >
                  {/* Block content */}
                  <div>
                    {block.type === "layout" ? (
                      <SortableLayout
                        block={block}
                        isSelected={selectedBlock?.id === block.id}
                        onSelect={() => onSelectBlock(block)}
                        onUpdate={(updates) => onUpdateBlock(block.id, updates)}
                        onRemove={() => onRemoveBlock(block.id)}
                        onAddBlockToLayout={onAddBlockToLayout}
                        onRemoveBlockFromLayout={onRemoveBlockFromLayout}
                        onUpdateBlockInLayout={onUpdateBlockInLayout}
                        onSelectBlockInLayout={onSelectBlockInLayout}
                        onAddSection={() => {
                          console.log("Adding section after index:", index);
                          handleAddClick({} as React.MouseEvent, index + 1);
                        }}
                        index={index}
                      />
                    ) : (
                      <SortableBlock
                        block={block}
                        isSelected={selectedBlock?.id === block.id}
                        onSelect={() => onSelectBlock(block)}
                        onUpdate={(updates) => onUpdateBlock(block.id, updates)}
                        onRemove={() => onRemoveBlock(block.id)}
                        index={index}
                      />
                    )}
                  </div>

                  {/* Add Section Button Below Block */}
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={(e) => handleAddClick(e, index + 1)}
                      className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-110 border-4 border-white"
                      title="Add section below"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {/* Bottom add section */}
              <div className="flex justify-center pt-8">
                <button
                  onClick={(e) => handleAddClick(e, blocks.length)}
                  className="px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 rounded-xl hover:from-gray-200 hover:to-gray-100 transition-all duration-300 flex items-center space-x-3 border-2 border-dashed border-gray-300 hover:border-blue-400 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="font-semibold">Add New Section</span>
                </button>
              </div>
            </div>
          )}
          {/* Layout Selector Popup */}
          {showLayoutSelector && (
            <>
              <div
                className="fixed z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 min-w-64 backdrop-blur-sm bg-white/95"
                style={{
                  left: `${layoutSelectorPosition.x}px`,
                  top: `${layoutSelectorPosition.y}px`,
                  transform: "translate(-50%, -50%)",
                }}
                // onClick={(e) => {
                //   e.stopPropagation(); // Prevent click from closing the selector
                // }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Choose Layout
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      type: "one-column",
                      label: "Single Column",
                      icon: "▯",
                      description: "Full width content",
                      color: "from-blue-400 to-cyan-400",
                    },
                    {
                      type: "two-column",
                      label: "2 Columns",
                      icon: "▯▯",
                      description: "50% / 50%",
                      color: "from-purple-400 to-pink-400",
                    },
                    {
                      type: "three-column",
                      label: "3 Columns",
                      icon: "▯▯▯",
                      description: "33% each",
                      color: "from-green-400 to-emerald-400",
                    },
                    {
                      type: "two-column-aside",
                      label: "2:1 Columns",
                      icon: "▯▮",
                      description: "33% / 67%",
                      color: "from-orange-400 to-red-400",
                    },
                    {
                      type: "four-column",
                      label: "4 Columns",
                      icon: "▯▯▯▯",
                      description: "25% each",
                      color: "from-indigo-400 to-purple-400",
                    },
                    {
                      type: "sidebar-right",
                      label: "Sidebar Right",
                      icon: "▮▯",
                      description: "67% / 33%",
                      color: "from-pink-400 to-rose-400",
                    },
                  ].map((layout) => (
                    <button
                      key={layout.type}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Layout button clicked:", layout.type);
                        handleLayoutSelect(layout.type);
                      }}
                      className={`flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:scale-105 transition-all duration-300 text-center bg-gradient-to-br ${layout.color}/10 hover:${layout.color}/20`}
                    >
                      <div className="text-2xl mb-3 font-bold text-gray-800">
                        {layout.icon}
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        {layout.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {layout.description}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-4 text-xs text-gray-500 text-center">
                  Click to add layout at position{" "}
                  {insertIndex !== null ? insertIndex + 1 : "end"}
                </div>

                {/* Debug info */}
                <div className="mt-2 text-xs text-red-500 text-center">
                  Debug: insertIndex = {insertIndex}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
