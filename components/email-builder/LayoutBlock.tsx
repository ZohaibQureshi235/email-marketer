import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import EmailBlock from "./EmailBlock";
import { EmailBlock as EmailBlockType } from "./EmailBuilder";

interface LayoutBlockProps {
  block: EmailBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<EmailBlockType>) => void;
  onRemove: () => void;
  onAddBlockToLayout: (
    layoutId: string,
    columnIndex: number,
    blockType: string
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
    updates: Partial<EmailBlockType>
  ) => void;
  onSelectBlockInLayout: (block: EmailBlockType) => void;
}

export default function LayoutBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
  onAddBlockToLayout,
  onRemoveBlockFromLayout,
  onUpdateBlockInLayout,
  onSelectBlockInLayout,
}: LayoutBlockProps) {
  const layoutRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "block",
    item: { id: block.id, type: "layout" },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Fix: Properly combine refs for drag
  const setDragRef = (node: HTMLDivElement | null) => {
    layoutRef.current = node;
    drag(node);
  };

  const ColumnDropZone = ({ columnIndex }: { columnIndex: number }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: "block",
      drop: (item: { type: string; id: string }) => {
        if (item.type === "layout") return;

        // Fix: Pass the block type string instead of creating a block object
        onAddBlockToLayout(block.id, columnIndex, item.type);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }));

    // Fix: Properly combine refs for drop
    const setDropRef = (node: HTMLDivElement | null) => {
      drop(node);
    };

    return (
      <div
        ref={setDropRef}
        className={`min-h-[120px] p-4 border-2 border-dashed rounded-lg transition-colors ${
          isOver ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {block.columns?.[columnIndex]?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm space-y-2">
            <div>📥</div>
            <div>Drop blocks here</div>
            <div className="text-xs text-gray-400">
              Text, Images, Buttons, etc.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {block.columns?.[columnIndex]?.map((columnBlock) => (
              <EmailBlock
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
                  onRemoveBlockFromLayout(block.id, columnIndex, columnBlock.id)
                }
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderLayout = () => {
    switch (block.layoutType) {
      case "one-column":
        return (
          <div className="space-y-4">
            <ColumnDropZone columnIndex={0} />
          </div>
        );
      case "two-column":
        return (
          <div className="grid grid-cols-2 gap-4">
            <ColumnDropZone columnIndex={0} />
            <ColumnDropZone columnIndex={1} />
          </div>
        );
      case "two-column-aside":
        return (
          <div className="grid grid-cols-3 gap-4">
            <ColumnDropZone columnIndex={0} />
            <div className="col-span-2">
              <ColumnDropZone columnIndex={1} />
            </div>
          </div>
        );
      default:
        return <ColumnDropZone columnIndex={0} />;
    }
  };

  return (
    <div
      ref={setDragRef}
      className={`relative p-4 border-2 rounded-lg transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-sm"
          : "border-gray-300 bg-gray-50 hover:border-gray-400"
      } ${isDragging ? "opacity-50" : "opacity-100"}`}
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
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
          title="Remove layout"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      )}

      {isSelected && (
        <div className="absolute -top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
          {block.layoutType?.toUpperCase()} LAYOUT
        </div>
      )}

      <div className="mb-3">
        <h3 className="font-semibold text-gray-700 capitalize">
          {block.layoutType?.replace("-", " ")} Layout
        </h3>
        <p className="text-sm text-gray-500">
          Drag and drop blocks into the columns
        </p>
      </div>

      {renderLayout()}
    </div>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}