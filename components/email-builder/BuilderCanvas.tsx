'use client';

import { useRef } from 'react';
import { useDrop } from 'react-dnd';
import EmailBlock from './EmailBlock';
import LayoutBlock from './LayoutBlock';
import { EmailBlock as EmailBlockType } from './EmailBuilder';

interface BuilderCanvasProps {
  blocks: EmailBlockType[];
  selectedBlock: EmailBlockType | null;
  onSelectBlock: (block: EmailBlockType | null) => void;
  onUpdateBlock: (id: string, updates: Partial<EmailBlockType>) => void;
  onRemoveBlock: (id: string) => void;
  onAddBlockToLayout: (layoutId: string, columnIndex: number, blockType: string) => void; 
  onRemoveBlockFromLayout: (layoutId: string, columnIndex: number, blockId: string) => void;
  onUpdateBlockInLayout: (layoutId: string, columnIndex: number, blockId: string, updates: Partial<EmailBlockType>) => void;
  onSelectBlockInLayout: (block: EmailBlockType) => void;
  onDropFromSidebar: (item: { type: string; id: string }) => void;
}

export default function BuilderCanvas({
  blocks,
  selectedBlock,
  onSelectBlock,
  onUpdateBlock,
  onRemoveBlock,
  onAddBlockToLayout,
  onRemoveBlockFromLayout,
  onUpdateBlockInLayout,
  onSelectBlockInLayout,
  onDropFromSidebar,
}: BuilderCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'block',
    drop: (item: { type: string; id: string }, monitor) => {
      if (!monitor.didDrop()) {
        if (item.id.startsWith('new-')) {
          onDropFromSidebar(item);
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  // Properly combine refs
  const setDropRef = (node: HTMLDivElement | null) => {
    canvasRef.current = node;
    drop(node);
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Email Canvas</h1>
            <p className="text-gray-600 mt-1">
              Drag and drop blocks to create your email template
            </p>
          </div>

          <div
            ref={setDropRef}
            className={`min-h-[600px] p-6 transition-colors ${
              isOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : 'border-2 border-dashed border-transparent'
            }`}
            onClick={() => onSelectBlock(null)}
          >
            {blocks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <DocumentTextIcon className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-500 mb-2">No blocks added yet</p>
                <p className="text-sm text-gray-400">
                  Drag blocks from the sidebar to start building
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {blocks.map((block) => (
                  <div key={block.id}>
                    {block.type === 'layout' ? (
                      <LayoutBlock
                        block={block}
                        isSelected={selectedBlock?.id === block.id}
                        onSelect={() => onSelectBlock(block)}
                        onUpdate={(updates) => onUpdateBlock(block.id, updates)}
                        onRemove={() => onRemoveBlock(block.id)}
                        onAddBlockToLayout={onAddBlockToLayout}
                        onRemoveBlockFromLayout={onRemoveBlockFromLayout}
                        onUpdateBlockInLayout={onUpdateBlockInLayout}
                        onSelectBlockInLayout={onSelectBlockInLayout}
                      />
                    ) : (
                      <EmailBlock
                        block={block}
                        isSelected={selectedBlock?.id === block.id}
                        onSelect={() => onSelectBlock(block)}
                        onUpdate={(updates) => onUpdateBlock(block.id, updates)}
                        onRemove={() => onRemoveBlock(block.id)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}