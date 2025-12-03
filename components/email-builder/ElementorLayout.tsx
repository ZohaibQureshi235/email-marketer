"use client";
import { useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import ElementorBlock from "./ElementorBlock";
import { EmailBlock, EmailBlockType } from "../../types/email-builder";

interface ElementorLayoutProps {
  block: EmailBlock;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<EmailBlock>) => void;
  onRemove: () => void;
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
  onAddSection: () => void;
  index: number;
  isDragOver?: boolean;
  dragOverColumn?: number;
}

export default function ElementorLayout({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
  onAddBlockToLayout,
  onRemoveBlockFromLayout,
  onUpdateBlockInLayout,
  onSelectBlockInLayout,
  onAddSection,
  index,
  isDragOver = false,
  dragOverColumn,
}: ElementorLayoutProps) {
  const layoutRef = useRef<HTMLDivElement>(null);

  const ColumnDropZone = ({ columnIndex }: { columnIndex: number }) => {
    const dropRef = useRef<HTMLDivElement>(null);

    const { setNodeRef, isOver } = useDroppable({
      id: `layout-${block.id}-column-${columnIndex}`,
      data: {
        layoutId: block.id,
        columnIndex: columnIndex,
        accepts: ["widget", "block"],
      },
    });

    const isActiveDropZone = isDragOver && dragOverColumn === columnIndex;
    const columnBlocks = block.columns?.[columnIndex] || [];

    return (
      <div
        ref={(node) => {
          dropRef.current = node;
          setNodeRef(node);
        }}
        className={`column-drop-zone min-h-[160px] p-6 rounded-xl transition-all duration-300 relative ${
          isOver || isActiveDropZone
            ? "border-3 border-dashed border-blue-500 bg-gradient-to-r from-blue-50/50 to-purple-50/50 scale-105"
            : "border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-gray-50/50"
        } ${isOver ? "shadow-lg shadow-blue-200/50" : ""}`}
        data-layout-id={block.id}
        data-column-index={columnIndex}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onMouseLeave={() => {
          if (dropRef.current) {
            dropRef.current.style.transform = "scale(1)";
          }
        }}
      >
        {(isOver || isActiveDropZone) && (
          <div className="absolute inset-0 border-2 border-blue-400 rounded-xl animate-pulse pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-xl" />
          </div>
        )}

        {columnBlocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div className="text-gray-500 font-medium mb-1">
              Drop elements here
            </div>
            <div className="text-gray-300 text-xs">
              or click to add content
            </div>
          </div>
        ) : (
          <div className="space-y-4 relative">
            {/* Column header */}
            <div className="flex items-center justify-between mb-2 px-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Column {columnIndex + 1}
              </div>
              <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {columnBlocks.length} element
                {columnBlocks.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Blocks with animations */}
            {columnBlocks.map((columnBlock, blockIndex) => (
              <div
                key={columnBlock.id}
                className="transition-all duration-300 hover:scale-[1.02]"
              >
                <ElementorBlock
                  key={columnBlock.id}
                  block={columnBlock}
                  isSelected={false}
                  onSelect={() => onSelectBlockInLayout(columnBlock)}
                  onUpdate={(updates) =>
                    onUpdateBlockInLayout(
                      block.id,
                      columnIndex,
                      columnBlock.id,
                      updates
                    )
                  }
                  onRemove={() =>
                    onRemoveBlockFromLayout(
                      block.id,
                      columnIndex,
                      columnBlock.id
                    )
                  }
                  index={blockIndex}
                  columnIndex={columnIndex}
                  layoutId={block.id}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderLayout = () => {
    const columnConfigs = {
      "one-column": [1],
      "two-column": [2],
      "three-column": [3],
      "two-column-aside": [2], // 2 columns with different widths
      "sidebar-right": [2], // 2 columns with different widths
      "four-column": [4],
    };

    const config = columnConfigs[
      block.layoutType as keyof typeof columnConfigs
    ] || [1];
    const columnCount = config[0];

    // Create columns array
    const columns = Array(columnCount)
      .fill(null)
      .map((_, i) => i);

    // Get grid classes based on layout type
    let gridClass = "grid grid-cols-1";

    switch (block.layoutType) {
      case "one-column":
        gridClass = "grid grid-cols-1";
        break;
      case "two-column":
        gridClass = "grid grid-cols-1 md:grid-cols-2";
        break;
      case "three-column":
        gridClass = "grid grid-cols-1 md:grid-cols-3";
        break;
      case "four-column":
        gridClass = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
        break;
      case "two-column-aside":
        gridClass = "grid grid-cols-1 md:grid-cols-3";
        break;
      case "sidebar-right":
        gridClass = "grid grid-cols-1 md:grid-cols-3";
        break;
      default:
        gridClass = "grid grid-cols-1";
    }

    // For special layouts with different column widths
    if (
      block.layoutType === "two-column-aside" ||
      block.layoutType === "sidebar-right"
    ) {
      return (
        <div className={gridClass + " gap-6"}>
          {columns.map((_, index) => (
            <div
              key={index}
              className={
                block.layoutType === "two-column-aside"
                  ? index === 0
                    ? "md:col-span-1"
                    : "md:col-span-2"
                  : index === 0
                  ? "md:col-span-2"
                  : "md:col-span-1"
              }
            >
              <ColumnDropZone columnIndex={index} />
            </div>
          ))}
        </div>
      );
    }

    // For regular layouts
    return (
      <div className={gridClass + " gap-6"}>
        {columns.map((_, index) => (
          <ColumnDropZone key={index} columnIndex={index} />
        ))}
      </div>
    );
  };

  const columns = block.columns || [];

  return (
    <div
      ref={layoutRef}
      className={`relative p-8 rounded-2xl transition-all duration-300 group cursor-move ${
        isSelected
          ? "ring-4 ring-blue-500 bg-gradient-to-r from-blue-50/30 to-purple-50/30 shadow-xl"
          : "hover:ring-2 hover:ring-blue-300/50 bg-white/90 backdrop-blur-sm"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex space-x-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/50 p-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddSection(); // This should call the function passed from ElementorCanvas
          }}
          className="w-9 h-9 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg flex items-center justify-center hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110"
          title="Add Section"
        >
          <svg
            className="h-5 w-5"
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="w-9 h-9 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg flex items-center justify-center hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110"
          title="Delete Section"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Layout Type Badge */}
      <div className="absolute top-2 right-2">
        <div className="text-xs font-bold px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full border border-gray-300/50">
          {block.layoutType?.replace("-", " ").toUpperCase()}
        </div>
      </div>

      {/* Content */}
      <div className={`transition-opacity duration-300`}>{renderLayout()}</div>

      {/* Column Summary */}
      <div className="flex justify-between mt-6 text-sm text-gray-500 pt-4 border-t border-gray-200/50">
        {columns.map((column, index) => (
          <div key={index} className="text-center flex-1">
            <div className="font-semibold text-gray-700">
              Column {index + 1}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              <span className="inline-flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                    clipRule="evenodd"
                  />
                </svg>
                {column?.length || 0} elements
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
