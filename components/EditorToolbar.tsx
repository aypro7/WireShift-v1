'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MousePointer,
  Hand,
  Undo2,
  Redo2,
  Plus,
  Trash2,
  Copy,
  Layers,
  ArrowUp,
  ArrowDown,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Download,
  Columns,
  Layers as OverlayIcon,
  Eye,
  Sliders,
  Type,
  Heading,
  Square,
  Circle,
  Image as ImageIcon,
  Minus,
  Palette,
  SplitSquareVertical,
  Check,
} from 'lucide-react';
import { ElementType, WireframeTheme } from '@/lib/wireframe-types';

export type ViewMode = 'split' | 'curtain' | 'overlay' | 'wireframe' | 'screenshot';

interface EditorToolbarProps {
  toolMode: 'select' | 'pan';
  onToolModeChange: (mode: 'select' | 'pan') => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onAddElement: (type: ElementType) => void;
  hasSelection: boolean;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitCanvas: () => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  overlayOpacity: number;
  onOverlayOpacityChange: (opacity: number) => void;
  theme: WireframeTheme;
  onThemeChange: (theme: WireframeTheme) => void;
  onOpenExport: () => void;
  hasScreenshot: boolean;
}

export default function EditorToolbar({
  toolMode,
  onToolModeChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onAddElement,
  hasSelection,
  onDeleteSelected,
  onDuplicateSelected,
  onBringForward,
  onSendBackward,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitCanvas,
  snapToGrid,
  onToggleSnap,
  showGrid,
  onToggleGrid,
  viewMode,
  onViewModeChange,
  overlayOpacity,
  onOverlayOpacityChange,
  theme,
  onThemeChange,
  onOpenExport,
  hasScreenshot,
}: EditorToolbarProps) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [layersMenuOpen, setLayersMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  const addMenuRef = useRef<HTMLDivElement>(null);
  const layersMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false);
      }
      if (layersMenuRef.current && !layersMenuRef.current.contains(e.target as Node)) {
        setLayersMenuOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const elementOptions: { type: ElementType; label: string; desc: string; icon: React.ReactNode }[] = [
    { type: 'heading', label: 'Heading skeleton', desc: 'Thick bold title bar', icon: <Heading className="w-4 h-4 text-blue-400" /> },
    { type: 'text', label: 'Text paragraph', desc: 'Thin multi-line text', icon: <Type className="w-4 h-4 text-slate-400" /> },
    { type: 'button', label: 'Action Button', desc: 'Rounded CTA box', icon: <Square className="w-4 h-4 text-emerald-400" /> },
    { type: 'input', label: 'Input field', desc: 'Outlined field with bar', icon: <Square className="w-4 h-4 text-amber-400" /> },
    { type: 'image', label: 'Image cross box', desc: 'Light box with X', icon: <ImageIcon className="w-4 h-4 text-purple-400" /> },
    { type: 'avatar', label: 'Avatar circle', desc: 'Profile circle silhouette', icon: <Circle className="w-4 h-4 text-cyan-400" /> },
    { type: 'card', label: 'Card container', desc: 'Outlined container', icon: <Square className="w-4 h-4 text-indigo-400" /> },
    { type: 'badge', label: 'Badge / Pill', desc: 'Small tag pill', icon: <Square className="w-4 h-4 text-pink-400" /> },
    { type: 'divider', label: 'Divider line', desc: 'Hairline separator', icon: <Minus className="w-4 h-4 text-slate-400" /> },
  ];

  return (
    <header className="h-13 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between gap-2 z-20 shrink-0 text-slate-200">
      {/* Left section: Pointer/Pan, Undo/Redo, Add Shape */}
      <div className="flex items-center gap-1.5">
        {/* Tool modes: Select vs Pan */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => onToolModeChange('select')}
            title="Select tool (V)"
            className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
              toolMode === 'select'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onToolModeChange('pan')}
            title="Pan canvas (H or Space+drag)"
            className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
              toolMode === 'pan'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Undo / Redo */}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-25 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-25 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Add Element Dropdown */}
        <div className="relative" ref={addMenuRef}>
          <button
            type="button"
            onClick={() => setAddMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700/80 rounded-md border border-slate-700 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Add Shape</span>
          </button>

          {addMenuOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-56 bg-slate-900 rounded-xl shadow-2xl border border-slate-700/90 py-2 z-50 animate-fadeIn">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Insert Wireframe Element
              </div>
              <div className="divide-y divide-slate-800/80">
                {elementOptions.map((opt) => (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => {
                      onAddElement(opt.type);
                      setAddMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
                  >
                    <div className="p-1 rounded bg-slate-950 border border-slate-800">
                      {opt.icon}
                    </div>
                    <div>
                      <div className="font-medium text-white">{opt.label}</div>
                      <div className="text-[10px] text-slate-400">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected actions */}
        {hasSelection && (
          <div className="flex items-center gap-1 ml-1 animate-fadeIn">
            <div className="h-4 w-px bg-slate-800 mx-1" />
            <button
              type="button"
              onClick={onDuplicateSelected}
              title="Duplicate (Ctrl+D)"
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Layer menu */}
            <div className="relative" ref={layersMenuRef}>
              <button
                type="button"
                onClick={() => setLayersMenuOpen((prev) => !prev)}
                title="Arrange Layers"
                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>

              {layersMenuOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-40 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 py-1.5 z-50">
                  <button
                    type="button"
                    onClick={() => {
                      onBringForward();
                      setLayersMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-blue-400" />
                    <span>Bring forward</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSendBackward();
                      setLayersMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
                    <span>Send backward</span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onDeleteSelected}
              title="Delete element (Del / Backspace)"
              className="p-1.5 rounded-md text-red-400 hover:bg-red-950/60 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Center section: View Mode Switcher */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => onViewModeChange('split')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'split'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Side-by-side comparison"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split</span>
          </button>

          {hasScreenshot && (
            <button
              type="button"
              onClick={() => onViewModeChange('curtain')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'curtain'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Curtain Wipe before/after slider"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Curtain</span>
            </button>
          )}

          {hasScreenshot && (
            <button
              type="button"
              onClick={() => onViewModeChange('overlay')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'overlay'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Overlay wireframe onto screenshot"
            >
              <OverlayIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Overlay</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onViewModeChange('wireframe')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'wireframe'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Wireframe only"
          >
            <Square className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wireframe</span>
          </button>

          {hasScreenshot && (
            <button
              type="button"
              onClick={() => onViewModeChange('screenshot')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'screenshot'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Screenshot only"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Source</span>
            </button>
          )}
        </div>

        {/* Overlay opacity slider if in overlay mode */}
        {viewMode === 'overlay' && (
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2 py-1 rounded-md text-xs text-slate-300">
            <Sliders className="w-3 h-3 text-slate-500" />
            <span className="text-[11px] font-medium text-slate-400">Opacity:</span>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={overlayOpacity}
              onChange={(e) => onOverlayOpacityChange(parseFloat(e.target.value))}
              className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] font-mono text-slate-400 w-6">
              {Math.round(overlayOpacity * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Right section: Theme selector, Grid & Snap, Zoom & Export */}
      <div className="flex items-center gap-2">
        {/* Wireframe theme palette */}
        <div className="relative" ref={themeMenuRef}>
          <button
            type="button"
            onClick={() => setThemeMenuOpen((prev) => !prev)}
            title="Wireframe Theme Style"
            className="flex items-center gap-1.5 px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md text-xs text-slate-300 transition-colors"
          >
            <Palette className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline capitalize">{theme}</span>
          </button>

          {themeMenuOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-44 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Wireframe Theme
              </div>
              <button
                type="button"
                onClick={() => {
                  onThemeChange('standard');
                  setThemeMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 text-slate-200"
              >
                <span>Classic Neutral</span>
                {theme === 'standard' && <Check className="w-3.5 h-3.5 text-blue-400" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  onThemeChange('blueprint');
                  setThemeMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 text-slate-200"
              >
                <span>Architect Blueprint</span>
                {theme === 'blueprint' && <Check className="w-3.5 h-3.5 text-blue-400" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  onThemeChange('sketch');
                  setThemeMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 text-slate-200"
              >
                <span>Charcoal Notebook</span>
                {theme === 'sketch' && <Check className="w-3.5 h-3.5 text-blue-400" />}
              </button>
            </div>
          )}
        </div>

        {/* Grid toggle */}
        <button
          type="button"
          onClick={onToggleGrid}
          title="Toggle Canvas Grid"
          className={`p-1.5 rounded-md transition-colors ${
            showGrid ? 'bg-slate-800 text-blue-400 border border-slate-700' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        {/* Snap toggle */}
        <button
          type="button"
          onClick={onToggleSnap}
          title={snapToGrid ? 'Snap to 8px grid (Active)' : 'Snap to 8px grid (Inactive)'}
          className={`px-2 py-1 text-[11px] font-medium rounded-md border transition-colors ${
            snapToGrid
              ? 'bg-blue-950/80 border-blue-600 text-blue-400'
              : 'border-slate-800 text-slate-400 hover:bg-slate-800'
          }`}
        >
          Snap 8px
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Zoom controls */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-950 px-1 py-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={onZoomOut}
            title="Zoom out"
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onResetZoom}
            title="Reset zoom to 100%"
            className="px-1 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={onZoomIn}
            title="Zoom in"
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onFitCanvas}
            title="Fit canvas to view"
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Primary Export Button */}
        <button
          type="button"
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-md text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
}
