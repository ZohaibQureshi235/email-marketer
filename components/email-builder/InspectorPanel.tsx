"use client";

import { useState, useRef, useEffect } from "react";
import { EmailBlock, EmailBlockType } from "../../types/email-builder";

interface InspectorPanelProps {
  selectedBlock: EmailBlock | null;
  onUpdateBlock: (id: string, updates: Partial<EmailBlock>) => void;
}

type StyleTab =
  | "content"
  | "style"
  | "advanced"
  | "responsive"
  | "background"
  | "border"
  | "typography"
  | "spacing";

export default function InspectorPanel({
  selectedBlock,
  onUpdateBlock,
}: InspectorPanelProps) {
  const [activeTab, setActiveTab] = useState<StyleTab>("content");
  const [localStyles, setLocalStyles] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedBlock) {
      setLocalStyles(selectedBlock.styles || {});
    }
  }, [selectedBlock]);

  if (!selectedBlock) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6 flex-shrink-0">
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
    onUpdateBlock(selectedBlock.id, { styles: updatedStyles });
  };

  const updateContent = (content: string) => {
    onUpdateBlock(selectedBlock.id, { content });
  };

  const updateProperty = (property: string, value: any) => {
    onUpdateBlock(selectedBlock.id, { [property]: value });
  };

  // Handle key events for inputs
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
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
      updateContent(imageUrl);
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

  // Color Picker Component
  const ColorPicker = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleInputKeyDown}
          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleInputKeyDown}
          className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  // Size Input Component
  const SizeInput = ({
    label,
    value,
    onChange,
    unit = "px",
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    unit?: string;
  }) => (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center">
        <input
          type="number"
          value={parseInt(value) || 0}
          onChange={(e) => onChange(`${e.target.value}${unit}`)}
          onKeyDown={handleInputKeyDown}
          className="flex-1 px-2 py-1 border border-gray-300 rounded-l text-xs"
        />
        <span className="px-2 py-1 bg-gray-100 border border-l-0 border-gray-300 text-xs text-gray-600 rounded-r">
          {unit}
        </span>
      </div>
    </div>
  );

  // Typography Controls
  const TypographyControls = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Font Family
          </label>
          <select
            value={localStyles.fontFamily || "Arial, sans-serif"}
            onChange={(e) => updateStyle("fontFamily", e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="w-full text-black px-2 py-1 border border-gray-300 rounded text-xs"
          >
            <option value="Arial, Helvetica, sans-serif">Arial</option>
            <option value="'Helvetica Neue', Helvetica, sans-serif">
              Helvetica
            </option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Times New Roman', Times, serif">
              Times New Roman
            </option>
            <option value="Verdana, Geneva, sans-serif">Verdana</option>
            <option value="'Courier New', Courier, monospace">
              Courier New
            </option>
            <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Font Size
          </label>
          <div className="flex space-x-1">
            <select
              value={parseInt(localStyles.fontSize || "16")}
              onChange={(e) => updateStyle("fontSize", `${e.target.value}px`)}
              onKeyDown={handleInputKeyDown}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
            >
              {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64].map(
                (size) => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Font Weight
          </label>
          <select
            value={localStyles.fontWeight || "normal"}
            onChange={(e) => updateStyle("fontWeight", e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="w-full text-black px-2 py-1 border border-gray-300 rounded text-xs"
          >
            <option value="100">Thin (100)</option>
            <option value="200">Extra Light (200)</option>
            <option value="300">Light (300)</option>
            <option value="400">Normal (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semi Bold (600)</option>
            <option value="700">Bold (700)</option>
            <option value="800">Extra Bold (800)</option>
            <option value="900">Black (900)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Line Height
          </label>
          <select
            value={localStyles.lineHeight || "1.5"}
            onChange={(e) => updateStyle("lineHeight", e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="w-full text-black px-2 py-1 border border-gray-300 rounded text-xs"
          >
            <option value="1">1</option>
            <option value="1.2">1.2</option>
            <option value="1.4">1.4</option>
            <option value="1.5">1.5</option>
            <option value="1.6">1.6</option>
            <option value="1.8">1.8</option>
            <option value="2">2</option>
            <option value="2.5">2.5</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ColorPicker
          label="Text Color"
          value={localStyles.color || "#000000"}
          onChange={(value) => updateStyle("color", value)}
        />
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Text Align
          </label>
          <div className="flex space-x-1">
            {["left", "center", "right", "justify"].map((align) => (
              <button
                key={align}
                onClick={() => updateStyle("textAlign", align)}
                onKeyDown={handleInputKeyDown}
                className={`flex-1 px-2 py-1 text-xs border rounded ${
                  localStyles.textAlign === align
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {align === "left" && "←"}
                {align === "center" && "↔"}
                {align === "right" && "→"}
                {align === "justify" && "⇔"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Text Transform
        </label>
        <div className="flex space-x-1">
          {["none", "uppercase", "lowercase", "capitalize"].map((transform) => (
            <button
              key={transform}
              onClick={() => updateStyle("textTransform", transform)}
              onKeyDown={handleInputKeyDown}
              className={`flex-1 px-2 py-1 text-xs border rounded ${
                localStyles.textTransform === transform
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {transform.charAt(0).toUpperCase() + transform.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Spacing Controls
  const SpacingControls = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <SizeInput
          label="Padding Top"
          value={localStyles.paddingTop || "0"}
          onChange={(value) => updateStyle("paddingTop", value)}
        />
        <SizeInput
          label="Padding Right"
          value={localStyles.paddingRight || "0"}
          onChange={(value) => updateStyle("paddingRight", value)}
        />
        <SizeInput
          label="Padding Bottom"
          value={localStyles.paddingBottom || "0"}
          onChange={(value) => updateStyle("paddingBottom", value)}
        />
        <SizeInput
          label="Padding Left"
          value={localStyles.paddingLeft || "0"}
          onChange={(value) => updateStyle("paddingLeft", value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SizeInput
          label="Margin Top"
          value={localStyles.marginTop || "0"}
          onChange={(value) => updateStyle("marginTop", value)}
        />
        <SizeInput
          label="Margin Right"
          value={localStyles.marginRight || "0"}
          onChange={(value) => updateStyle("marginRight", value)}
        />
        <SizeInput
          label="Margin Bottom"
          value={localStyles.marginBottom || "0"}
          onChange={(value) => updateStyle("marginBottom", value)}
        />
        <SizeInput
          label="Margin Left"
          value={localStyles.marginLeft || "0"}
          onChange={(value) => updateStyle("marginLeft", value)}
        />
      </div>
    </div>
  );

  // Background Controls
  const BackgroundControls = () => (
    <div className="space-y-4">
      <ColorPicker
        label="Background Color"
        value={localStyles.backgroundColor || "#ffffff"}
        onChange={(value) => updateStyle("backgroundColor", value)}
      />
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Background Image
        </label>
        <input
          type="text"
          value={
            localStyles.backgroundImage?.replace("url(", "").replace(")", "") ||
            ""
          }
          onChange={(e) =>
            updateStyle("backgroundImage", `url(${e.target.value})`)
          }
          onKeyDown={handleInputKeyDown}
          className="w-full text-black px-2 py-1 border border-gray-300 rounded text-xs"
          placeholder="https://example.com/image.jpg"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Background Size
          </label>
          <select
            value={localStyles.backgroundSize || "cover"}
            onChange={(e) => updateStyle("backgroundSize", e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="w-full text-black px-2 py-1 border border-gray-300 rounded text-xs"
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="auto">Auto</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Background Position
          </label>
          <select
            value={localStyles.backgroundPosition || "center"}
            onChange={(e) => updateStyle("backgroundPosition", e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="w-full text-black px-2 py-1 border border-gray-300 rounded text-xs"
          >
            <option value="center">Center</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Border Controls
  const BorderControls = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <SizeInput
          label="Border Width"
          value={localStyles.borderWidth || "0"}
          onChange={(value) => updateStyle("borderWidth", value)}
        />
        <ColorPicker
          label="Border Color"
          value={localStyles.borderColor || "#000000"}
          onChange={(value) => updateStyle("borderColor", value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Border Style
          </label>
          <select
            value={localStyles.borderStyle || "solid"}
            onChange={(e) => updateStyle("borderStyle", e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="w-full text-black px-2 py-1 border border-gray-300 rounded text-xs"
          >
            <option value="none">None</option>
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="double">Double</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Border Radius
          </label>
          <div className="flex space-x-1">
            {[0, 2, 4, 6, 8, 12, 16, 24, 32].map((radius) => (
              <button
                key={radius}
                onClick={() => updateStyle("borderRadius", `${radius}px`)}
                onKeyDown={handleInputKeyDown}
                className={`flex-1 px-1 py-1 text-xs border rounded ${
                  localStyles.borderRadius === `${radius}px`
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {radius}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Content Tab for specific block types
  const renderContentTab = () => {
    switch (selectedBlock.type) {
      case "text":
        return (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Text Content
            </label>
            <textarea
              value={selectedBlock.content}
              onChange={(e) => updateContent(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="w-full text-black px-3 py-2 border border-gray-300 rounded text-sm"
              rows={6}
              placeholder="Enter your text content..."
            />
          </div>
        );

      case "button":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={selectedBlock.content}
                onChange={(e) => updateContent(e.target.value)}
                onKeyDown={handleInputKeyDown}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Button text"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Button Link
              </label>
              <input
                type="text"
                value={selectedBlock.link || ""}
                onChange={(e) => updateProperty("link", e.target.value)}
                onKeyDown={handleInputKeyDown}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="https://example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SizeInput
                label="Button Width"
                value={localStyles.width || "auto"}
                onChange={(value) => updateStyle("width", value)}
              />
              <SizeInput
                label="Button Height"
                value={localStyles.height || "auto"}
                onChange={(value) => updateStyle("height", value)}
              />
            </div>
          </div>
        );

      case "image":
        return (
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Image Preview */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Image Preview
              </label>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <img
                  src={selectedBlock.content}
                  alt={selectedBlock.altText || "Preview"}
                  className="max-w-full h-auto rounded-lg mx-auto"
                  style={localStyles}
                />
              </div>
            </div>

            {/* Upload Button */}
            <div>
              <button
                type="button"
                onClick={triggerImageUpload}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Upload Image from Computer
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Max file size: 5MB
              </p>
            </div>

            {/* Image URL Input */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={selectedBlock.content}
                onChange={(e) => updateContent(e.target.value)}
                onKeyDown={handleInputKeyDown}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter image URL or upload from computer
              </p>
            </div>

            {/* Alt Text Input */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                value={selectedBlock.altText || ""}
                onChange={(e) => updateProperty("altText", e.target.value)}
                onKeyDown={handleInputKeyDown}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Description of the image"
              />
            </div>

            {/* Image Size Controls */}
            <div className="grid grid-cols-2 gap-3">
              <SizeInput
                label="Width"
                value={localStyles.width || "100%"}
                onChange={(value) => updateStyle("width", value)}
              />
              <SizeInput
                label="Height"
                value={localStyles.height || "auto"}
                onChange={(value) => updateStyle("height", value)}
              />
            </div>

            {/* Image Alignment */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Alignment
              </label>
              <div className="flex space-x-2">
                {[
                  { value: "left", icon: "←" },
                  { value: "center", icon: "↔" },
                  { value: "right", icon: "→" },
                ].map((align) => (
                  <button
                    key={align.value}
                    onClick={() => updateStyle("textAlign", align.value)}
                    onKeyDown={handleInputKeyDown}
                    className={`flex-1 px-3 py-2 text-sm border rounded ${
                      localStyles.textAlign === align.value
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {align.icon} {align.value}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={selectedBlock.content}
              onChange={(e) => updateContent(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="w-full text-black px-3 py-2 border border-gray-300 rounded text-sm"
              rows={4}
              placeholder="Enter content..."
            />
          </div>
        );
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Inspector</h2>
        <p className="text-sm text-gray-600 capitalize">
          {selectedBlock.type} Block
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {[
            { id: "content" as StyleTab, label: "Content" },
            { id: "typography" as StyleTab, label: "Typography" },
            { id: "background" as StyleTab, label: "Background" },
            { id: "border" as StyleTab, label: "Border" },
            { id: "spacing" as StyleTab, label: "Spacing" },
            { id: "advanced" as StyleTab, label: "Advanced" },
            { id: "responsive" as StyleTab, label: "Responsive" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={handleInputKeyDown}
              className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="space-y-4">{renderContentTab()}</div>
        )}

        {/* Typography Tab */}
        {activeTab === "typography" && (
          <div className="space-y-4">
            <TypographyControls />
          </div>
        )}

        {/* Background Tab */}
        {activeTab === "background" && (
          <div className="space-y-4">
            <BackgroundControls />
          </div>
        )}

        {/* Border Tab */}
        {activeTab === "border" && (
          <div className="space-y-4">
            <BorderControls />
          </div>
        )}

        {/* Spacing Tab */}
        {activeTab === "spacing" && (
          <div className="space-y-4">
            <SpacingControls />
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === "advanced" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Custom CSS
              </label>
              <textarea
                value={localStyles.customCSS || ""}
                onChange={(e) => updateStyle("customCSS", e.target.value)}
                onKeyDown={handleInputKeyDown}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                rows={4}
                placeholder="Enter custom CSS..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                CSS Classes
              </label>
              <input
                type="text"
                value={localStyles.className || ""}
                onChange={(e) => updateStyle("className", e.target.value)}
                onKeyDown={handleInputKeyDown}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="custom-class another-class"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Animation
              </label>
              <select
                value={localStyles.animation || "none"}
                onChange={(e) => updateStyle("animation", e.target.value)}
                onKeyDown={handleInputKeyDown}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="none">No Animation</option>
                <option value="fade">Fade In</option>
                <option value="slide-up">Slide Up</option>
                <option value="slide-down">Slide Down</option>
                <option value="zoom">Zoom In</option>
              </select>
            </div>
          </div>
        )}

        {/* Responsive Tab */}
        {activeTab === "responsive" && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                Responsive controls allow you to adjust styles for different
                screen sizes.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">
                Mobile Styles
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <SizeInput
                  label="Font Size"
                  value={
                    selectedBlock.responsive?.mobile?.fontSize ||
                    localStyles.fontSize ||
                    "16px"
                  }
                  onChange={(value) => {
                    const responsive = {
                      ...selectedBlock.responsive,
                      mobile: {
                        ...selectedBlock.responsive?.mobile,
                        fontSize: value,
                      },
                    };
                    onUpdateBlock(selectedBlock.id, { responsive });
                  }}
                />
                <SizeInput
                  label="Padding"
                  value={
                    selectedBlock.responsive?.mobile?.padding ||
                    localStyles.padding ||
                    "0px"
                  }
                  onChange={(value) => {
                    const responsive = {
                      ...selectedBlock.responsive,
                      mobile: {
                        ...selectedBlock.responsive?.mobile,
                        padding: value,
                      },
                    };
                    onUpdateBlock(selectedBlock.id, { responsive });
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">
                Tablet Styles
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <SizeInput
                  label="Font Size"
                  value={
                    selectedBlock.responsive?.tablet?.fontSize ||
                    localStyles.fontSize ||
                    "16px"
                  }
                  onChange={(value) => {
                    const responsive = {
                      ...selectedBlock.responsive,
                      tablet: {
                        ...selectedBlock.responsive?.tablet,
                        fontSize: value,
                      },
                    };
                    onUpdateBlock(selectedBlock.id, { responsive });
                  }}
                />
                <SizeInput
                  label="Padding"
                  value={
                    selectedBlock.responsive?.tablet?.padding ||
                    localStyles.padding ||
                    "0px"
                  }
                  onChange={(value) => {
                    const responsive = {
                      ...selectedBlock.responsive,
                      tablet: {
                        ...selectedBlock.responsive?.tablet,
                        padding: value,
                      },
                    };
                    onUpdateBlock(selectedBlock.id, { responsive });
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex space-x-2">
          <button
            onClick={() => {
              const defaultStyles: Record<string, string> = {};
              onUpdateBlock(selectedBlock.id, { styles: defaultStyles });
            }}
            onKeyDown={handleInputKeyDown}
            className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Reset Styles
          </button>
          <button
            onClick={() => {
              const styles = { ...selectedBlock.styles };
              delete styles.customCSS;
              delete styles.className;
              onUpdateBlock(selectedBlock.id, { styles });
            }}
            onKeyDown={handleInputKeyDown}
            className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Clear Custom
          </button>
        </div>
      </div>
    </div>
  );
}

// Icon Component
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
