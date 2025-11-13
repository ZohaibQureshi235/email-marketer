"use client";

import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import BuilderSidebar from "./BuilderSidebar";
import BuilderCanvas from "./BuilderCanvas";
import InspectorPanel from "./InspectorPanel";
import EmailPreview from "./EmailPreview";
import SendEmailModal from "./SendEmailModal";
import Link from "next/link";

export interface EmailBlock {
  id: string;
  type:
    | "text"
    | "image"
    | "button"
    | "divider"
    | "header"
    | "footer"
    | "table"
    | "layout";
  content: string;
  styles: Record<string, string>;
  layoutType?: "one-column" | "two-column" | "two-column-aside" | "table";
  columns?: EmailBlock[][];
  link?: string;
  altText?: string;
}

export interface EmailContact {
  id: string;
  email: string;
  name: string;
}

export default function EmailBuilder() {
  const [blocks, setBlocks] = useState<EmailBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<EmailBlock | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [emailHtml, setEmailHtml] = useState("");

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
    generateEmailHtml();
  }, [blocks]);

  const generateEmailHtml = () => {
    const html = convertBlocksToHtml(blocks);
    setEmailHtml(html);
    return html;
  };

  const convertBlocksToHtml = (blocksToConvert: EmailBlock[]): string => {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Email Template</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f5f5f5; }
          .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          img { max-width: 100%; height: auto; }
          .button { display: inline-block; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; text-align: center; }
          .layout { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 10px 0; }
          .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .two-column-aside { display: grid; grid-template-columns: 1fr 2fr; gap: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f8f9fa; }
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
  };

  const convertBlockToHtml = (block: EmailBlock): string => {
    const styles = Object.entries(block.styles)
      .map(([key, value]) => `${key}: ${value};`)
      .join(" ");

    switch (block.type) {
      case "text":
        return `<div style="${styles}">${block.content}</div>`;

      case "header":
        return `<h1 style="${styles}">${block.content}</h1>`;

      case "footer":
        return `<div style="${styles}">${block.content}</div>`;

      case "button":
        const buttonStyles =
          styles +
          " display: inline-block; padding: 12px 24px; text-decoration: none; border-radius: 6px;";
        return `
          <div style="text-align: ${
            block.styles.textAlign || "center"
          }; margin: 20px 0;">
            <a href="${
              block.link || "#"
            }" class="button" style="${buttonStyles}">
              ${block.content}
            </a>
          </div>
        `;

      case "image":
        return `
          <div style="text-align: ${
            block.styles.textAlign || "center"
          }; margin: 20px 0;">
            <img src="${block.content}" alt="${
          block.altText || "Image"
        }" style="${styles}" />
            ${
              block.altText
                ? `<p style="font-size: 12px; color: #666; margin-top: 8px; text-align: center;">${block.altText}</p>`
                : ""
            }
          </div>
        `;

      case "divider":
        return `<hr style="${styles}" />`;

      case "table":
        return block.content;

      case "layout":
        let layoutClass = "";
        switch (block.layoutType) {
          case "two-column":
            layoutClass = "two-column";
            break;
          case "two-column-aside":
            layoutClass = "two-column-aside";
            break;
          default:
            layoutClass = "";
        }

        let layoutHtml = `<div class="layout ${layoutClass}" style="${styles}">`;

        if (block.columns) {
          block.columns.forEach((columnBlocks) => {
            layoutHtml += '<div class="layout-column">';
            columnBlocks.forEach((columnBlock) => {
              layoutHtml += convertBlockToHtml(columnBlock);
            });
            layoutHtml += "</div>";
          });
        }

        layoutHtml += "</div>";
        return layoutHtml;

      default:
        return `<div style="${styles}">${block.content}</div>`;
    }
  };

  // Fix: Proper block creation without duplication
  const createNewBlock = (type: EmailBlock["type"]): EmailBlock => {
    const baseBlock: EmailBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
      case "image":
        return {
          ...baseBlock,
          content:
            "https://via.placeholder.com/600x300/3B82F6/FFFFFF?text=Your+Image+Here",
          styles: {
            maxWidth: "100%",
            height: "auto",
            borderRadius: "8px",
            display: "block",
            margin: "0 auto",
          },
          altText: "Image description",
        };
      case "table":
        return {
          ...baseBlock,
          content:
            '<table style="width: 100%; border-collapse: collapse; margin: 20px 0;"><tr><th style="border: 1px solid #ddd; padding: 12px; background: #f8f9fa; text-align: left;">Header 1</th><th style="border: 1px solid #ddd; padding: 12px; background: #f8f9fa; text-align: left;">Header 2</th></tr><tr><td style="border: 1px solid #ddd; padding: 12px;">Data 1</td><td style="border: 1px solid #ddd; padding: 12px;">Data 2</td></tr></table>',
        };
      default:
        return baseBlock;
    }
  };

  const addBlock = (type: EmailBlock["type"]) => {
    const newBlock = createNewBlock(type);
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlock(newBlock);
  };

  const addLayout = (layoutType: string) => {
    const newBlock: EmailBlock = {
      id: `layout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "layout",
      content: "",
      styles: {
        padding: "20px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        margin: "10px 0",
      },
      layoutType: layoutType as any,
      columns:
        layoutType === "two-column" || layoutType === "two-column-aside"
          ? [[], []]
          : [[]],
    };

    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlock(newBlock);
  };

  // FIXED: Update block function that handles both top-level and nested blocks
  const updateBlock = (id: string, updates: Partial<EmailBlock>) => {
    setBlocks((prev) => {
      // First, check if it's a top-level block
      const isTopLevelBlock = prev.some(block => block.id === id);
      
      if (isTopLevelBlock) {
        // Update top-level block
        return prev.map((block) => {
          return block.id === id ? { ...block, ...updates } : block;
        });
      } else {
        // It's a nested block inside a layout - find and update it
        return prev.map((layoutBlock) => {
          if (layoutBlock.type === 'layout' && layoutBlock.columns) {
            const updatedColumns = layoutBlock.columns.map(column => 
              column.map(block => 
                block.id === id ? { ...block, ...updates } : block
              )
            );
            return { ...layoutBlock, columns: updatedColumns };
          }
          return layoutBlock;
        });
      }
    });

    // Update selected block if it's the one being edited
    if (selectedBlock?.id === id) {
      setSelectedBlock((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
    if (selectedBlock?.id === id) {
      setSelectedBlock(null);
    }
  };

  // FIXED: Properly add block to layout with column validation
  const addBlockToLayout = (
    layoutId: string,
    columnIndex: number,
    blockType: string
  ) => {
    const newBlock = createNewBlock(blockType as EmailBlock["type"]);

    setBlocks((prev) =>
      prev.map((layoutBlock) => {
        if (layoutBlock.id === layoutId && layoutBlock.type === 'layout' && layoutBlock.columns) {
          const updatedColumns = [...layoutBlock.columns];
          
          // Ensure the column exists at the specified index
          if (!updatedColumns[columnIndex]) {
            updatedColumns[columnIndex] = [];
          }
          
          updatedColumns[columnIndex] = [
            ...updatedColumns[columnIndex],
            newBlock,
          ];
          return { ...layoutBlock, columns: updatedColumns };
        }
        return layoutBlock;
      })
    );

    setSelectedBlock(newBlock);
  };

  // FIXED: Properly remove block from layout
  const removeBlockFromLayout = (
    layoutId: string,
    columnIndex: number,
    blockId: string
  ) => {
    setBlocks((prev) =>
      prev.map((layoutBlock) => {
        if (layoutBlock.id === layoutId && layoutBlock.type === 'layout' && layoutBlock.columns) {
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
  };

  // FIXED: Properly update block in layout with ID matching
  const updateBlockInLayout = (
    layoutId: string,
    columnIndex: number,
    blockId: string,
    updates: Partial<EmailBlock>
  ) => {
    setBlocks((prev) =>
      prev.map((layoutBlock) => {
        // Only process layout blocks that match the layoutId
        if (layoutBlock.id === layoutId && layoutBlock.type === 'layout' && layoutBlock.columns) {
          const updatedColumns = [...layoutBlock.columns];
          
          // Make sure we have the column at the specified index
          if (updatedColumns[columnIndex]) {
            updatedColumns[columnIndex] = updatedColumns[columnIndex].map((block) =>
              block.id === blockId ? { ...block, ...updates } : block
            );
          }
          
          return { ...layoutBlock, columns: updatedColumns };
        }
        return layoutBlock;
      })
    );

    // Update selected block if it's the one being edited
    if (selectedBlock?.id === blockId) {
      setSelectedBlock((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const selectBlockInLayout = (block: EmailBlock) => {
    setSelectedBlock(block);
  };

  // Fix: Handle drop from sidebar to canvas
  const handleDropFromSidebar = (item: { type: string; id: string }) => {
    if (item.id.startsWith("new-")) {
      const blockType = item.id.replace("new-", "") as EmailBlock["type"];
      addBlock(blockType);
    }
  };

  const saveTemplate = () => {
    const html = generateEmailHtml();
    const template = {
      id: `template-${Date.now()}`,
      name: `Template ${new Date().toLocaleDateString()}`,
      html,
      blocks: JSON.parse(JSON.stringify(blocks)),
      createdAt: new Date().toISOString(),
    };

    const savedTemplates = JSON.parse(
      localStorage.getItem("email-templates") || "[]"
    );
    savedTemplates.push(template);
    localStorage.setItem("email-templates", JSON.stringify(savedTemplates));

    alert("Template saved successfully!");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-gray-50">
        <BuilderSidebar onAddBlock={addBlock} onAddLayout={addLayout} />

        <div className="flex-1 overflow-auto">
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPreview(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Preview Email
                </button>
                <button
                  onClick={saveTemplate}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Template
                </button>
                <button
                  onClick={() => setShowSendModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Send Email
                </button>
              </div>
            </div>
          </div>

          <BuilderCanvas
            blocks={blocks}
            selectedBlock={selectedBlock}
            onSelectBlock={setSelectedBlock}
            onUpdateBlock={updateBlock}
            onRemoveBlock={removeBlock}
            onAddBlockToLayout={addBlockToLayout}
            onRemoveBlockFromLayout={removeBlockFromLayout}
            onUpdateBlockInLayout={updateBlockInLayout}
            onSelectBlockInLayout={selectBlockInLayout}
            onDropFromSidebar={handleDropFromSidebar}
          />
        </div>

        <InspectorPanel
          selectedBlock={selectedBlock}
          onUpdateBlock={updateBlock}
        />

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
    </DndProvider>
  );
}