"use client";

import ElementorSidebar from "./ElementorSidebar";
import InspectorPanel from "./InspectorPanel";
import { EmailBlock } from "@/types/email-builder";

interface MainSidebarProps {
  selectedBlock: EmailBlock | null;
  onUpdateBlock: (id: string, updates: Partial<EmailBlock>) => void;
  onAddBlock: (type: any) => void;
  onAddLayout: (layout: string) => void;
}

export default function MainSidebar({
  selectedBlock,
  onUpdateBlock,
  onAddBlock,
  onAddLayout,
}: MainSidebarProps) {
  // Check if selected block is a layout
  const isLayoutSelected = selectedBlock?.type === "layout";
  
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">
      {selectedBlock && !isLayoutSelected ? (
        // Show InspectorPanel for non-layout blocks only
        <InspectorPanel
          selectedBlock={selectedBlock}
          onUpdateBlock={onUpdateBlock}
        />
      ) : (
        // Show ElementorSidebar for layout blocks or when no block is selected
        <ElementorSidebar onAddBlock={onAddBlock} onAddLayout={onAddLayout} />
      )}
    </div>
  );
}