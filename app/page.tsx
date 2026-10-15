'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  WireframeDocument,
  WireframeElement,
  ElementType,
  WireframeTheme,
} from '@/lib/wireframe-types';
import UploadWorkspace from '@/components/UploadWorkspace';
import EditorToolbar, { ViewMode } from '@/components/EditorToolbar';
import WireframeCanvas from '@/components/WireframeCanvas';
import PropertiesPanel from '@/components/PropertiesPanel';
import ExportModal from '@/components/ExportModal';
import {
  Layers,
  Sparkles,
  Upload,
  Download,
  Eye,
  Columns,
  Maximize2,
  FileText,
  HelpCircle,
  Keyboard,
  X,
  SplitSquareVertical,
  CheckCircle2,
} from 'lucide-react';

export default function Home() {
  // Document state
  const [wireframeDoc, setWireframeDoc] = useState<WireframeDocument | null>(null);
  const [sourceScreenshotUrl, setSourceScreenshotUrl] = useState<string | null>(null);
  const [theme, setTheme] = useState<WireframeTheme>('standard');

  // History stack for Undo / Redo
  const [history, setHistory] = useState<WireframeElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Editor interaction state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toolMode, setToolMode] = useState<'select' | 'pan'>('select');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [zoom, setZoom] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 30, y: 30 });
  const [snapToGrid, setSnapToGrid] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.35);
  const [curtainPosition, setCurtainPosition] = useState<number>(50);

  // Loading & Error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Modals & Feedback Toasts
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2800);
  }, []);

  // Push state to history
  const pushHistory = useCallback(
    (elements: WireframeElement[]) => {
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        return [...next, elements];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  // Undo / Redo handlers
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const prevElements = history[prevIdx];
      setHistoryIndex(prevIdx);
      setWireframeDoc((doc) => (doc ? { ...doc, elements: prevElements } : null));
      showToast('Undo applied');
    }
  }, [history, historyIndex, showToast]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const nextElements = history[nextIdx];
      setHistoryIndex(nextIdx);
      setWireframeDoc((doc) => (doc ? { ...doc, elements: nextElements } : null));
      showToast('Redo applied');
    }
  }, [history, historyIndex, showToast]);

  // Duplicate element
  const handleDuplicateElement = useCallback(
    (id: string) => {
      if (!wireframeDoc) return;
      const target = wireframeDoc.elements.find((el) => el.id === id);
      if (!target) return;

      const duplicated: WireframeElement = {
        ...target,
        id: `elem-${Date.now()}`,
        x: target.x + 16,
        y: target.y + 16,
        zIndex: Math.max(...wireframeDoc.elements.map((e) => e.zIndex), 0) + 1,
      };

      const nextElements = [...wireframeDoc.elements, duplicated];
      setWireframeDoc({ ...wireframeDoc, elements: nextElements });
      setSelectedId(duplicated.id);
      pushHistory(nextElements);
      showToast(`Duplicated ${target.label || target.type}`);
    },
    [wireframeDoc, pushHistory, showToast]
  );

  // Keyboard shortcuts for Undo / Redo & Global actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
        document.activeElement?.tagName || ''
      );
      if (isInput) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      if (cmdKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (cmdKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (cmdKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedId) {
          handleDuplicateElement(selectedId);
        }
      } else if (e.key === 'v') {
        setToolMode('select');
      } else if (e.key === 'h') {
        setToolMode('pan');
      } else if (e.key === '?') {
        setIsShortcutsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, handleUndo, handleRedo, handleDuplicateElement]);

  // Handle Generate Wireframe API call
  const handleGenerate = async (data: {
    imageBase64: string;
    mimeType: string;
    naturalWidth: number;
    naturalHeight: number;
    sourceName: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadingStep('Uploading & scanning layout geometry...');

      setSourceScreenshotUrl(data.imageBase64);

      setLoadingStep('Analyzing components with Gemini multimodal vision...');

      const res = await fetch('/app/api/wireframe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: data.imageBase64,
          mimeType: data.mimeType,
          naturalWidth: data.naturalWidth,
          naturalHeight: data.naturalHeight,
          sourceName: data.sourceName,
        }),
      });

      let result = await res.json().catch(() => null);

      if (!res.ok || !result?.success) {
        const fallbackRes = await fetch('/api/wireframe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: data.imageBase64,
            mimeType: data.mimeType,
            naturalWidth: data.naturalWidth,
            naturalHeight: data.naturalHeight,
            sourceName: data.sourceName,
          }),
        });
        result = await fallbackRes.json();
      }

      if (!result?.success || !result.wireframe) {
        throw new Error(result?.error || 'Failed to extract wireframe from screenshot.');
      }

      const generatedDoc: WireframeDocument = {
        ...result.wireframe,
        theme: theme,
      };

      setWireframeDoc(generatedDoc);
      setSelectedId(null);

      // Initialize history
      setHistory([generatedDoc.elements]);
      setHistoryIndex(0);

      // Auto fit zoom for current viewport
      const availableWidth = window.innerWidth > 1024 ? (window.innerWidth - 300) / 2 : window.innerWidth;
      const calculatedZoom = Math.min(1.0, Math.max(0.4, (availableWidth - 80) / generatedDoc.canvasWidth));
      setZoom(+calculatedZoom.toFixed(2));
      setPan({ x: 24, y: 24 });

      showToast(`Generated wireframe (${generatedDoc.elements.length} elements detected)`);
    } catch (err: unknown) {
      console.error('Error generating wireframe:', err);
      const msg = err instanceof Error ? err.message : 'Unknown generation error occurred.';
      setError(msg);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Canvas element update
  const handleUpdateElement = (updated: WireframeElement) => {
    if (!wireframeDoc) return;
    const nextElements = wireframeDoc.elements.map((el) =>
      el.id === updated.id ? updated : el
    );
    setWireframeDoc({ ...wireframeDoc, elements: nextElements });
    pushHistory(nextElements);
  };

  // Delete element
  const handleDeleteElement = (id: string) => {
    if (!wireframeDoc) return;
    const target = wireframeDoc.elements.find((el) => el.id === id);
    const nextElements = wireframeDoc.elements.filter((el) => el.id !== id);
    setWireframeDoc({ ...wireframeDoc, elements: nextElements });
    if (selectedId === id) setSelectedId(null);
    pushHistory(nextElements);
    showToast(`Deleted ${target?.label || target?.type || 'element'}`);
  };

  // Add new element primitive
  const handleAddElement = (type: ElementType) => {
    if (!wireframeDoc) return;

    const maxZ = Math.max(...wireframeDoc.elements.map((e) => e.zIndex), 0) + 1;
    const centerX = Math.max(20, Math.round(wireframeDoc.canvasWidth / 2 - 100));
    const centerY = Math.max(20, Math.round(wireframeDoc.canvasHeight / 2 - 40));

    let newEl: WireframeElement = {
      id: `elem-${Date.now()}`,
      type,
      x: centerX,
      y: centerY,
      width: 160,
      height: 48,
      zIndex: maxZ,
      radius: 4,
    };

    switch (type) {
      case 'heading':
        newEl = { ...newEl, width: 240, height: 28, lines: 1 };
        break;
      case 'text':
        newEl = { ...newEl, width: 260, height: 48, lines: 3 };
        break;
      case 'button':
        newEl = { ...newEl, width: 120, height: 38, radius: 6 };
        break;
      case 'input':
        newEl = { ...newEl, width: 220, height: 40, radius: 4 };
        break;
      case 'image':
        newEl = { ...newEl, width: 240, height: 160, radius: 6 };
        break;
      case 'avatar':
        newEl = { ...newEl, width: 48, height: 48, radius: 24 };
        break;
      case 'card':
        newEl = { ...newEl, width: 280, height: 200, radius: 8 };
        break;
      case 'badge':
        newEl = { ...newEl, width: 80, height: 24, radius: 12 };
        break;
      case 'divider':
        newEl = { ...newEl, width: 300, height: 2 };
        break;
    }

    const nextElements = [...wireframeDoc.elements, newEl];
    setWireframeDoc({ ...wireframeDoc, elements: nextElements });
    setSelectedId(newEl.id);
    pushHistory(nextElements);
    showToast(`Added ${type} primitive`);
  };

  // Reorder layers
  const handleBringForward = () => {
    if (!wireframeDoc || !selectedId) return;
    const nextElements = wireframeDoc.elements.map((e) =>
      e.id === selectedId ? { ...e, zIndex: e.zIndex + 1 } : e
    );
    setWireframeDoc({ ...wireframeDoc, elements: nextElements });
    pushHistory(nextElements);
  };

  const handleSendBackward = () => {
    if (!wireframeDoc || !selectedId) return;
    const nextElements = wireframeDoc.elements.map((e) =>
      e.id === selectedId ? { ...e, zIndex: Math.max(0, e.zIndex - 1) } : e
    );
    setWireframeDoc({ ...wireframeDoc, elements: nextElements });
    pushHistory(nextElements);
  };

  const handleBringToFront = (id: string) => {
    if (!wireframeDoc) return;
    const maxZ = Math.max(...wireframeDoc.elements.map((e) => e.zIndex), 0) + 1;
    const nextElements = wireframeDoc.elements.map((e) =>
      e.id === id ? { ...e, zIndex: maxZ } : e
    );
    setWireframeDoc({ ...wireframeDoc, elements: nextElements });
    pushHistory(nextElements);
    showToast('Brought to front');
  };

  const handleSendToBack = (id: string) => {
    if (!wireframeDoc) return;
    const minZ = Math.min(...wireframeDoc.elements.map((e) => e.zIndex), 1) - 1;
    const nextElements = wireframeDoc.elements.map((e) =>
      e.id === id ? { ...e, zIndex: Math.max(0, minZ) } : e
    );
    setWireframeDoc({ ...wireframeDoc, elements: nextElements });
    pushHistory(nextElements);
    showToast('Sent to back');
  };

  // Theme changer
  const handleThemeChange = (newTheme: WireframeTheme) => {
    setTheme(newTheme);
    if (wireframeDoc) {
      setWireframeDoc({ ...wireframeDoc, theme: newTheme });
    }
  };

  // Zoom helpers
  const handleZoomIn = () => setZoom((z) => Math.min(2.5, +(z + 0.1).toFixed(2)));
  const handleZoomOut = () => setZoom((z) => Math.max(0.2, +(z - 0.1).toFixed(2)));
  const handleResetZoom = () => {
    setZoom(1.0);
    setPan({ x: 30, y: 30 });
  };
  const handleFitCanvas = () => {
    if (!wireframeDoc) return;
    const containerW = window.innerWidth > 1024 ? (window.innerWidth - 320) / (viewMode === 'split' ? 2 : 1) : window.innerWidth;
    const fit = Math.min(1.2, Math.max(0.25, (containerW - 60) / wireframeDoc.canvasWidth));
    setZoom(+fit.toFixed(2));
    setPan({ x: 24, y: 24 });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Application Navbar */}
      <nav className="h-14 border-b border-slate-800 bg-slate-900 px-4 sm:px-5 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md shadow-blue-500/20">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  WireShift
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 bg-blue-950/80 border border-blue-800 text-[10px] font-mono font-medium text-blue-400 rounded">
                  v1.2
                </span>
              </div>
              <span className="hidden md:block text-[11px] text-slate-400 font-normal leading-none mt-0.5">
                Screenshot to Editable Vector Wireframe
              </span>
            </div>
          </div>

          {wireframeDoc && (
            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs text-slate-400">
              <span className="font-medium text-slate-200 truncate max-w-44">
                {wireframeDoc.sourceImageName || 'Untitled Wireframe'}
              </span>
              <span>·</span>
              <span className="font-mono text-slate-400">
                {wireframeDoc.canvasWidth}×{wireframeDoc.canvasHeight}px
              </span>
              <span>·</span>
              <span className="text-slate-400 font-medium">
                {wireframeDoc.elements.length} elements
              </span>
            </div>
          )}
        </div>

        {/* Top Navbar Actions */}
        <div className="flex items-center gap-2">
          {/* Keyboard Shortcuts button */}
          <button
            type="button"
            onClick={() => setIsShortcutsOpen(true)}
            title="Keyboard Shortcuts (?)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {wireframeDoc ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setWireframeDoc(null);
                  setSourceScreenshotUrl(null);
                  setSelectedId(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Upload New</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExportOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export SVG / PNG</span>
              </button>
            </>
          ) : (
            <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Gemini Vision Multimodal</span>
            </div>
          )}
        </div>
      </nav>

      {/* Main Workspace Area */}
      {!wireframeDoc ? (
        <main className="flex-1 overflow-y-auto">
          <UploadWorkspace
            onGenerate={handleGenerate}
            isLoading={isLoading}
            loadingStep={loadingStep}
            error={error}
            onClearError={() => setError(null)}
          />
        </main>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Compact Editing Toolbar */}
          <EditorToolbar
            toolMode={toolMode}
            onToolModeChange={setToolMode}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onAddElement={handleAddElement}
            hasSelection={!!selectedId}
            onDeleteSelected={() => selectedId && handleDeleteElement(selectedId)}
            onDuplicateSelected={() => selectedId && handleDuplicateElement(selectedId)}
            onBringForward={handleBringForward}
            onSendBackward={handleSendBackward}
            zoom={zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
            onFitCanvas={handleFitCanvas}
            snapToGrid={snapToGrid}
            onToggleSnap={() => setSnapToGrid((v) => !v)}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid((v) => !v)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            overlayOpacity={overlayOpacity}
            onOverlayOpacityChange={setOverlayOpacity}
            theme={theme}
            onThemeChange={handleThemeChange}
            onOpenExport={() => setIsExportOpen(true)}
            hasScreenshot={!!sourceScreenshotUrl}
          />

          {/* Central Workspace + Right Properties Inspector */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Canvas / Comparison View */}
            <div className="flex-1 flex min-w-0 overflow-hidden bg-slate-950 relative">
              {/* SPLIT VIEW: Screenshot on Left, Wireframe on Right */}
              {viewMode === 'split' && (
                <div className="w-full h-full flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-800">
                  {/* Left: Original Screenshot Panel */}
                  <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-slate-900/60">
                    <div className="h-8 bg-slate-950/80 border-b border-slate-800 px-3 flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>Source Screenshot</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {wireframeDoc.canvasWidth}×{wireframeDoc.canvasHeight}px
                      </span>
                    </div>

                    <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
                      {sourceScreenshotUrl ? (
                        <div className="bg-slate-900 shadow-2xl border border-slate-800 rounded-lg overflow-hidden p-1 flex items-center justify-center">
                          <img
                            src={sourceScreenshotUrl}
                            alt="Original screenshot"
                            className="w-auto h-auto max-h-[82vh] object-contain rounded"
                          />
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500">No screenshot loaded.</div>
                      )}
                    </div>
                  </div>

                  {/* Right: Editable SVG Wireframe Canvas Panel */}
                  <div className="flex-1 flex flex-col min-w-0 min-h-0">
                    <div className="h-8 bg-slate-950/80 border-b border-slate-800 px-3 flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-400" />
                        <span>Editable Wireframe (SVG)</span>
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {wireframeDoc.elements.length} elements · Theme: <span className="capitalize text-blue-400">{theme}</span>
                      </span>
                    </div>

                    <div className="flex-1 relative overflow-hidden">
                      <WireframeCanvas
                        document={wireframeDoc}
                        selectedId={selectedId}
                        onSelectId={setSelectedId}
                        onUpdateElement={handleUpdateElement}
                        onDeleteElement={handleDeleteElement}
                        zoom={zoom}
                        onZoomChange={setZoom}
                        pan={pan}
                        onPanChange={setPan}
                        snapToGrid={snapToGrid}
                        toolMode={toolMode}
                        showGrid={showGrid}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CURTAIN WIPE MODE: Interactive Before/After Split Curtain */}
              {viewMode === 'curtain' && (
                <div className="w-full h-full relative">
                  <WireframeCanvas
                    document={wireframeDoc}
                    selectedId={selectedId}
                    onSelectId={setSelectedId}
                    onUpdateElement={handleUpdateElement}
                    onDeleteElement={handleDeleteElement}
                    zoom={zoom}
                    onZoomChange={setZoom}
                    pan={pan}
                    onPanChange={setPan}
                    snapToGrid={snapToGrid}
                    toolMode={toolMode}
                    overlayImage={sourceScreenshotUrl}
                    showGrid={showGrid}
                    curtainMode={true}
                    curtainPosition={curtainPosition}
                    onCurtainPositionChange={setCurtainPosition}
                  />
                  {/* Quick guidance tooltip banner */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 bg-slate-900/90 backdrop-blur-md rounded-full border border-slate-700 text-xs text-slate-300 shadow-lg pointer-events-none">
                    Drag the center blue divider horizontally to compare source vs wireframe
                  </div>
                </div>
              )}

              {/* OVERLAY VIEW: Wireframe directly over screenshot */}
              {viewMode === 'overlay' && (
                <div className="w-full h-full relative">
                  <WireframeCanvas
                    document={wireframeDoc}
                    selectedId={selectedId}
                    onSelectId={setSelectedId}
                    onUpdateElement={handleUpdateElement}
                    onDeleteElement={handleDeleteElement}
                    zoom={zoom}
                    onZoomChange={setZoom}
                    pan={pan}
                    onPanChange={setPan}
                    snapToGrid={snapToGrid}
                    toolMode={toolMode}
                    overlayImage={sourceScreenshotUrl}
                    overlayOpacity={overlayOpacity}
                    showGrid={showGrid}
                  />
                </div>
              )}

              {/* WIREFRAME ONLY VIEW */}
              {viewMode === 'wireframe' && (
                <div className="w-full h-full relative">
                  <WireframeCanvas
                    document={wireframeDoc}
                    selectedId={selectedId}
                    onSelectId={setSelectedId}
                    onUpdateElement={handleUpdateElement}
                    onDeleteElement={handleDeleteElement}
                    zoom={zoom}
                    onZoomChange={setZoom}
                    pan={pan}
                    onPanChange={setPan}
                    snapToGrid={snapToGrid}
                    toolMode={toolMode}
                    showGrid={showGrid}
                  />
                </div>
              )}

              {/* SCREENSHOT ONLY VIEW */}
              {viewMode === 'screenshot' && (
                <div className="w-full h-full p-6 overflow-auto flex items-center justify-center bg-slate-950">
                  {sourceScreenshotUrl ? (
                    <div className="bg-slate-900 shadow-2xl rounded-xl border border-slate-800 p-2">
                      <img
                        src={sourceScreenshotUrl}
                        alt="Screenshot preview"
                        className="max-h-[85vh] w-auto object-contain rounded"
                      />
                    </div>
                  ) : (
                    <div className="text-slate-500 text-xs">No screenshot available</div>
                  )}
                </div>
              )}
            </div>

            {/* Right Properties & Hierarchy Inspector */}
            <PropertiesPanel
              document={wireframeDoc}
              selectedId={selectedId}
              onSelectId={setSelectedId}
              onUpdateElement={handleUpdateElement}
              onDeleteElement={handleDeleteElement}
              onDuplicateElement={handleDuplicateElement}
              onBringToFront={handleBringToFront}
              onSendToBack={handleSendToBack}
            />
          </div>
        </div>
      )}

      {/* Export Modal */}
      {wireframeDoc && (
        <ExportModal
          document={wireframeDoc}
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          currentTheme={theme}
          onThemeChange={handleThemeChange}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {isShortcutsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-md overflow-hidden text-slate-100">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold text-sm text-white">Keyboard Shortcuts</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsShortcutsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Select Tool</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded font-mono text-slate-200">V</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Pan Canvas Tool</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded font-mono text-slate-200">H</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Quick Pan while dragging</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded font-mono text-slate-200">Space + Drag</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Undo Action</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded font-mono text-slate-200">Ctrl/⌘ + Z</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Redo Action</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded font-mono text-slate-200">Ctrl/⌘ + Shift + Z</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Duplicate Selected</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded font-mono text-slate-200">Ctrl/⌘ + D</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Delete Selected</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded font-mono text-slate-200">Del / Backspace</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Nudge 1px</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded font-mono text-slate-200">Arrow Keys</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Nudge 10px</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded font-mono text-slate-200">Shift + Arrow Keys</kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Zoom in/out</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded font-mono text-slate-200">Ctrl/⌘ + Wheel</kbd>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
              <button
                type="button"
                onClick={() => setIsShortcutsOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
