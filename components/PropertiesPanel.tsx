'use client';

import React, { useState } from 'react';
import {
  WireframeDocument,
  WireframeElement,
  ElementType,
} from '@/lib/wireframe-types';
import {
  Layers,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Heading,
  Type,
  Square,
  Circle,
  Image as ImageIcon,
  Minus,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Sliders,
  Search,
  Check,
} from 'lucide-react';

interface PropertiesPanelProps {
  document: WireframeDocument;
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  onUpdateElement: (el: WireframeElement) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
}

const TYPE_OPTIONS: { value: ElementType; label: string }[] = [
  { value: 'heading', label: 'Heading' },
  { value: 'text', label: 'Paragraph text' },
  { value: 'button', label: 'Button' },
  { value: 'input', label: 'Input field' },
  { value: 'image', label: 'Image cross' },
  { value: 'avatar', label: 'Avatar' },
  { value: 'card', label: 'Card box' },
  { value: 'navbar', label: 'Navbar' },
  { value: 'badge', label: 'Badge' },
  { value: 'icon', label: 'Icon' },
  { value: 'divider', label: 'Divider' },
  { value: 'container', label: 'Container' },
];

export default function PropertiesPanel({
  document: doc,
  selectedId,
  onSelectId,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onBringToFront,
  onSendToBack,
}: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<'inspector' | 'layers'>('inspector');
  const [layerSearch, setLayerSearch] = useState('');

  const selectedElement = doc.elements.find((el) => el.id === selectedId) || null;

  // Stacking order descending for the layer tree (top visual layers first)
  const sortedLayers = [...doc.elements]
    .filter((el) => {
      if (!layerSearch.trim()) return true;
      const term = layerSearch.toLowerCase();
      return (
        el.type.toLowerCase().includes(term) ||
        (el.label && el.label.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => b.zIndex - a.zIndex);

  const getIconForType = (type: ElementType) => {
    switch (type) {
      case 'heading':
        return <Heading className="w-3.5 h-3.5 text-blue-400" />;
      case 'text':
        return <Type className="w-3.5 h-3.5 text-slate-400" />;
      case 'avatar':
        return <Circle className="w-3.5 h-3.5 text-cyan-400" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-purple-400" />;
      case 'button':
        return <Square className="w-3.5 h-3.5 text-emerald-400" />;
      case 'input':
        return <Square className="w-3.5 h-3.5 text-amber-400" />;
      case 'divider':
        return <Minus className="w-3.5 h-3.5 text-slate-400" />;
      default:
        return <Square className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <aside className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col h-full shrink-0 select-none text-xs text-slate-300">
      {/* Panel Tab Navigation */}
      <div className="h-11 border-b border-slate-800 px-3 flex items-center justify-between shrink-0 bg-slate-950/60">
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('inspector')}
            className={`px-3 py-1 text-[11px] font-medium rounded-md transition-colors ${
              activeTab === 'inspector'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Inspector
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('layers')}
            className={`px-3 py-1 text-[11px] font-medium rounded-md transition-colors ${
              activeTab === 'layers'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Layers ({doc.elements.length})
          </button>
        </div>

        {selectedElement && (
          <div className="flex items-center gap-1">
            {/* Lock / Unlock Toggle */}
            <button
              type="button"
              onClick={() =>
                onUpdateElement({
                  ...selectedElement,
                  locked: !selectedElement.locked,
                })
              }
              title={selectedElement.locked ? 'Unlock element' : 'Lock element'}
              className={`p-1.5 rounded transition-colors ${
                selectedElement.locked
                  ? 'text-red-400 bg-red-950/60'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {selectedElement.locked ? (
                <Lock className="w-3.5 h-3.5" />
              ) : (
                <Unlock className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Hide / Show Toggle */}
            <button
              type="button"
              onClick={() =>
                onUpdateElement({
                  ...selectedElement,
                  hidden: !selectedElement.hidden,
                })
              }
              title={selectedElement.hidden ? 'Show element' : 'Hide element'}
              className={`p-1.5 rounded transition-colors ${
                selectedElement.hidden
                  ? 'text-amber-400 bg-amber-950/60'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {selectedElement.hidden ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>

      {activeTab === 'inspector' ? (
        selectedElement ? (
          /* Element details & properties */
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Element Type */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Element Classification
              </label>
              <select
                value={selectedElement.type}
                disabled={selectedElement.locked}
                onChange={(e) => {
                  const newType = e.target.value as ElementType;
                  onUpdateElement({
                    ...selectedElement,
                    type: newType,
                    lines:
                      newType === 'heading' || newType === 'text'
                        ? selectedElement.lines || 1
                        : undefined,
                  });
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:border-blue-500 focus:outline-none disabled:opacity-50"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Semantic Label */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Semantic Role / Label
              </label>
              <input
                type="text"
                value={selectedElement.label || ''}
                disabled={selectedElement.locked}
                placeholder="e.g. Hero Title, CTA Button"
                onChange={(e) =>
                  onUpdateElement({
                    ...selectedElement,
                    label: e.target.value,
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
              />
            </div>

            {/* Geometry Bounds: X, Y, Width, Height */}
            <div>
              <div className="text-[11px] font-medium text-slate-400 mb-1.5">
                Bounds &amp; Coordinates (px)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
                  <span className="text-[10px] font-mono text-slate-500 mr-2">X</span>
                  <input
                    type="number"
                    disabled={selectedElement.locked}
                    value={Math.round(selectedElement.x)}
                    onChange={(e) =>
                      onUpdateElement({
                        ...selectedElement,
                        x: Math.max(0, parseInt(e.target.value) || 0),
                      })
                    }
                    className="w-full bg-transparent text-xs text-white font-mono focus:outline-none disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
                  <span className="text-[10px] font-mono text-slate-500 mr-2">Y</span>
                  <input
                    type="number"
                    disabled={selectedElement.locked}
                    value={Math.round(selectedElement.y)}
                    onChange={(e) =>
                      onUpdateElement({
                        ...selectedElement,
                        y: Math.max(0, parseInt(e.target.value) || 0),
                      })
                    }
                    className="w-full bg-transparent text-xs text-white font-mono focus:outline-none disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
                  <span className="text-[10px] font-mono text-slate-500 mr-2">W</span>
                  <input
                    type="number"
                    min="8"
                    disabled={selectedElement.locked}
                    value={Math.round(selectedElement.width)}
                    onChange={(e) =>
                      onUpdateElement({
                        ...selectedElement,
                        width: Math.max(8, parseInt(e.target.value) || 8),
                      })
                    }
                    className="w-full bg-transparent text-xs text-white font-mono focus:outline-none disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
                  <span className="text-[10px] font-mono text-slate-500 mr-2">H</span>
                  <input
                    type="number"
                    min="6"
                    disabled={selectedElement.locked}
                    value={Math.round(selectedElement.height)}
                    onChange={(e) =>
                      onUpdateElement({
                        ...selectedElement,
                        height: Math.max(6, parseInt(e.target.value) || 6),
                      })
                    }
                    className="w-full bg-transparent text-xs text-white font-mono focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Skeleton lines count for heading / text */}
            {(selectedElement.type === 'heading' || selectedElement.type === 'text') && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-medium text-slate-400">
                    Skeleton Text Lines
                  </label>
                  <span className="text-[11px] font-mono text-blue-400">
                    {selectedElement.lines || 1} lines
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  disabled={selectedElement.locked}
                  value={selectedElement.lines || 1}
                  onChange={(e) =>
                    onUpdateElement({
                      ...selectedElement,
                      lines: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            )}

            {/* Corner Radius */}
            {selectedElement.type !== 'divider' && selectedElement.type !== 'avatar' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-medium text-slate-400">
                    Corner Radius
                  </label>
                  <span className="text-[11px] font-mono text-slate-300">
                    {selectedElement.radius ?? 4}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="32"
                  step="1"
                  disabled={selectedElement.locked}
                  value={selectedElement.radius ?? 4}
                  onChange={(e) =>
                    onUpdateElement({
                      ...selectedElement,
                      radius: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            )}

            {/* Stacking & Layer Order */}
            <div className="pt-3 border-t border-slate-800">
              <div className="text-[11px] font-medium text-slate-400 mb-2">
                Stacking Order (Z-Index: {selectedElement.zIndex})
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onBringToFront(selectedElement.id)}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
                >
                  <ArrowUp className="w-3.5 h-3.5 text-blue-400" />
                  <span>Bring to Front</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSendToBack(selectedElement.id)}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
                >
                  <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
                  <span>Send to Back</span>
                </button>
              </div>
            </div>

            {/* Duplicate & Delete Actions */}
            <div className="pt-3 border-t border-slate-800 flex gap-2">
              <button
                type="button"
                onClick={() => onDuplicateElement(selectedElement.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors font-medium"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </button>
              <button
                type="button"
                onClick={() => onDeleteElement(selectedElement.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-950/60 hover:bg-red-900/60 border border-red-800/60 text-red-300 rounded-md transition-colors font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ) : (
          /* Empty state: Canvas info */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500">
            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-3 text-slate-400">
              <Sliders className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300 mb-1">
              No element selected
            </p>
            <p className="text-xs text-slate-500 max-w-44 mb-4">
              Click any element on the canvas to inspect and edit its properties.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('layers')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-md transition-colors"
            >
              Browse Layers List
            </button>
          </div>
        )
      ) : (
        /* Layers List Tab */
        <div className="flex-1 flex flex-col min-h-0">
          {/* Search bar */}
          <div className="p-3 bg-slate-950/80 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                value={layerSearch}
                onChange={(e) => setLayerSearch(e.target.value)}
                placeholder="Filter layers by name/type..."
                className="w-full bg-slate-900 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Layer items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-1">
            {sortedLayers.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                {layerSearch ? 'No matching elements found.' : 'No elements in wireframe.'}
              </div>
            ) : (
              sortedLayers.map((el) => (
                <div
                  key={el.id}
                  onClick={() => onSelectId(el.id)}
                  className={`group flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                    el.id === selectedId
                      ? 'bg-blue-600/20 text-white border border-blue-500/30'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1 rounded bg-slate-950 border border-slate-800">
                      {getIconForType(el.type)}
                    </div>
                    <div className="truncate">
                      <div className="truncate text-xs font-medium capitalize text-slate-200">
                        {el.label || el.type}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {Math.round(el.width)}×{Math.round(el.height)} at ({Math.round(el.x)},{Math.round(el.y)})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateElement({ ...el, hidden: !el.hidden });
                      }}
                      title={el.hidden ? 'Show' : 'Hide'}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700"
                    >
                      {el.hidden ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteElement(el.id);
                      }}
                      title="Delete"
                      className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
