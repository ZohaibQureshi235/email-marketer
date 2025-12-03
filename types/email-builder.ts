export type EmailBlockType =
  | "text"
  | "image"
  | "button"
  | "divider"
  | "header"
  | "footer"
  | "table"
  | "layout"
  | "spacer"
  | "social"
  | "html"
  | "video"
  | "testimonial"
  | "rating"
  | "countdown"
  | "map"
  | "notification"
  | "pricing";

export interface EmailBlock {
  id: string;
  type: EmailBlockType;
  content: string;
  styles: Record<string, string>;
  link?: string;
  altText?: string;
  layoutType?:
    | "one-column"
    | "two-column"
    | "three-column"
    | "two-column-aside"
    | "four-column"
    | "sidebar-right";
  columns?: EmailBlock[][];
  responsive?: {
    mobile?: Record<string, string>;
    tablet?: Record<string, string>;
    desktop?: Record<string, string>;
  };
}

export interface EmailTemplate {
  id: string;
  name: string;
  html: string;
  blocks: EmailBlock[];
  createdAt: string;
}

export type LayoutType =
  | "one-column"
  | "two-column"
  | "three-column"
  | "four-column"
  | "two-column-aside"
  | "sidebar-right";

export interface EmailBlock {
  id: string;
  type: EmailBlockType;
  content: string;
  styles: Record<string, string>;
  layoutType?: LayoutType;
  columns?: EmailBlock[][];
  link?: string;
  altText?: string;
  responsive?: {
    mobile?: Record<string, string>;
    tablet?: Record<string, string>;
    desktop?: Record<string, string>;
  };
}
