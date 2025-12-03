"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ElementorLayout from "./ElementorLayout";
import { EmailBlock, EmailBlockType } from "@/types/email-builder";

interface SortableLayoutProps {
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
}

export default function SortableLayout({
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
}: SortableLayoutProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: block.id,
    data: {
      type: block.type,
      block,
      index,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? "z-50 opacity-50" : ""}`}
    >
      <div
        className={`absolute -top-2 left-1/2 transform -translate-x-1/2 z-10 ${
          isDragging ? "opacity-100" : "opacity-0 hover:opacity-100"
        } transition-opacity duration-200`}
      >
        <div
          {...attributes}
          {...listeners}
          className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg hover:shadow-xl transition-all duration-200"
          title="Drag to reorder"
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
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>
      </div>
      <ElementorLayout
        block={block}
        isSelected={isSelected}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onRemove={onRemove}
        onAddBlockToLayout={onAddBlockToLayout}
        onRemoveBlockFromLayout={onRemoveBlockFromLayout}
        onUpdateBlockInLayout={onUpdateBlockInLayout}
        onSelectBlockInLayout={onSelectBlockInLayout}
        onAddSection={onAddSection}
        index={index}
        isDragOver={false}
        dragOverColumn={undefined}
      />
    </div>
  );
}