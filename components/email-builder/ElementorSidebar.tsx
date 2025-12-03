"use client";

import {
  DocumentTextIcon,
  PhotoIcon,
  RectangleGroupIcon,
  MinusIcon,
  TableCellsIcon,
  ArrowsPointingOutIcon,
  PlayCircleIcon,
  CodeBracketIcon,
  Squares2X2Icon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  UserGroupIcon,
  CalendarIcon,
  MapPinIcon,
  BellIcon,
  CreditCardIcon,
  CloudArrowUpIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from "react"; // Added useEffect
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { EmailBlockType } from "../../types/email-builder";

interface ElementorSidebarProps {
  onAddBlock: (type: EmailBlockType) => void;
  onAddLayout: (layout: string) => void;
  onUploadImage?: (file: File) => Promise<string>;
}

const widgetCategories = [
  { id: "elements", name: "Elements", icon: Squares2X2Icon },
  { id: "media", name: "Media", icon: PhotoIcon },
  { id: "assets", name: "Upload", icon: ArrowUpTrayIcon },
];

const premiumElements = [
  {
    type: "text" as EmailBlockType,
    label: "Text",
    icon: DocumentTextIcon,
    color: "text-green-600",
    category: "basic",
  },
  {
    type: "image" as EmailBlockType,
    label: "Image",
    icon: PhotoIcon,
    color: "text-orange-600",
    category: "media",
  },
  {
    type: "button" as EmailBlockType,
    label: "Button",
    icon: RectangleGroupIcon,
    color: "text-purple-600",
    category: "basic",
  },
  {
    type: "divider" as EmailBlockType,
    label: "Divider",
    icon: MinusIcon,
    color: "text-gray-600",
    category: "basic",
  },
  {
    type: "spacer" as EmailBlockType,
    label: "Spacer",
    icon: ArrowsPointingOutIcon,
    color: "text-blue-600",
    category: "basic",
  },
  {
    type: "video" as EmailBlockType,
    label: "Video",
    icon: PlayCircleIcon,
    color: "text-red-600",
    category: "media",
  },
  {
    type: "html" as EmailBlockType,
    label: "HTML",
    icon: CodeBracketIcon,
    color: "text-indigo-600",
    category: "advanced",
  },
  {
    type: "table" as EmailBlockType,
    label: "Table",
    icon: TableCellsIcon,
    color: "text-amber-600",
    category: "advanced",
  },
  {
    type: "social" as EmailBlockType,
    label: "Social Icons",
    icon: UserGroupIcon,
    color: "text-pink-600",
    category: "media",
  },
  {
    type: "testimonial" as EmailBlockType,
    label: "Testimonial",
    icon: ChatBubbleLeftRightIcon,
    color: "text-teal-600",
    category: "blocks",
  },
  {
    type: "rating" as EmailBlockType,
    label: "Rating Stars",
    icon: StarIcon,
    color: "text-yellow-600",
    category: "blocks",
  },
  {
    type: "countdown" as EmailBlockType,
    label: "Countdown",
    icon: CalendarIcon,
    color: "text-rose-600",
    category: "blocks",
  },
  {
    type: "map" as EmailBlockType,
    label: "Map",
    icon: MapPinIcon,
    color: "text-emerald-600",
    category: "blocks",
  },
  {
    type: "notification" as EmailBlockType,
    label: "Notification",
    icon: BellIcon,
    color: "text-violet-600",
    category: "blocks",
  },
  {
    type: "pricing" as EmailBlockType,
    label: "Pricing Table",
    icon: CreditCardIcon,
    color: "text-sky-600",
    category: "blocks",
  },
];

// Draggable Element Component
const DraggableElement = ({
  element,
  onAddBlock,
}: {
  element: any;
  onAddBlock: (type: EmailBlockType) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `new-${element.type}`,
      data: {
        type: element.type,
        fromSidebar: true,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onAddBlock(element.type);
      }}
      className={`flex flex-col items-center p-4 border border-gray-200 rounded-lg transition-all cursor-move group ${
        isDragging
          ? "opacity-50 scale-95 z-50"
          : "hover:border-blue-500 hover:bg-blue-50"
      }`}
    >
      <element.icon
        className={`h-6 w-6 ${element.color} mb-2 transition-transform group-hover:scale-110`}
      />
      <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600 text-center">
        {element.label}
      </span>
      <div className="mt-1 text-[10px] text-gray-400 capitalize">
        {element.category}
      </div>
    </div>
  );
};

export default function ElementorSidebar({
  onAddBlock,
  onAddLayout,
}: ElementorSidebarProps) {
  const [activeCategory, setActiveCategory] = useState("elements");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // FIXED: Changed from useState to useEffect
  useEffect(() => {
    const savedImages = localStorage.getItem("email-builder-images");
    if (savedImages) {
      try {
        setUploadedImages(JSON.parse(savedImages));
      } catch (error) {
        console.error("Error loading images:", error);
      }
    }
  }, []);

  // Save images to localStorage
  const saveImages = (images: string[]) => {
    localStorage.setItem("email-builder-images", JSON.stringify(images));
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImages: string[] = [];

    for (let i = 0; i < Math.min(files.length, 5); i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert(`Image ${file.name} is too large. Maximum size is 5MB.`);
        continue;
      }

      try {
        const reader = new FileReader();
        const imageUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        newImages.push(imageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    const updatedImages = [...uploadedImages, ...newImages];
    setUploadedImages(updatedImages);
    saveImages(updatedImages);
    setIsUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const useSelectedImage = () => {
    if (selectedImage) {
      onAddBlock("image");
      // Note: You would need to pass the image URL to the newly created image block
      // This could be done via a callback or context
    }
    setSelectedImage(null);
  };

  const deleteImage = (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedImages = uploadedImages.filter((img) => img !== imageUrl);
    setUploadedImages(updatedImages);
    saveImages(updatedImages);
    if (selectedImage === imageUrl) {
      setSelectedImage(null);
    }
  };

  const filteredElements = premiumElements.filter(
    (element) =>
      activeCategory === "elements" || element.category === activeCategory
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Element Library</h2>
        <p className="text-sm text-gray-600">
          Drag & drop elements to build your email
        </p>
      </div>

      {/* Categories */}
      <div className="flex border-b border-gray-200">
        {widgetCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex-1 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeCategory === category.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <category.icon className="h-4 w-4 mx-auto mb-1" />
            <span className="text-xs">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeCategory === "assets" ? (
          <div className="space-y-4">
            {/* Image Upload Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <CloudArrowUpIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-3">
                Upload images for your email
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block"
              >
                {isUploading ? "Uploading..." : "Upload Images"}
              </label>
              <p className="text-xs text-gray-500 mt-2">Max 5MB per image</p>
            </div>

            {/* Uploaded Images Grid */}
            {uploadedImages.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Your Images
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {uploadedImages.map((imageUrl, index) => (
                    <div
                      key={index}
                      onClick={() => handleImageSelect(imageUrl)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                        selectedImage === imageUrl
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={imageUrl}
                        alt={`Uploaded ${index}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => deleteImage(imageUrl, e)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                      {selectedImage === imageUrl && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 flex items-center justify-center">
                          <EyeIcon className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {selectedImage && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700">
                        Image selected
                      </span>
                      <button
                        onClick={useSelectedImage}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Use in Email
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredElements.map((element) => (
              <DraggableElement
                key={element.type}
                element={element}
                onAddBlock={onAddBlock}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
