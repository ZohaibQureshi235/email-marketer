"use client";

import { useRef, useState, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { EmailBlock as EmailBlockType } from "@/types/email-builder";

interface ElementorBlockProps {
  block: EmailBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<EmailBlockType>) => void;
  onRemove: () => void;
  index: number;
  columnIndex?: number;
  layoutId?: string;
}

// Helper function to extract text from HTML
const extractTextFromHTML = (html: string): string => {
  if (!html) return "";

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || tempDiv.innerText || "";
  return text.trim();
};

export default function ElementorBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
  index,
  columnIndex,
  layoutId,
}: ElementorBlockProps) {
  const blockRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const [localContent, setLocalContent] = useState(block.content);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: block.id,
      data: {
        type: block.type,
        block,
        index,
        columnIndex,
        layoutId,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  // Sync local content with block content
  useEffect(() => {
    setLocalContent(block.content);
  }, [block.content]);

  const handleContentChange = (newContent: string) => {
    onUpdate({ content: newContent });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalContent(e.target.value);
  };

  const handleTextBlur = () => {
    if (localContent !== block.content) {
      handleContentChange(localContent);
    }
    setIsEditing(false);
  };

  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow all keys including space
    if (e.key === "Escape") {
      setLocalContent(block.content);
      textInputRef.current?.blur();
    }
    if (e.key === "Enter") {
      handleContentChange(localContent);
      textInputRef.current?.blur();
    }

    // Don't stop propagation - let the input handle all keys normally
  };

  const handleTextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSelected) {
      onSelect();
    }
    setIsEditing(true);
    setTimeout(() => {
      textInputRef.current?.focus();
      textInputRef.current?.select();
    }, 10);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Create image URL from file
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      onUpdate({ content: imageUrl });
    };
    reader.readAsDataURL(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case "text":
      case "header":
      case "footer":
        return (
          <div className="w-full">
            {isSelected ? (
              <input
                ref={textInputRef}
                type="text"
                value={extractTextFromHTML(localContent)}
                onChange={handleTextChange}
                onBlur={handleTextBlur}
                onKeyDown={handleTextKeyDown}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  ...block.styles,
                }}
                className="w-full p-4 border-2 border-blue-300 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white text-gray-800"
                placeholder="Type your text here..."
                autoFocus={isSelected}
              />
            ) : (
              <div
                style={{ ...block.styles }}
                className="outline-none cursor-text p-4 rounded-xl hover:bg-gray-50/50 transition-colors duration-200"
                onClick={handleTextClick}
                dangerouslySetInnerHTML={{ __html: block.content }}
              />
            )}
          </div>
        );

      case "button":
        const buttonText = extractTextFromHTML(block.content);
        const [localButtonText, setLocalButtonText] = useState(buttonText);
        const [localButtonLink, setLocalButtonLink] = useState(
          block.link || "#"
        );
        const buttonTextRef = useRef<HTMLInputElement>(null);
        const buttonLinkRef = useRef<HTMLInputElement>(null);

        useEffect(() => {
          setLocalButtonText(buttonText);
          setLocalButtonLink(block.link || "#");
        }, [block.content, block.link]);

        const handleButtonTextChange = (
          e: React.ChangeEvent<HTMLInputElement>
        ) => {
          const newText = e.target.value;
          setLocalButtonText(newText);
        };

        const handleButtonTextBlur = () => {
          onUpdate({
            content: `<a href="${localButtonLink}" style="${Object.entries(
              block.styles || {}
            )
              .map(([key, value]) => `${key}: ${value};`)
              .join("")}">${localButtonText}</a>`,
          });
        };

        const handleButtonLinkChange = (
          e: React.ChangeEvent<HTMLInputElement>
        ) => {
          const newLink = e.target.value;
          setLocalButtonLink(newLink);
        };

        const handleButtonLinkBlur = () => {
          onUpdate({
            link: localButtonLink,
            content: `<a href="${localButtonLink}" style="${Object.entries(
              block.styles || {}
            )
              .map(([key, value]) => `${key}: ${value};`)
              .join("")}">${localButtonText}</a>`,
          });
        };

        const handleButtonKeyDown = (
          e: React.KeyboardEvent<HTMLInputElement>
        ) => {
          if (e.key === "Escape") {
            e.currentTarget.blur();
          }
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        };

        const handleButtonClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (!isSelected) {
            onSelect();
          }
        };

        return (
          <div className="text-center p-2" onClick={handleButtonClick}>
            {isSelected ? (
              <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl">
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    Button Text:
                  </div>
                  <input
                    ref={buttonTextRef}
                    type="text"
                    value={localButtonText}
                    onChange={handleButtonTextChange}
                    onBlur={handleButtonTextBlur}
                    onKeyDown={handleButtonKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full p-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                    placeholder="Button text"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    Button Link:
                  </div>
                  <input
                    ref={buttonLinkRef}
                    type="text"
                    value={localButtonLink}
                    onChange={handleButtonLinkChange}
                    onBlur={handleButtonLinkBlur}
                    onKeyDown={handleButtonKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                    placeholder="Button URL"
                  />
                </div>
              </div>
            ) : (
              <div
                style={block.styles}
                className="inline-block cursor-pointer transform hover:scale-105 transition-transform duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
                dangerouslySetInnerHTML={{ __html: block.content }}
              />
            )}
          </div>
        );

      case "image":
        const [imageUrl, setImageUrl] = useState(block.content);
        const [altText, setAltText] = useState(block.altText || "");
        const imageUrlRef = useRef<HTMLInputElement>(null);
        const altTextRef = useRef<HTMLInputElement>(null);

        useEffect(() => {
          setImageUrl(block.content);
          setAltText(block.altText || "");
        }, [block.content, block.altText]);

        const handleImageUrlChange = (
          e: React.ChangeEvent<HTMLInputElement>
        ) => {
          const newUrl = e.target.value;
          setImageUrl(newUrl);
        };

        const handleImageUrlBlur = () => {
          onUpdate({ content: imageUrl });
        };

        const handleAltTextChange = (
          e: React.ChangeEvent<HTMLInputElement>
        ) => {
          const newAlt = e.target.value;
          setAltText(newAlt);
        };

        const handleAltTextBlur = () => {
          onUpdate({ altText });
        };

        const handleImageKeyDown = (
          e: React.KeyboardEvent<HTMLInputElement>
        ) => {
          if (e.key === "Escape") {
            e.currentTarget.blur();
          }
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        };

        const handleImageClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (!isSelected) {
            onSelect();
          }
        };

        return (
          <div className="text-center p-2" onClick={handleImageClick}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            {isSelected ? (
              <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl">
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    Preview:
                  </div>
                  <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
                    <img
                      src={imageUrl}
                      alt={altText}
                      className="max-w-full h-auto rounded-lg mx-auto"
                      style={block.styles}
                    />
                  </div>
                  <div className="mt-3 flex justify-center">
                    <button
                      onClick={triggerImageUpload}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      Upload Image
                    </button>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    Image URL:
                  </div>
                  <input
                    ref={imageUrlRef}
                    type="text"
                    value={imageUrl}
                    onChange={handleImageUrlChange}
                    onBlur={handleImageUrlBlur}
                    onKeyDown={handleImageKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    Alt Text:
                  </div>
                  <input
                    ref={altTextRef}
                    type="text"
                    value={altText}
                    onChange={handleAltTextChange}
                    onBlur={handleAltTextBlur}
                    onKeyDown={handleImageKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                    placeholder="Description of the image"
                  />
                </div>
              </div>
            ) : (
              <div
                className="cursor-pointer transform hover:scale-[1.02] transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
              >
                <img
                  src={block.content}
                  alt={block.altText || "Image"}
                  className="max-w-full h-auto rounded-xl mx-auto"
                  style={block.styles}
                />
                {isHovered && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to edit
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div
            style={block.styles}
            className="p-4 cursor-pointer rounded-xl hover:bg-gray-50/50 transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        );
    }
  };

  return (
    <div
      ref={(node) => {
        blockRef.current = node;
        setNodeRef(node);
      }}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative p-4 rounded-2xl transition-all duration-300 group ${
        isSelected
          ? "ring-4 ring-blue-500 bg-gradient-to-r from-blue-50/30 to-cyan-50/30 shadow-xl"
          : "hover:ring-2 hover:ring-blue-300/50 bg-white"
      } ${isDragging ? "opacity-60 scale-95 z-50" : "opacity-100"}`}
      onClick={(e) => {
        if (!isEditing) {
          e.stopPropagation();
          onSelect();
        }
      }}
    >
      {/* Hover Controls - Hide when editing */}
      {!isEditing && (
        <div
          className={`absolute -top-2 -right-2 flex space-x-1.5 transition-all duration-300 ${
            isHovered || isSelected ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="w-7 h-7 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
            title="Delete"
            type="button"
          >
            <svg
              className="h-3.5 w-3.5"
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
          <div
            {...attributes}
            {...listeners}
            className="w-7 h-7 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200"
            title="Drag"
          >
            <svg
              className="h-3.5 w-3.5"
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
      )}

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute -top-2 left-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            {block.type.toUpperCase()}
          </div>
        </div>
      )}

      {/* Content with animation */}
      <div
        className={`transition-all duration-300 ${
          isDragging ? "opacity-50" : "opacity-100"
        }`}
      >
        {renderBlockContent()}
      </div>

      {/* Glow effect when dragging */}
      {isDragging && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl pointer-events-none" />
      )}
    </div>
  );
}
