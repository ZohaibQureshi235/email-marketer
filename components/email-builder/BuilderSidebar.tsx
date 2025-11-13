import { 
  DocumentTextIcon, 
  PhotoIcon, 
  RectangleGroupIcon,
  MinusIcon,
  ChevronDownIcon,
  TableCellsIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useDrag } from 'react-dnd';

interface BuilderSidebarProps {
  onAddBlock: (type: any) => void;
  onAddLayout: (layout: string) => void;
}

const blockTypes = [
  { type: 'text', label: 'Text', icon: DocumentTextIcon, color: 'text-green-600' },
  { type: 'button', label: 'Button', icon: RectangleGroupIcon, color: 'text-purple-600' },
  { type: 'image', label: 'Image', icon: PhotoIcon, color: 'text-orange-600' },
  { type: 'divider', label: 'Divider', icon: MinusIcon, color: 'text-gray-600' },
  { type: 'header', label: 'Header', icon: DocumentTextIcon, color: 'text-blue-600' },
  { type: 'footer', label: 'Footer', icon: DocumentTextIcon, color: 'text-red-600' },
  { type: 'table', label: 'Table', icon: TableCellsIcon, color: 'text-indigo-600' },
];

const layoutTypes = [
  { type: 'one-column', label: 'One Column', icon: DocumentTextIcon, description: 'Single column layout' },
  { type: 'two-column', label: 'Two Column', icon: Squares2X2Icon, description: 'Two equal columns' },
  { type: 'two-column-aside', label: 'Two Column Aside', icon: Squares2X2Icon, description: 'Main content with sidebar' },
];

// Draggable Block Item
const DraggableBlockItem = ({ block }: { block: typeof blockTypes[0] }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'block',
    item: { 
      type: block.type,
      id: `new-${block.type}`
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Fix: Proper drag ref
  const setDragRef = (node: HTMLDivElement | null) => {
    drag(node);
  };

  return (
    <div
      ref={setDragRef}
      className={`w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-move ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <block.icon className={`h-5 w-5 ${block.color}`} />
      <span>{block.label}</span>
    </div>
  );
};

export default function BuilderSidebar({ onAddBlock, onAddLayout }: BuilderSidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
      <div className="mb-8">
        <Link href={'/'}><h2 className="text-lg font-semibold text-gray-900 mb-4">Email Builder</h2></Link>
        
        {/* Layout Options */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Layouts</h3>
            <ChevronDownIcon className="h-4 w-4 text-gray-500" />
          </div>
          <div className="grid grid-cols-1 gap-2">
            {layoutTypes.map((layout) => (
              <button
                key={layout.type}
                onClick={() => onAddLayout(layout.type)}
                className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <layout.icon className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">{layout.label}</div>
                  <div className="text-xs text-gray-500">{layout.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Blocks Palette */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Content Blocks</h3>
          <div className="space-y-2">
            {blockTypes.map((block) => (
              <DraggableBlockItem key={block.type} block={block} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}