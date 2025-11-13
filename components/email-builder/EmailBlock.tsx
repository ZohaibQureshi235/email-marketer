import { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { EmailBlock as EmailBlockType } from './EmailBuilder';

interface EmailBlockProps {
  block: EmailBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<EmailBlockType>) => void;
  onRemove: () => void;
}

export default function EmailBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
}: EmailBlockProps) {
  const blockRef = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'block',
    item: { id: block.id, type: block.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Fix: Properly combine refs
  const setDragRef = (node: HTMLDivElement | null) => {
    blockRef.current = node;
    drag(node);
  };

  const handleContentChange = (newContent: string) => {
    onUpdate({ content: newContent });
  };

  // Fix: Add direct editing for all text-based blocks
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleContentChange(e.target.value);
  };

  const renderBlockContent = () => {
    console.log(block)
    switch (block.type) {
      case 'text':
      case 'header':
      case 'footer':
        return (
          <div className="w-full">
            {isSelected ? (
              <textarea
                value={block.content}
                onChange={handleTextChange}
                style={block.styles}
                className="w-full p-2 border border-gray-300 rounded outline-none resize-none min-h-[60px]"
                rows={3}
              />
            ) : (
              <div
                style={block.styles}
                className="outline-none w-full min-h-[20px] p-2"
                dangerouslySetInnerHTML={{ __html: block.content }}
              />
            )}
          </div>
        );
      case 'button':
        return (
          <div className="text-center">
            {isSelected ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={block.content}
                  style={block.styles}
                  onChange={(e) => onUpdate({ content: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded text-center"
                  placeholder="Button text"
                />
                <input
                  type="text"
                  value={block.link || '#'}
                  style={block.styles}
                  onChange={(e) => onUpdate({ link: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded text-center text-sm"
                  placeholder="Button URL"
                />
              </div>
            ) : (
              <a
                href={block.link || '#'}
                style={block.styles}
                className="inline-block px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
                onClick={(e) => e.preventDefault()}
              >
                {block.content}
              </a>
            )}
          </div>
        );
      case 'image':
        return (
          <div className="text-center">
            <img
              src={block.content}
              alt={block.altText || 'Image'}
              style={block.styles}
              className="mx-auto max-w-full"
            />
            {isSelected && (
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  value={block.content}
                  onChange={(e) => onUpdate({ content: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  placeholder="Image URL"
                />
                <input
                  type="text"
                  value={block.altText || ''}
                  onChange={(e) => onUpdate({ altText: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  placeholder="Alt text"
                />
              </div>
            )}
          </div>
        );
      case 'divider':
        return (
          <hr style={block.styles} className="my-4" />
        );
      case 'table':
        return (
          <div className="overflow-x-auto">
            {isSelected ? (
              <textarea
                value={block.content}
                onChange={handleTextChange}
                className="w-full p-2 border border-gray-300 rounded outline-none resize-none min-h-[100px] font-mono text-sm"
                placeholder="Paste your HTML table here"
                rows={6}
              />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: block.content }} />
            )}
          </div>
        );
      default:
        return (
          <div style={block.styles} className="p-4">
            {block.content || `Empty ${block.type} block`}
          </div>
        );
    }
  };

  return (
    <div
      ref={setDragRef}
      className={`relative p-4 border-2 rounded-lg transition-all cursor-move bg-white ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
          : 'border-transparent hover:border-gray-300 hover:shadow-md'
      } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors z-10 shadow-lg"
          title="Remove block"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      )}
      
      {isSelected && (
        <div className="absolute -top-3 left-4 bg-blue-500 text-white text-xs px-3 py-1 rounded-full shadow-lg">
          {block.type.toUpperCase()}
        </div>
      )}
      
      <div className={isSelected ? 'pt-6' : ''}>
        {renderBlockContent()}
      </div>
    </div>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}