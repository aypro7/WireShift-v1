'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  WireframeDocument,
  WireframeElement,
  ElementType,
  WireframeTheme,
} from '@/lib/wireframe-types';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';

interface WireframeCanvasProps {
  document: WireframeDocument;
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  onUpdateElement: (element: WireframeElement) => void;
  onDeleteElement?: (id: string) => void;
  zoom: number;
  onZoomChange?: (newZoom: number) => void;
  pan: { x: number; y: number };
  onPanChange: (pan: { x: number; y: number }) => void;
  snapToGrid?: boolean;
  toolMode: 'select' | 'pan';
  overlayImage?: string | null;
  overlayOpacity?: number; // 0 to 1
  showGrid?: boolean;
  curtainMode?: boolean; // Split curtain before/after slider
  curtainPosition?: number; // 0 to 100 percentage
  onCurtainPositionChange?: (pos: number) => void;
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export default function WireframeCanvas({
  document: doc,
  selectedId,
  onSelectId,
  onUpdateElement,
  onDeleteElement,
  zoom,
  onZoomChange,
  pan,
  onPanChange,
  snapToGrid = false,
  toolMode,
  overlayImage,
  overlayOpacity = 0.5,
  showGrid = false,
  curtainMode = false,
  curtainPosition = 50,
  onCurtainPositionChange,
}: WireframeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isSpacePressedRef = useRef(false);

  // Dragging state
  const [dragState, setDragState] = useState<{
    type: 'move' | 'resize' | 'pan' | 'curtain';
    handle?: ResizeHandle;
    startX: number;
    startY: number;
    initialElem?: WireframeElement;
    initialPan?: { x: number; y: number };
  } | null>(null);

  const selectedElement = doc.elements.find((el) => el.id === selectedId) || null;
  const theme: WireframeTheme = doc.theme || 'standard';

  // Spacebar tracking for smooth panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        isSpacePressedRef.current = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePressedRef.current = false;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Wheel zoom handler
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (onZoomChange) {
          const delta = e.deltaY < 0 ? 0.08 : -0.08;
          const nextZoom = Math.min(2.5, Math.max(0.2, +(zoom + delta).toFixed(2)));
          onZoomChange(nextZoom);
        }
      } else {
        // Two-finger trackpad pan
        onPanChange({
          x: pan.x - e.deltaX * 0.8,
          y: pan.y - e.deltaY * 0.8,
        });
      }
    },
    [zoom, pan, onZoomChange, onPanChange]
  );

  // Snapping helper
  const snap = useCallback(
    (val: number) => {
      if (!snapToGrid) return Math.round(val);
      const GRID = 8;
      return Math.round(val / GRID) * GRID;
    },
    [snapToGrid]
  );

  // Pointer Down on an element
  const handlePointerDownElement = (e: React.PointerEvent, el: WireframeElement) => {
    if (toolMode === 'pan' || isSpacePressedRef.current) return;
    if (el.locked) return;
    e.stopPropagation();
    onSelectId(el.id);

    setDragState({
      type: 'move',
      startX: e.clientX,
      startY: e.clientY,
      initialElem: { ...el },
    });
  };

  // Pointer Down on resize handle
  const handlePointerDownHandle = (e: React.PointerEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    if (!selectedElement || selectedElement.locked) return;

    setDragState({
      type: 'resize',
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialElem: { ...selectedElement },
    });
  };

  // Pointer Down on canvas backdrop
  const handlePointerDownCanvas = (e: React.PointerEvent) => {
    if (e.button === 1 || toolMode === 'pan' || isSpacePressedRef.current) {
      setDragState({
        type: 'pan',
        startX: e.clientX,
        startY: e.clientY,
        initialPan: { ...pan },
      });
      return;
    }

    if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'svg') {
      onSelectId(null);
    }
  };

  // Dragging loop
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragState) return;

      if (dragState.type === 'curtain' && onCurtainPositionChange) {
        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          const percent = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
          onCurtainPositionChange(Math.round(percent));
        }
        return;
      }

      if (dragState.type === 'pan') {
        const dx = e.clientX - dragState.startX;
        const dy = e.clientY - dragState.startY;
        if (dragState.initialPan) {
          onPanChange({
            x: dragState.initialPan.x + dx,
            y: dragState.initialPan.y + dy,
          });
        }
        return;
      }

      if (dragState.type === 'move' && dragState.initialElem) {
        const dx = (e.clientX - dragState.startX) / zoom;
        const dy = (e.clientY - dragState.startY) / zoom;

        const newX = snap(Math.max(0, dragState.initialElem.x + dx));
        const newY = snap(Math.max(0, dragState.initialElem.y + dy));

        onUpdateElement({
          ...dragState.initialElem,
          x: newX,
          y: newY,
        });
        return;
      }

      if (dragState.type === 'resize' && dragState.initialElem && dragState.handle) {
        const dx = (e.clientX - dragState.startX) / zoom;
        const dy = (e.clientY - dragState.startY) / zoom;
        const init = dragState.initialElem;
        const handle = dragState.handle;

        let { x, y, width, height } = init;
        const MIN_SIZE = 8;

        if (handle.includes('e')) {
          width = Math.max(MIN_SIZE, snap(init.width + dx));
        }
        if (handle.includes('s')) {
          height = Math.max(MIN_SIZE, snap(init.height + dy));
        }
        if (handle.includes('w')) {
          const desiredW = init.width - dx;
          if (desiredW >= MIN_SIZE) {
            width = snap(desiredW);
            x = snap(init.x + (init.width - width));
          }
        }
        if (handle.includes('n')) {
          const desiredH = init.height - dy;
          if (desiredH >= MIN_SIZE) {
            height = snap(desiredH);
            y = snap(init.y + (init.height - height));
          }
        }

        onUpdateElement({
          ...init,
          x,
          y,
          width,
          height,
        });
      }
    };

    const handlePointerUp = () => {
      if (dragState) {
        setDragState(null);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, zoom, pan, snap, onPanChange, onUpdateElement, onCurtainPositionChange]);

  // Keyboard nudging & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (!selectedElement) return;

      const step = e.shiftKey ? 10 : 1;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onUpdateElement({ ...selectedElement, x: Math.max(0, selectedElement.x - step) });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onUpdateElement({ ...selectedElement, x: selectedElement.x + step });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onUpdateElement({ ...selectedElement, y: Math.max(0, selectedElement.y - step) });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onUpdateElement({ ...selectedElement, y: selectedElement.y + step });
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (onDeleteElement) {
          onDeleteElement(selectedElement.id);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onSelectId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, onUpdateElement, onDeleteElement, onSelectId]);

  // Color tokens based on theme
  const colors = {
    canvasBg: theme === 'blueprint' ? '#0B1929' : theme === 'sketch' ? '#FBFBFA' : '#FFFFFF',
    headingBar: theme === 'blueprint' ? '#7FB0E8' : theme === 'sketch' ? '#57534E' : '#9CA3AF',
    textBar: theme === 'blueprint' ? '#487BB3' : theme === 'sketch' ? '#A8A29E' : '#D1D5DB',
    imageBg: theme === 'blueprint' ? '#163252' : theme === 'sketch' ? '#F5F5F4' : '#F3F4F6',
    imageStroke: theme === 'blueprint' ? '#36679C' : theme === 'sketch' ? '#78716C' : '#D1D5DB',
    avatarBg: theme === 'blueprint' ? '#1D3E64' : theme === 'sketch' ? '#E7E5E4' : '#E5E7EB',
    avatarStroke: theme === 'blueprint' ? '#4F86C2' : theme === 'sketch' ? '#44403C' : '#9CA3AF',
    buttonBox: theme === 'blueprint' ? '#1D4ED8' : theme === 'sketch' ? '#292524' : '#4B5563',
    buttonText: theme === 'blueprint' ? '#E0E7FF' : theme === 'sketch' ? '#FAFAF9' : '#FFFFFF',
    inputBox: theme === 'blueprint' ? '#0F243B' : theme === 'sketch' ? '#FFFFFF' : '#FFFFFF',
    inputStroke: theme === 'blueprint' ? '#36679C' : theme === 'sketch' ? '#57534E' : '#9CA3AF',
    cardBg: theme === 'blueprint' ? '#132A44' : theme === 'sketch' ? '#FFFFFF' : '#FFFFFF',
    cardStroke: theme === 'blueprint' ? '#2D5887' : theme === 'sketch' ? '#44403C' : '#E5E7EB',
    divider: theme === 'blueprint' ? '#20456C' : theme === 'sketch' ? '#78716C' : '#E5E7EB',
  };

  // Render SVG Element
  const renderElement = (el: WireframeElement) => {
    if (el.hidden) return null;
    const { x, y, width, height, type, radius = 4, lines = 1 } = el;
    const isSelected = el.id === selectedId;
    const isHovered = el.id === hoveredId;

    let content: React.ReactNode = null;

    switch (type) {
      case 'heading': {
        const lineCount = Math.max(1, lines);
        const barHeight = Math.max(10, Math.min(22, Math.round(height / lineCount - 6)));
        const gap = Math.max(4, Math.round((height - barHeight * lineCount) / Math.max(1, lineCount - 1)));
        const bars = [];
        for (let i = 0; i < lineCount; i++) {
          const curY = y + i * (barHeight + gap);
          const curWidth = i === lineCount - 1 && lineCount > 1 ? Math.round(width * 0.72) : width;
          bars.push(
            <rect
              key={i}
              x={x}
              y={curY}
              width={curWidth}
              height={barHeight}
              rx={3}
              fill={colors.headingBar}
            />
          );
        }
        content = <>{bars}</>;
        break;
      }

      case 'text': {
        const lineCount = Math.max(1, lines);
        const barHeight = Math.max(6, Math.min(14, Math.round(height / lineCount - 4)));
        const gap = Math.max(3, Math.round((height - barHeight * lineCount) / Math.max(1, lineCount - 1)));
        const bars = [];
        for (let i = 0; i < lineCount; i++) {
          const curY = y + i * (barHeight + gap);
          const curWidth = i === lineCount - 1 && lineCount > 1 ? Math.round(width * 0.65) : width;
          bars.push(
            <rect
              key={i}
              x={x}
              y={curY}
              width={curWidth}
              height={barHeight}
              rx={2}
              fill={colors.textBar}
            />
          );
        }
        content = <>{bars}</>;
        break;
      }

      case 'image': {
        content = (
          <>
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              rx={radius}
              fill={colors.imageBg}
              stroke={colors.imageStroke}
              strokeWidth={1}
            />
            {/* Diagonal cross */}
            <line
              x1={x}
              y1={y}
              x2={x + width}
              y2={y + height}
              stroke={colors.imageStroke}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <line
              x1={x + width}
              y1={y}
              x2={x}
              y2={y + height}
              stroke={colors.imageStroke}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          </>
        );
        break;
      }

      case 'avatar': {
        const r = Math.min(width, height) / 2;
        const cx = x + width / 2;
        const cy = y + height / 2;
        content = (
          <>
            <circle cx={cx} cy={cy} r={r} fill={colors.avatarBg} stroke={colors.avatarStroke} strokeWidth={1} />
            <circle cx={cx} cy={cy - r * 0.2} r={r * 0.35} fill={colors.imageStroke} />
            <path
              d={`M ${cx - r * 0.6} ${cy + r * 0.75} A ${r * 0.7} ${r * 0.7} 0 0 1 ${cx + r * 0.6} ${cy + r * 0.75}`}
              fill="none"
              stroke={colors.imageStroke}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </>
        );
        break;
      }

      case 'button': {
        const innerW = Math.max(20, Math.round(width * 0.55));
        const innerH = Math.max(6, Math.min(12, Math.round(height * 0.28)));
        const innerX = x + Math.round((width - innerW) / 2);
        const innerY = y + Math.round((height - innerH) / 2);
        content = (
          <>
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              rx={radius || 6}
              fill={colors.buttonBox}
              stroke={colors.buttonBox}
              strokeWidth={1}
            />
            <rect
              x={innerX}
              y={innerY}
              width={innerW}
              height={innerH}
              rx={2}
              fill={colors.buttonText}
            />
          </>
        );
        break;
      }

      case 'input': {
        const innerW = Math.max(16, Math.round(width * 0.4));
        const innerH = Math.max(6, Math.min(10, Math.round(height * 0.25)));
        const innerX = x + 12;
        const innerY = y + Math.round((height - innerH) / 2);
        content = (
          <>
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              rx={radius || 4}
              fill={colors.inputBox}
              stroke={colors.inputStroke}
              strokeWidth={1}
            />
            <rect
              x={innerX}
              y={innerY}
              width={innerW}
              height={innerH}
              rx={2}
              fill={colors.textBar}
            />
          </>
        );
        break;
      }

      case 'card': {
        content = (
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            rx={radius || 8}
            fill={colors.cardBg}
            stroke={colors.cardStroke}
            strokeWidth={1}
          />
        );
        break;
      }

      case 'navbar': {
        content = (
          <>
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill={colors.cardBg}
            />
            <line
              x1={x}
              y1={y + height}
              x2={x + width}
              y2={y + height}
              stroke={colors.divider}
              strokeWidth={1}
            />
          </>
        );
        break;
      }

      case 'badge': {
        const innerW = Math.max(12, Math.round(width * 0.5));
        const innerH = Math.max(4, Math.min(8, Math.round(height * 0.35)));
        const innerX = x + Math.round((width - innerW) / 2);
        const innerY = y + Math.round((height - innerH) / 2);
        content = (
          <>
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              rx={radius || 999}
              fill={colors.imageBg}
              stroke={colors.imageStroke}
              strokeWidth={1}
            />
            <rect
              x={innerX}
              y={innerY}
              width={innerW}
              height={innerH}
              rx={2}
              fill={colors.headingBar}
            />
          </>
        );
        break;
      }

      case 'icon': {
        const cx = x + width / 2;
        const cy = y + height / 2;
        const size = Math.min(width, height) * 0.45;
        content = (
          <>
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              rx={radius || 4}
              fill={colors.imageBg}
              stroke={colors.avatarStroke}
              strokeWidth={1}
            />
            <circle
              cx={cx}
              cy={cy}
              r={size / 2}
              fill="none"
              stroke={colors.avatarStroke}
              strokeWidth={1.5}
            />
          </>
        );
        break;
      }

      case 'divider': {
        if (width >= height) {
          const lineY = y + Math.round(height / 2);
          content = (
            <line
              x1={x}
              y1={lineY}
              x2={x + width}
              y2={lineY}
              stroke={colors.divider}
              strokeWidth={1}
            />
          );
        } else {
          const lineX = x + Math.round(width / 2);
          content = (
            <line
              x1={lineX}
              y1={y}
              x2={lineX}
              y2={y + height}
              stroke={colors.divider}
              strokeWidth={1}
            />
          );
        }
        break;
      }

      case 'container':
      default: {
        content = (
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            rx={radius || 0}
            fill={colors.cardBg}
            stroke={colors.cardStroke}
            strokeWidth={1}
          />
        );
        break;
      }
    }

    return (
      <g
        key={el.id}
        data-element-id={el.id}
        className={el.locked ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}
        onPointerDown={(e) => handlePointerDownElement(e, el)}
        onPointerEnter={() => setHoveredId(el.id)}
        onPointerLeave={() => setHoveredId((prev) => (prev === el.id ? null : prev))}
      >
        {content}

        {/* Hover highlight bounding box if not selected */}
        {isHovered && !isSelected && (
          <rect
            x={x - 1}
            y={y - 1}
            width={width + 2}
            height={height + 2}
            fill="none"
            stroke="#60A5FA"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            pointerEvents="none"
          />
        )}
      </g>
    );
  };

  // Render selection box and 8 resize handles
  const renderSelectionBox = () => {
    if (!selectedElement || selectedElement.hidden) return null;
    const { x, y, width, height, locked } = selectedElement;
    const HANDLE_SIZE = 8;
    const half = HANDLE_SIZE / 2;

    const handles: { id: ResizeHandle; cx: number; cy: number; cursor: string }[] = [
      { id: 'nw', cx: x, cy: y, cursor: 'nwse-resize' },
      { id: 'n', cx: x + width / 2, cy: y, cursor: 'ns-resize' },
      { id: 'ne', cx: x + width, cy: y, cursor: 'nesw-resize' },
      { id: 'e', cx: x + width, cy: y + height / 2, cursor: 'ew-resize' },
      { id: 'se', cx: x + width, cy: y + height, cursor: 'nwse-resize' },
      { id: 's', cx: x + width / 2, cy: y + height, cursor: 'ns-resize' },
      { id: 'sw', cx: x, cy: y + height, cursor: 'nesw-resize' },
      { id: 'w', cx: x, cy: y + height / 2, cursor: 'ew-resize' },
    ];

    return (
      <g className="selection-overlay" pointerEvents="all">
        {/* Selection bounding box */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="none"
          stroke={locked ? '#EF4444' : '#2563EB'}
          strokeWidth={1.5}
          pointerEvents="none"
        />

        {/* Dimension & Role badge */}
        <g transform={`translate(${x}, ${Math.max(0, y - 22)})`} pointerEvents="none">
          <rect
            x={0}
            y={0}
            width={Math.max(70, (selectedElement.label || selectedElement.type).length * 6 + 40)}
            height={18}
            rx={4}
            fill="#0F172A"
          />
          <text
            x={6}
            y={13}
            fill="#FFFFFF"
            fontSize={10}
            fontFamily="sans-serif"
            fontWeight={600}
          >
            {selectedElement.label || selectedElement.type} ({Math.round(width)}×{Math.round(height)})
          </text>
        </g>

        {/* 8 resize handles (hidden if locked) */}
        {!locked &&
          handles.map((h) => (
            <rect
              key={h.id}
              x={h.cx - half}
              y={h.cy - half}
              width={HANDLE_SIZE}
              height={HANDLE_SIZE}
              rx={1.5}
              fill="#FFFFFF"
              stroke="#2563EB"
              strokeWidth={1.5}
              style={{ cursor: h.cursor }}
              onPointerDown={(e) => handlePointerDownHandle(e, h.id)}
            />
          ))}
      </g>
    );
  };

  const sortedElements = [...doc.elements].sort((a, b) => a.zIndex - b.zIndex);
  const curtainX = (doc.canvasWidth * curtainPosition) / 100;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className={`relative w-full h-full overflow-hidden select-none bg-slate-950 ${
        toolMode === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
      onPointerDown={handlePointerDownCanvas}
    >
      {/* Zoomed & panned canvas wrapper */}
      <div
        className="absolute origin-top-left transition-transform duration-75 ease-out shadow-2xl"
        style={{
          width: doc.canvasWidth,
          height: doc.canvasHeight,
          backgroundColor: colors.canvasBg,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {/* Subtle engineering grid */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                theme === 'blueprint'
                  ? 'radial-gradient(circle, #38BDF8 1px, transparent 1px)'
                  : 'radial-gradient(circle, #64748B 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />
        )}

        {/* Normal Overlay Screenshot mode */}
        {overlayImage && !curtainMode && (
          <img
            src={overlayImage}
            alt="Source screenshot overlay"
            className="absolute inset-0 pointer-events-none"
            style={{
              width: doc.canvasWidth,
              height: doc.canvasHeight,
              objectFit: 'contain',
              opacity: overlayOpacity,
            }}
          />
        )}

        {/* Curtain Split Mode: Original Screenshot on Left portion */}
        {curtainMode && overlayImage && (
          <div
            className="absolute top-0 left-0 bottom-0 overflow-hidden pointer-events-none z-10"
            style={{ width: `${curtainX}px` }}
          >
            <img
              src={overlayImage}
              alt="Source screenshot"
              style={{
                width: doc.canvasWidth,
                height: doc.canvasHeight,
                maxWidth: 'none',
                objectFit: 'contain',
              }}
            />
            {/* Left badge */}
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-[10px] font-mono text-white border border-slate-700">
              Original
            </div>
          </div>
        )}

        {/* Curtain Split Mode: Wireframe SVG clipped to Right portion */}
        <div
          className="absolute inset-0"
          style={curtainMode ? { clipPath: `inset(0 0 0 ${curtainX}px)` } : undefined}
        >
          {curtainMode && (
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-[10px] font-mono text-white border border-slate-700 z-20">
              Wireframe
            </div>
          )}

          {/* Vector SVG wireframe canvas */}
          <svg
            width={doc.canvasWidth}
            height={doc.canvasHeight}
            viewBox={`0 0 ${doc.canvasWidth} ${doc.canvasHeight}`}
            className="absolute inset-0 w-full h-full"
          >
            {/* Wireframe Elements */}
            {sortedElements.map(renderElement)}

            {/* Active Selection Box */}
            {renderSelectionBox()}
          </svg>
        </div>

        {/* Draggable curtain divider handle */}
        {curtainMode && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-blue-500 z-30 cursor-ew-resize flex items-center justify-center shadow-lg hover:w-1.5 transition-all"
            style={{ left: `${curtainX}px` }}
            onPointerDown={(e) => {
              e.stopPropagation();
              setDragState({
                type: 'curtain',
                startX: e.clientX,
                startY: e.clientY,
              });
            }}
          >
            <div className="w-5 h-8 bg-blue-600 rounded-full border border-white shadow-md flex items-center justify-center text-white">
              <span className="text-[10px] font-bold">⇔</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Canvas Controls HUD */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 shadow-xl">
        <span className="font-mono text-slate-400 mr-1 text-[11px]">
          {Math.round(zoom * 100)}%
        </span>
        {onZoomChange && (
          <>
            <button
              type="button"
              onClick={() => onZoomChange(Math.max(0.2, +(zoom - 0.1).toFixed(2)))}
              title="Zoom out"
              className="p-1 hover:text-white rounded hover:bg-slate-800"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onZoomChange(Math.min(2.5, +(zoom + 0.1).toFixed(2)))}
              title="Zoom in"
              className="p-1 hover:text-white rounded hover:bg-slate-800"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                onZoomChange(1.0);
                onPanChange({ x: 30, y: 30 });
              }}
              title="Reset 100%"
              className="px-1.5 py-0.5 text-[10px] hover:text-white rounded hover:bg-slate-800 font-mono"
            >
              1:1
            </button>
          </>
        )}
        <div className="h-3 w-px bg-slate-800 mx-1" />
        <span className="text-[11px] text-slate-400 font-mono">
          {doc.canvasWidth}×{doc.canvasHeight}
        </span>
      </div>
    </div>
  );
}
