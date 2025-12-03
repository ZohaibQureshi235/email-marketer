"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
  DragOverEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import MainSidebar from "./MainSidebar";
import ElementorCanvas from "./ElementorCanvas";
import EmailPreview from "./EmailPreview";
import SendEmailModal from "./SendEmailModal";
import {
  EmailBlock,
  EmailBlockType,
  LayoutType,
} from "../../types/email-builder";
import Link from "next/link";
import { HomeIcon } from "@heroicons/react/24/outline";

export default function ElementorStyleBuilder() {
  const [blocks, setBlocks] = useState<EmailBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<EmailBlock | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [previewMode, setPreviewMode] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeItem, setActiveItem] = useState<{
    id: string;
    type: string;
    data?: any;
  } | null>(null);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  // Load from localStorage on component mount
  useEffect(() => {
    const savedBlocks = localStorage.getItem("email-builder-blocks");
    if (savedBlocks) {
      try {
        const parsedBlocks = JSON.parse(savedBlocks);
        setBlocks(parsedBlocks);
      } catch (error) {
        console.error("Error loading saved blocks:", error);
      }
    }
  }, []);

  // Save to localStorage whenever blocks change
  useEffect(() => {
    localStorage.setItem("email-builder-blocks", JSON.stringify(blocks));
  }, [blocks]);

  // Helper functions - define them first
  const getColumnCountForLayoutType = useCallback(
    (layoutType: LayoutType): number => {
      switch (layoutType) {
        case "one-column":
          return 1;
        case "two-column":
        case "two-column-aside":
        case "sidebar-right":
          return 2;
        case "three-column":
          return 3;
        case "four-column":
          return 4;
        default:
          return 1;
      }
    },
    []
  );

  const getColumnWidths = useCallback((layoutType?: LayoutType): string[] => {
    if (!layoutType) return ["100%"];

    switch (layoutType) {
      case "one-column":
        return ["100%"];
      case "two-column":
        return ["50%", "50%"];
      case "three-column":
        return ["33.33%", "33.33%", "33.33%"];
      case "four-column":
        return ["25%", "25%", "25%", "25%"];
      case "two-column-aside":
        return ["33.33%", "66.66%"];
      case "sidebar-right":
        return ["66.66%", "33.33%"];
      default:
        return ["100%"];
    }
  }, []);

  const createNewBlock = useCallback(
    (type: EmailBlockType): EmailBlock => {
      const baseId = `block-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const baseBlock: EmailBlock = {
        id: baseId,
        type,
        content: "",
        styles: {},
      };

      switch (type) {
        case "text":
          return {
            ...baseBlock,
            content: "This is a text block. Click to edit.",
            styles: {
              fontSize: "16px",
              color: "#000000",
              fontFamily: "Arial, sans-serif",
              lineHeight: "1.5",
              padding: "10px",
            },
          };
        case "button":
          return {
            ...baseBlock,
            content: "Click Me",
            styles: {
              backgroundColor: "#3B82F6",
              color: "#FFFFFF",
              padding: "12px 24px",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "bold",
              textDecoration: "none",
              display: "inline-block",
              textAlign: "center",
            },
            link: "#",
          };
        case "image":
          return {
            ...baseBlock,
            content:
              "https://via.placeholder.com/600x300/3B82F6/FFFFFF?text=Your+Image+Here",
            styles: {
              maxWidth: "100%",
              height: "auto",
              display: "block",
              margin: "0 auto",
            },
            altText: "Image description",
          };
        case "spacer":
          return {
            ...baseBlock,
            content: "",
            styles: {
              height: "20px",
              backgroundColor: "transparent",
            },
          };
        case "divider":
          return {
            ...baseBlock,
            styles: {
              height: "1px",
              backgroundColor: "#E5E7EB",
              margin: "20px 0",
              border: "none",
            },
          };
        case "social":
          return {
            ...baseBlock,
            content:
              '<div style="text-align: center;"><a href="#" style="margin: 0 10px;">FB</a><a href="#" style="margin: 0 10px;">TW</a><a href="#" style="margin: 0 10px;">IG</a></div>',
            styles: {
              padding: "20px 0",
              textAlign: "center",
            },
          };
        case "testimonial":
          return {
            ...baseBlock,
            content:
              '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #3B82F6;"><p style="font-style: italic;">"This is an amazing testimonial!"</p><p style="font-weight: bold; margin-top: 10px;">- Happy Customer</p></div>',
            styles: {
              padding: "20px",
            },
          };
        case "rating":
          return {
            ...baseBlock,
            content: "⭐⭐⭐⭐⭐",
            styles: {
              fontSize: "24px",
              color: "#FFD700",
              textAlign: "center",
              padding: "10px",
            },
          };
        case "header":
          return {
            ...baseBlock,
            content: "Welcome to our newsletter!",
            styles: {
              fontSize: "24px",
              fontWeight: "bold",
              color: "#1F2937",
              textAlign: "center",
              margin: "20px 0",
            },
          };
        case "footer":
          return {
            ...baseBlock,
            content: "© 2024 Your Company. All rights reserved.",
            styles: {
              fontSize: "12px",
              color: "#6B7280",
              textAlign: "center",
              margin: "20px 0",
            },
          };
        case "html":
          return {
            ...baseBlock,
            content: "<!-- Add your custom HTML here -->",
            styles: {
              padding: "10px",
              fontFamily: "monospace",
            },
          };
        case "table":
          return {
            ...baseBlock,
            content:
              '<table style="width: 100%; border-collapse: collapse; margin: 20px 0;"><tr><th style="border: 1px solid #ddd; padding: 12px; background: #f8f9fa; text-align: left;">Header 1</th><th style="border: 1px solid #ddd; padding: 12px; background: #f8f9fa; text-align: left;">Header 2</th></tr><tr><td style="border: 1px solid #ddd; padding: 12px;">Data 1</td><td style="border: 1px solid #ddd; padding: 12px;">Data 2</td></tr></table>',
            styles: {
              padding: "10px",
            },
          };
        case "layout":
          const columnCount = getColumnCountForLayoutType("one-column");
          return {
            ...baseBlock,
            content: "",
            styles: {
              padding: "20px 0",
              backgroundColor: "transparent",
            },
            layoutType: "one-column",
            columns: Array.from({ length: columnCount }, () => []),
          };
        case "video":
          return {
            ...baseBlock,
            content:
              '<div style="text-align: center; padding: 20px;"><div style="background: #f0f0f0; padding: 40px; border-radius: 8px;">🎥 Video Player Placeholder</div></div>',
            styles: {
              padding: "20px",
            },
          };
        case "countdown":
          return {
            ...baseBlock,
            content:
              '<div style="text-align: center; padding: 20px;"><div style="font-size: 24px; font-weight: bold; color: #3B82F6;">00:00:00</div><p style="color: #666;">Countdown Timer</p></div>',
            styles: {
              textAlign: "center",
              padding: "20px",
            },
          };
        case "map":
          return {
            ...baseBlock,
            content:
              '<div style="text-align: center; padding: 20px;"><div style="background: #f0f0f0; padding: 40px; border-radius: 8px;">🗺️ Map Placeholder</div></div>',
            styles: {
              padding: "20px",
            },
          };
        case "notification":
          return {
            ...baseBlock,
            content:
              '<div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px 16px; border-radius: 6px;"><p style="display:flex; gap:1rem; color:black; margin: 0; font-weight: 500;"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" /></svg> Important Notification</p></div>',
            styles: {
              padding: "20px",
            },
          };
        case "pricing":
          return {
            ...baseBlock,
            content:
              '<div style="text-align: center; padding: 20px;"><div style="background: #f8f9fa; padding: 20px; border-radius: 8px;"><h3 style="margin: 0 0 10px 0;">$29<span style="font-size: 14px; color: #666;">/month</span></h3><p style="color: #666;">Basic Plan</p></div></div>',
            styles: {
              textAlign: "center",
              padding: "20px",
            },
          };
        default:
          return baseBlock;
      }
    },
    [getColumnCountForLayoutType]
  );

  const convertBlockToHtml = useCallback((block: EmailBlock): string => {
    const styles = Object.entries(block.styles)
      .filter(([key]) => !key.startsWith("responsive"))
      .map(([key, value]) => `${key}: ${value};`)
      .join(" ");

    switch (block.type) {
      case "text":
      case "header":
      case "footer":
        return `<div class="mobile-padding" style="${styles}">${block.content}</div>`;
      case "button":
        return `
          <div class="mobile-center" style="text-align: ${
            block.styles.textAlign || "center"
          }; margin: 20px 0;">
            <a href="${block.link || "#"}" class="button" style="${styles}">
              ${block.content}
            </a>
          </div>
        `;
      case "image":
        return `
          <div class="mobile-center" style="text-align: ${
            block.styles.textAlign || "center"
          }; margin: 20px 0;">
            <img src="${block.content}" alt="${
          block.altText || "Image"
        }" style="${styles}" />
          </div>
        `;
      case "divider":
        return `<hr style="${styles}" />`;
      case "spacer":
        return `<div style="${styles}"></div>`;
      case "social":
        return `
          <div class="mobile-center" style="text-align: center; margin: 20px 0;">
            <div style="display: inline-block; ${styles}">
              ${block.content || "<!-- Social Icons -->"}
            </div>
          </div>
        `;
      case "html":
      case "table":
        return `<div style="${styles}">${block.content}</div>`;
      case "layout":
        return convertLayoutToHtml(block);
      case "testimonial":
      case "rating":
      case "countdown":
      case "map":
      case "notification":
      case "pricing":
      case "video":
        return `<div style="${styles}">${block.content}</div>`;
      default:
        return `<div style="${styles}">${block.content}</div>`;
    }
  }, []);

  const convertLayoutToHtml = useCallback(
    (block: EmailBlock): string => {
      if (!block.columns || block.columns.length === 0) return "";

      const columnWidths = getColumnWidths(block.layoutType);
      const isMobileStack =
        block.layoutType && block.layoutType !== "one-column";
      const tableClass = isMobileStack ? "mobile-stack" : "";

      let layoutHtml = `<table width="100%" cellpadding="0" cellspacing="0" class="layout-table ${tableClass}" style="${Object.entries(
        block.styles || {}
      )
        .map(([key, value]) => `${key}: ${value};`)
        .join("")} border="0"><tr>`;

      block.columns.forEach((columnBlocks, index) => {
        const width = columnWidths[index] || "100%";
        layoutHtml += `<td width="${width}" class="layout-column mobile-full" style="vertical-align: top; padding: 10px;">`;

        columnBlocks.forEach((columnBlock) => {
          layoutHtml += convertBlockToHtml(columnBlock);
        });

        layoutHtml += `</td>`;
      });

      layoutHtml += `</tr></table>`;
      return layoutHtml;
    },
    [getColumnWidths, convertBlockToHtml]
  );

  const convertBlocksToHtml = useCallback(
    (blocksToConvert: EmailBlock[]): string => {
      let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Email Template</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background: #f5f5f5; 
          }
          .email-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff; 
          }
          img { max-width: 100%; height: auto; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: bold; 
            text-align: center; 
          }
          /* Layout Styles */
          .layout-table {
            width: 100%;
            border-collapse: collapse;
          }
          .layout-column {
            vertical-align: top;
            padding: 10px;
          }
          /* Mobile Responsive */
          @media only screen and (max-width: 600px) {
            .mobile-stack { 
              display: block !important; 
              width: 100% !important; 
            }
            .layout-table.mobile-stack {
              display: block;
            }
            .layout-table.mobile-stack tr {
              display: block;
              width: 100% !important;
            }
            .layout-table.mobile-stack td {
              display: block;
              width: 100% !important;
            }
            .mobile-full {
              width: 100% !important;
            }
            .mobile-center {
              text-align: center !important;
            }
            .mobile-padding {
              padding: 10px !important;
            }
            .mobile-hide {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
    `;

      blocksToConvert.forEach((block) => {
        html += convertBlockToHtml(block);
      });

      html += `
        </div>
      </body>
      </html>
    `;

      return html;
    },
    [convertBlockToHtml]
  );

  // Generate email HTML - memoized to prevent infinite loops
  const emailHtml = useMemo(() => {
    return convertBlocksToHtml(blocks);
  }, [blocks, convertBlocksToHtml]);

  // Memoized functions to prevent infinite re-renders
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      setActiveId(active.id);

      // Check if it's from sidebar (new element)
      if (active.data.current?.fromSidebar) {
        setActiveItem({
          id: active.id as string,
          type: active.data.current.type,
          data: active.data.current,
        });
      } else {
        // It's an existing block
        const block = blocks.find((b) => b.id === active.id);
        if (block) {
          setActiveItem({
            id: block.id,
            type: block.type,
            data: block,
          });
        }
      }
    },
    [blocks]
  );

  const addBlockToLayout = useCallback(
    (layoutId: string, columnIndex: number, blockType: EmailBlockType) => {
      const newBlock = createNewBlock(blockType);
      console.log(
        "Adding block to layout:",
        layoutId,
        "column:",
        columnIndex,
        "block:",
        newBlock
      );

      setBlocks((prev) =>
        prev.map((layoutBlock) => {
          if (
            layoutBlock.id === layoutId &&
            layoutBlock.type === "layout" &&
            layoutBlock.columns
          ) {
            const updatedColumns = [...layoutBlock.columns];

            if (!updatedColumns[columnIndex]) {
              updatedColumns[columnIndex] = [];
            }

            updatedColumns[columnIndex] = [
              ...updatedColumns[columnIndex],
              newBlock,
            ];
            console.log("Updated columns:", updatedColumns);
            return { ...layoutBlock, columns: updatedColumns };
          }
          return layoutBlock;
        })
      );

      setSelectedBlock(newBlock);
    },
    [createNewBlock]
  );

  const addBlock = useCallback(
    (type: EmailBlockType) => {
      const newBlock = createNewBlock(type);
      setBlocks((prev) => [...prev, newBlock]);
      setSelectedBlock(newBlock);
    },
    [createNewBlock]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setActiveItem(null);

      if (!over) return;

      // Handle dropping new elements from sidebar
      if (active.data.current?.fromSidebar) {
        const blockType = active.data.current.type as EmailBlockType;

        // Check if dropped into a layout column
        if (
          over.data.current?.layoutId &&
          over.data.current?.columnIndex !== undefined
        ) {
          addBlockToLayout(
            over.data.current.layoutId,
            over.data.current.columnIndex,
            blockType
          );
        } else {
          // Dropped onto canvas
          addBlock(blockType);
        }
        return;
      }

      // Handle reordering existing blocks
      if (active.id !== over.id) {
        const oldIndex = blocks.findIndex((block) => block.id === active.id);
        const newIndex = blocks.findIndex((block) => block.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          setBlocks((items) => arrayMove(items, oldIndex, newIndex));
        }
      }
    },
    [blocks, addBlock, addBlockToLayout]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;

      // Handle moving blocks into layout columns
      if (
        over?.data.current?.layoutId &&
        over.data.current?.columnIndex !== undefined
      ) {
        if (active.data.current?.fromSidebar) return; // Already handled in dragEnd

        // Move existing block into layout column
        if (active.id !== over.id) {
          const blockType = active.data.current?.type as EmailBlockType;
          if (blockType) {
            // Remove from current position
            setBlocks((prev) => prev.filter((block) => block.id !== active.id));

            // Add to layout
            addBlockToLayout(
              over.data.current.layoutId,
              over.data.current.columnIndex,
              blockType
            );
          }
        }
      }
    },
    [addBlockToLayout]
  );

  // Other functions

  const addLayout = useCallback(
    (layoutType: string, insertIndex?: number) => {
      console.log("Adding layout:", layoutType, "at index:", insertIndex);

      const validLayoutTypes: LayoutType[] = [
        "one-column",
        "two-column",
        "three-column",
        "four-column",
        "two-column-aside",
        "sidebar-right",
      ];

      const validLayoutType = validLayoutTypes.includes(
        layoutType as LayoutType
      )
        ? (layoutType as LayoutType)
        : "one-column";

      const columnCount = getColumnCountForLayoutType(validLayoutType);

      const newBlock: EmailBlock = {
        id: `layout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "layout",
        content: "",
        styles: {
          padding: "20px 0",
          backgroundColor: "transparent",
        },
        layoutType: validLayoutType,
        columns: Array.from({ length: columnCount }, () => []),
      };

      console.log("New layout block created:", newBlock);

      setBlocks((prev) => {
        const newBlocks = [...prev];

        if (insertIndex !== undefined && insertIndex >= 0) {
          // Insert at specific position
          newBlocks.splice(insertIndex, 0, newBlock);
          console.log(
            "Inserted at position:",
            insertIndex,
            "Total blocks:",
            newBlocks.length
          );
        } else {
          // Add to the end
          newBlocks.push(newBlock);
          console.log("Appended to end. Total blocks:", newBlocks.length);
        }

        return newBlocks;
      });

      setSelectedBlock(newBlock);
    },
    [getColumnCountForLayoutType]
  );

  const updateBlock = useCallback(
    (id: string, updates: Partial<EmailBlock>) => {
      setBlocks((prev) => {
        const isTopLevelBlock = prev.some((block) => block.id === id);

        if (isTopLevelBlock) {
          return prev.map((block) => {
            return block.id === id ? { ...block, ...updates } : block;
          });
        } else {
          return prev.map((layoutBlock) => {
            if (layoutBlock.type === "layout" && layoutBlock.columns) {
              const updatedColumns = layoutBlock.columns.map((column) =>
                column.map((block) =>
                  block.id === id ? { ...block, ...updates } : block
                )
              );
              return { ...layoutBlock, columns: updatedColumns };
            }
            return layoutBlock;
          });
        }
      });

      if (selectedBlock?.id === id) {
        setSelectedBlock((prev) => (prev ? { ...prev, ...updates } : null));
      }
    },
    [selectedBlock]
  );

  const removeBlock = useCallback(
    (id: string) => {
      setBlocks((prev) => prev.filter((block) => block.id !== id));
      if (selectedBlock?.id === id) {
        setSelectedBlock(null);
      }
    },
    [selectedBlock]
  );

  const removeBlockFromLayout = useCallback(
    (layoutId: string, columnIndex: number, blockId: string) => {
      setBlocks((prev) =>
        prev.map((layoutBlock) => {
          if (
            layoutBlock.id === layoutId &&
            layoutBlock.type === "layout" &&
            layoutBlock.columns
          ) {
            const updatedColumns = [...layoutBlock.columns];

            if (updatedColumns[columnIndex]) {
              updatedColumns[columnIndex] = updatedColumns[columnIndex].filter(
                (block) => block.id !== blockId
              );
            }

            return { ...layoutBlock, columns: updatedColumns };
          }
          return layoutBlock;
        })
      );

      if (selectedBlock?.id === blockId) {
        setSelectedBlock(null);
      }
    },
    [selectedBlock]
  );

  const updateBlockInLayout = useCallback(
    (
      layoutId: string,
      columnIndex: number,
      blockId: string,
      updates: Partial<EmailBlock>
    ) => {
      setBlocks((prev) =>
        prev.map((layoutBlock) => {
          if (
            layoutBlock.id === layoutId &&
            layoutBlock.type === "layout" &&
            layoutBlock.columns
          ) {
            const updatedColumns = [...layoutBlock.columns];

            if (updatedColumns[columnIndex]) {
              updatedColumns[columnIndex] = updatedColumns[columnIndex].map(
                (block) =>
                  block.id === blockId ? { ...block, ...updates } : block
              );
            }

            return { ...layoutBlock, columns: updatedColumns };
          }
          return layoutBlock;
        })
      );

      if (selectedBlock?.id === blockId) {
        setSelectedBlock((prev) => (prev ? { ...prev, ...updates } : null));
      }
    },
    [selectedBlock]
  );

  const selectBlockInLayout = useCallback((block: EmailBlock) => {
    setSelectedBlock(block);
  }, []);

  const saveTemplate = useCallback(() => {
    const template = {
      id: `template-${Date.now()}`,
      name: `Template ${new Date().toLocaleDateString()}`,
      html: emailHtml,
      blocks: JSON.parse(JSON.stringify(blocks)),
      createdAt: new Date().toISOString(),
    };

    const savedTemplates = JSON.parse(
      localStorage.getItem("email-templates") || "[]"
    );
    savedTemplates.push(template);
    localStorage.setItem("email-templates", JSON.stringify(savedTemplates));

    alert("Template saved successfully!");
  }, [emailHtml, blocks]);

  const exportHTML = useCallback(() => {
    const blob = new Blob([emailHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "email-template.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [emailHtml]);

  const clearCanvas = useCallback(() => {
    if (
      confirm(
        "Are you sure you want to clear the canvas? This action cannot be undone."
      )
    ) {
      setBlocks([]);
      setSelectedBlock(null);
    }
  }, []);

  const getCanvasWidth = useCallback(() => {
    switch (previewMode) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      default:
        return "100%";
    }
  }, [previewMode]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="flex h-screen bg-gray-50">
        {/* Main Sidebar that toggles between Element Library and Inspector */}
        <MainSidebar
          selectedBlock={selectedBlock}
          onUpdateBlock={updateBlock}
          onAddBlock={addBlock}
          onAddLayout={addLayout}
        />

        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div className="flex items-center space-x-6">
              {/* Home Button */}
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors group"
              >
                <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <HomeIcon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium hidden md:inline">
                  Home
                </span>
              </Link>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
                Email Builder
              </h1>
              
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {(["desktop", "tablet", "mobile"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPreviewMode(mode)}
                    className={`px-4 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap flex items-center ${
                      previewMode === mode
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {mode === "desktop" && "💻"}
                    {mode === "tablet" && "📱"}
                    {mode === "mobile" && "📲"}
                    <span className="ml-2 capitalize">{mode}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={clearCanvas}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors whitespace-nowrap"
              >
                Clear
              </button>
              <button
                onClick={exportHTML}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                Export HTML
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Preview
              </button>
              <button
                onClick={() => setShowSendModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
              >
                Send Email
              </button>
              <button
                onClick={saveTemplate}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                Save Template
              </button>
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 overflow-auto bg-gray-100 flex justify-center">
            <div
              className="h-full transition-all duration-200"
              style={{
                width: getCanvasWidth(),
                maxWidth: previewMode === "desktop" ? "100%" : getCanvasWidth(),
              }}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <ElementorCanvas
                  blocks={blocks}
                  selectedBlock={selectedBlock}
                  onSelectBlock={setSelectedBlock}
                  onUpdateBlock={updateBlock}
                  onRemoveBlock={removeBlock}
                  onAddBlockToLayout={addBlockToLayout}
                  onRemoveBlockFromLayout={removeBlockFromLayout}
                  onUpdateBlockInLayout={updateBlockInLayout}
                  onSelectBlockInLayout={selectBlockInLayout}
                  onAddLayout={addLayout}
                  previewMode={previewMode}
                />
              </SortableContext>
            </div>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeItem && (
            <div className="p-4 bg-white border border-gray-300 rounded-lg shadow-xl opacity-90">
              <div className="text-sm font-medium text-gray-700">
                {activeItem.type}
              </div>
            </div>
          )}
        </DragOverlay>

        {showPreview && (
          <EmailPreview
            html={emailHtml}
            onClose={() => setShowPreview(false)}
          />
        )}

        {showSendModal && (
          <SendEmailModal
            emailHtml={emailHtml}
            onClose={() => setShowSendModal(false)}
          />
        )}
      </div>
    </DndContext>
  );
}