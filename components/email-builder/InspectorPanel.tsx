"use client";

import { useState, useRef, useEffect } from "react";
import { EmailBlock } from "./EmailBuilder";

interface InspectorPanelProps {
  selectedBlock: EmailBlock | null;
  onUpdateBlock: (id: string, updates: Partial<EmailBlock>) => void;
}

export default function InspectorPanel({
  selectedBlock,
  onUpdateBlock,
}: InspectorPanelProps) {
  const [activeTab, setActiveTab] = useState<"content" | "styles" | "settings">(
    "content"
  );
  const [imageUploadMethod, setImageUploadMethod] = useState<"url" | "upload">(
    "url"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localStyles, setLocalStyles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedBlock) {
      setLocalStyles(selectedBlock.styles || {});
    }
  }, [selectedBlock]);

  if (!selectedBlock) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <div className="text-center text-gray-500 py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <CursorClickIcon className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">
            No Block Selected
          </p>
          <p className="text-sm text-gray-600">
            Click on any block to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const updateStyle = (property: string, value: string) => {
    const updatedStyles = { ...selectedBlock.styles, [property]: value };

    setLocalStyles(updatedStyles);

    onUpdateBlock(selectedBlock.id, { styles: updatedStyles });
  };

  const updateContent = (content: string) => {
    onUpdateBlock(selectedBlock.id, { content });
  };

  const updateProperty = (property: string, value: any) => {
    onUpdateBlock(selectedBlock.id, { [property]: value });
  };

  const toggleTextStyle = (style: string, value: string) => {
    const currentValue = selectedBlock.styles[style];
    const newValue = currentValue === value ? "" : value;
    updateStyle(style, newValue);
  };

  const isStyleActive = (style: string, value: string) => {
    return selectedBlock.styles[style] === value;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      updateContent(imageUrl);
      updateProperty("altText", file.name);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getStyleValue = (property: string, defaultValue: string = "") => {
    return localStyles[property] || defaultValue;
  };

  const handleColorChange = (property: string, value: string) => {
    const formattedValue = value.startsWith("#") ? value : `#${value}`;
    updateStyle(property, formattedValue);
  };

  const handleStyleInputChange = (property: string, value: string) => {
    updateStyle(property, value);
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Block Inspector</h2>
        <p className="text-sm text-gray-600 capitalize">
          {selectedBlock.type} Block
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {["content", "styles", "settings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              activeTab === tab
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "content" && (
        <div className="space-y-6">
          {selectedBlock.type === "image" ? (
            <div className="space-y-4">
              {/* Image Upload Method Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Source
                </label>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setImageUploadMethod("url")}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      imageUploadMethod === "url"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    URL
                  </button>
                  <button
                    onClick={() => setImageUploadMethod("upload")}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      imageUploadMethod === "upload"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Upload
                  </button>
                </div>
              </div>

              {/* URL Input */}
              {imageUploadMethod === "url" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={selectedBlock.content}
                    onChange={(e) => updateContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the full URL of your image
                  </p>

                  {/* Image Preview */}
                  {selectedBlock.content && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Preview:
                      </p>
                      <img
                        src={selectedBlock.content}
                        alt="Preview"
                        className="w-full h-32 object-contain rounded-lg border bg-gray-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Invalid+Image";
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* File Upload */}
              {imageUploadMethod === "upload" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={triggerFileInput}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-600"
                  >
                    <div className="text-center">
                      <PhotoIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm font-medium">Click to upload</p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </button>

                  {/* Preview */}
                  {selectedBlock.content && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Preview:
                      </p>
                      <img
                        src={selectedBlock.content}
                        alt="Preview"
                        className="w-full h-32 object-contain rounded-lg border bg-gray-100"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Alt Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={selectedBlock.altText || ""}
                  onChange={(e) => updateProperty("altText", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Describe your image for accessibility"
                />
              </div>
            </div>
          ) : selectedBlock.type === "text" ||
            selectedBlock.type === "header" ||
            selectedBlock.type === "footer" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={selectedBlock.content}
                onChange={(e) => updateContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                rows={4}
                placeholder="Enter your content here..."
              />
            </div>
          ) : selectedBlock.type === "button" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  value={selectedBlock.content}
                  onChange={(e) => updateContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Button text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Link
                </label>
                <input
                  type="text"
                  value={selectedBlock.link || ""}
                  onChange={(e) => updateProperty("link", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={selectedBlock.content}
                onChange={(e) => updateContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                rows={6}
                placeholder="Enter your content here..."
              />
            </div>
          )}
        </div>
      )}

      {activeTab === "styles" && (
        <div className="space-y-6">
          {/* Text Formatting */}
          {(selectedBlock.type === "text" ||
            selectedBlock.type === "header" ||
            selectedBlock.type === "footer" ||
            selectedBlock.type === "button") && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Text Formatting
              </h3>

              {/* Text Style Buttons */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <button
                  onClick={() => toggleTextStyle("fontWeight", "bold")}
                  className={`p-2 border rounded-lg text-sm font-medium ${
                    isStyleActive("fontWeight", "bold")
                      ? "bg-blue-100 border-blue-500 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  title="Bold"
                >
                  <span className="font-bold">B</span>
                </button>
                <button
                  onClick={() => toggleTextStyle("fontStyle", "italic")}
                  className={`p-2 border rounded-lg text-sm ${
                    isStyleActive("fontStyle", "italic")
                      ? "bg-blue-100 border-blue-500 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  title="Italic"
                >
                  <span className="italic">I</span>
                </button>
                <button
                  onClick={() => toggleTextStyle("textDecoration", "underline")}
                  className={`p-2 border rounded-lg text-sm ${
                    isStyleActive("textDecoration", "underline")
                      ? "bg-blue-100 border-blue-500 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  title="Underline"
                >
                  <span className="underline">U</span>
                </button>
                <button
                  onClick={() => toggleTextStyle("textTransform", "uppercase")}
                  className={`p-2 border rounded-lg text-sm ${
                    isStyleActive("textTransform", "uppercase")
                      ? "bg-blue-100 border-blue-500 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  title="Uppercase"
                >
                  <span className="uppercase">A↥</span>
                </button>
              </div>

              {/* Text Alignment */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {["left", "center", "right"].map((align) => (
                  <button
                    key={align}
                    onClick={() => updateStyle("textAlign", align)}
                    className={`p-2 border rounded-lg text-sm ${
                      isStyleActive("textAlign", align)
                        ? "bg-blue-100 border-blue-500 text-blue-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    title={`Align ${align}`}
                  >
                    {align === "left" && "←"}
                    {align === "center" && "↔"}
                    {align === "right" && "→"}
                  </button>
                ))}
              </div>

              {/* Font Size */}
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-1">
                  Font Size
                </label>
                <select
                  value={getStyleValue("fontSize", "16px")}
                  onChange={(e) => updateStyle("fontSize", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                >
                  {[
                    "12px",
                    "14px",
                    "16px",
                    "18px",
                    "20px",
                    "24px",
                    "28px",
                    "32px",
                    "36px",
                    "48px",
                  ].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {/* Text Color */}
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-1">
                  Text Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={getStyleValue("color", "#000000")}
                    onChange={(e) => handleColorChange("color", e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={getStyleValue("color", "#000000")}
                    onChange={(e) => handleColorChange("color", e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-1">
                  Background Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={getStyleValue("backgroundColor", "#ffffff")}
                    onChange={(e) =>
                      handleColorChange("backgroundColor", e.target.value)
                    }
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={getStyleValue("backgroundColor", "#ffffff")}
                    onChange={(e) =>
                      handleColorChange("backgroundColor", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              {/* Padding */}
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-1">
                  Padding
                </label>
                <select
                  value={getStyleValue("padding", "10px")}
                  onChange={(e) => updateStyle("padding", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                >
                  {[
                    "0px",
                    "4px",
                    "8px",
                    "10px",
                    "12px",
                    "16px",
                    "20px",
                    "24px",
                    "32px",
                  ].map((padding) => (
                    <option key={padding} value={padding}>
                      {padding}
                    </option>
                  ))}
                </select>
              </div>

              {/* Margin */}
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-1">
                  Margin
                </label>
                <select
                  value={getStyleValue("margin", "0px")}
                  onChange={(e) => updateStyle("margin", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                >
                  {[
                    "0px",
                    "4px",
                    "8px",
                    "12px",
                    "16px",
                    "20px",
                    "24px",
                    "32px",
                  ].map((margin) => (
                    <option key={margin} value={margin}>
                      {margin}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Button Specific Styles */}
          {selectedBlock.type === "button" && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Button Styles
              </h3>

              {/* Button Background Color */}
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-1">
                  Background Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={getStyleValue("backgroundColor", "#3B82F6")}
                    onChange={(e) =>
                      handleColorChange("backgroundColor", e.target.value)
                    }
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={getStyleValue("backgroundColor", "#3B82F6")}
                    onChange={(e) =>
                      handleColorChange("backgroundColor", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              {/* Button Text Color */}
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-1">
                  Text Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={getStyleValue("color", "#FFFFFF")}
                    onChange={(e) => handleColorChange("color", e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={getStyleValue("color", "#FFFFFF")}
                    onChange={(e) => handleColorChange("color", e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-1">
                  Border Radius
                </label>
                <select
                  value={getStyleValue("borderRadius", "6px")}
                  onChange={(e) => updateStyle("borderRadius", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                >
                  {["0px", "4px", "6px", "8px", "12px", "20px", "50px"].map(
                    (radius) => (
                      <option key={radius} value={radius}>
                        {radius}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-1">
                  Border
                </label>
                <select
                  value={getStyleValue("border", "none")}
                  onChange={(e) => updateStyle("border", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                >
                  {[
                    "none",
                    "1px solid #ddd",
                    "2px solid #ddd",
                    "1px solid #000",
                    "2px solid #000",
                  ].map((border) => (
                    <option key={border} value={border}>
                      {border}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Image Specific Styles */}
          {selectedBlock.type === "image" && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Image Styles
              </h3>

              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-1">
                  Alignment
                </label>
                <select
                  value={getStyleValue("textAlign", "center")}
                  onChange={(e) => updateStyle("textAlign", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                >
                  {["left", "center", "right"].map((align) => (
                    <option key={align} value={align}>
                      {align}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-1">
                  Border Radius
                </label>
                <select
                  value={getStyleValue("borderRadius", "0px")}
                  onChange={(e) => updateStyle("borderRadius", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                >
                  {["0px", "4px", "8px", "12px", "16px", "20px", "50%"].map(
                    (radius) => (
                      <option key={radius} value={radius}>
                        {radius}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-1">
                  Width
                </label>
                <select
                  value={getStyleValue("width", "100%")}
                  onChange={(e) => updateStyle("width", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                >
                  {["100%", "80%", "75%", "50%", "33%", "25%"].map((width) => (
                    <option key={width} value={width}>
                      {width}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Block Type
            </label>
            <p className="text-sm text-gray-600 capitalize bg-gray-100 px-3 py-2 rounded">
              {selectedBlock.type}
            </p>
          </div>

          {selectedBlock.layoutType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Layout Type
              </label>
              <p className="text-sm text-gray-600 capitalize bg-gray-100 px-3 py-2 rounded">
                {selectedBlock.layoutType}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Block ID
            </label>
            <p className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded font-mono text-xs">
              {selectedBlock.id}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function PhotoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function CursorClickIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
      />
    </svg>
  );
}
