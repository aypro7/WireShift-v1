export type ElementType =
  | 'heading'
  | 'text'
  | 'button'
  | 'input'
  | 'image'
  | 'avatar'
  | 'card'
  | 'icon'
  | 'navbar'
  | 'badge'
  | 'divider'
  | 'container';

export interface WireframeElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  lines?: number;      // For text/heading skeleton lines
  radius?: number;     // Corner radius
  fill?: string;       // Hex neutral color, e.g. '#FFFFFF', '#F3F4F6'
  stroke?: string;     // Hex neutral color, e.g. '#D1D5DB', '#9CA3AF'
  strokeWidth?: number;
  zIndex: number;
  hidden?: boolean;
  locked?: boolean;
  opacity?: number;
}

export type WireframeTheme = 'standard' | 'blueprint' | 'sketch';

export interface WireframeDocument {
  version: string;
  canvasWidth: number;
  canvasHeight: number;
  elements: WireframeElement[];
  sourceImageName?: string;
  generatedAt: string;
  theme?: WireframeTheme;
}

export interface WireframeApiResponse {
  success: boolean;
  wireframe?: WireframeDocument;
  error?: string;
}
