'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  FileImage,
  Sparkles,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Layers,
  Copy,
  Sliders,
  Maximize2,
  FileCode,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { SAMPLE_SCREENSHOTS, SampleScreenshot } from '@/lib/sample-screenshots';

interface UploadWorkspaceProps {
  onGenerate: (data: {
    imageBase64: string;
    mimeType: string;
    naturalWidth: number;
    naturalHeight: number;
    sourceName: string;
  }) => Promise<void>;
  isLoading: boolean;
  loadingStep: string;
  error: string | null;
  onClearError: () => void;
}

export default function UploadWorkspace({
  onGenerate,
  isLoading,
  loadingStep,
  error,
  onClearError,
}: UploadWorkspaceProps) {
  const [selectedImage, setSelectedImage] = useState<{
    dataUrl: string;
    mimeType: string;
    naturalWidth: number;
    naturalHeight: number;
    fileName: string;
    fileSizeStr?: string;
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [clipboardPasted, setClipboardPasted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (PNG, JPG, or WebP).');
        return;
      }

      onClearError();
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setSelectedImage({
            dataUrl,
            mimeType: file.type,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            fileName: file.name,
            fileSizeStr: `${(file.size / 1024).toFixed(0)} KB`,
          });
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    },
    [onClearError]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Clipboard paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          processFile(file);
          setClipboardPasted(true);
          setTimeout(() => setClipboardPasted(false), 2500);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processFile]);

  const selectSample = (sample: SampleScreenshot) => {
    onClearError();
    setSelectedImage({
      dataUrl: sample.dataUrl,
      mimeType: 'image/svg+xml',
      naturalWidth: sample.width,
      naturalHeight: sample.height,
      fileName: sample.title,
      fileSizeStr: 'Preset Sample',
    });
  };

  const handleSubmit = async () => {
    if (!selectedImage || isLoading) return;
    await onGenerate({
      imageBase64: selectedImage.dataUrl,
      mimeType: selectedImage.mimeType,
      naturalWidth: selectedImage.naturalWidth,
      naturalHeight: selectedImage.naturalHeight,
      sourceName: selectedImage.fileName,
    });
  };

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] bg-slate-900 text-slate-100 flex flex-col justify-between py-10 px-4 sm:px-6">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Editorial Subtitle & Headline */}
        <div className="text-center max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-slate-300 mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Gemini Multimodal Vision UI Engine</span>
            <span className="text-slate-500">·</span>
            <span className="text-blue-400 font-semibold">v1.2</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Deconstruct screenshots into editable vector wireframes
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed max-w-xl mx-auto">
            Upload any web or mobile UI screenshot. Gemini analyzes spatial hierarchy, typography lines, and layout bounds—rendering a clean low-fidelity SVG wireframe ready for Figma or code.
          </p>

          {/* Quick value proposition tags - unboxed metadata */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hierarchical Skeleton Bars</span>
            </span>
            <span className="text-slate-700">·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Neutral White &amp; Gray Rules</span>
            </span>
            <span className="text-slate-700">·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pure Vector SVG &amp; PNG Export</span>
            </span>
          </div>
        </div>

        {/* Upload Container Card */}
        <div className="w-full bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-md mb-10 transition-all">
          {!selectedImage ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-400 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                  : 'border-slate-700 hover:border-slate-500 bg-slate-900/50 hover:bg-slate-900/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-4 transition-transform group-hover:scale-105">
                <UploadCloud className="w-7 h-7" />
              </div>

              <h3 className="text-base font-semibold text-white mb-1.5">
                Drop your UI screenshot here, or <span className="text-blue-400 underline underline-offset-2">browse files</span>
              </h3>

              <p className="text-xs text-slate-400 mb-4">
                Supports PNG, JPG, or WebP at full resolution
              </p>

              {/* Clipboard hint banner */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Or take a screenshot and paste directly with</span>
                <kbd className="px-1.5 py-0.5 bg-slate-700 text-white rounded text-[11px] font-mono border border-slate-600">
                  Ctrl+V
                </kbd>
                <span>/</span>
                <kbd className="px-1.5 py-0.5 bg-slate-700 text-white rounded text-[11px] font-mono border border-slate-600">
                  ⌘V
                </kbd>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Image Preview & Details Card */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 sm:p-5 bg-slate-900/80 rounded-xl border border-slate-700/80">
                <div className="relative w-full sm:w-56 h-36 bg-slate-950 rounded-lg overflow-hidden shrink-0 border border-slate-800 flex items-center justify-center p-2">
                  <img
                    src={selectedImage.dataUrl}
                    alt="Uploaded screenshot"
                    className="max-w-full max-h-full object-contain drop-shadow-md"
                  />
                  <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 bg-slate-900/90 border border-slate-700 text-[10px] font-mono text-slate-300 rounded">
                    {selectedImage.naturalWidth}×{selectedImage.naturalHeight}
                  </div>
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-semibold text-sm text-white truncate">
                      {selectedImage.fileName}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-3">
                    <div className="bg-slate-800/60 p-2 rounded-md border border-slate-700/50">
                      <span className="block text-[10px] text-slate-500 uppercase font-mono">Canvas Dimensions</span>
                      <span className="font-mono text-slate-200 font-medium">
                        {selectedImage.naturalWidth} × {selectedImage.naturalHeight} px
                      </span>
                    </div>
                    <div className="bg-slate-800/60 p-2 rounded-md border border-slate-700/50">
                      <span className="block text-[10px] text-slate-500 uppercase font-mono">Source Type</span>
                      <span className="font-mono text-slate-200 font-medium">
                        {selectedImage.fileSizeStr || 'Image Asset'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium rounded-md transition-colors"
                    >
                      Choose another image
                    </button>
                    {clipboardPasted && (
                      <span className="text-xs text-emerald-400 font-medium animate-fadeIn">
                        Pasted from clipboard!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-xl flex items-start gap-3 text-xs text-red-200 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <div className="flex-1">
                    <span className="font-semibold text-red-300">Extraction Error: </span>
                    {error}
                  </div>
                </div>
              )}

              {/* Loading progress visualization */}
              {isLoading && (
                <div className="p-4 bg-slate-900/90 border border-slate-700/80 rounded-xl space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-2 font-medium">
                      <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                      <span>{loadingStep || 'Deconstructing screenshot with Gemini Vision...'}</span>
                    </span>
                    <span className="font-mono text-blue-400">Processing</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse w-3/4 transition-all duration-500" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Detecting containers, headings, body text, buttons, image boxes, and spatial coordinates.
                  </p>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Strict low-fidelity rules: neutral white &amp; gray vectors only</span>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating Wireframe...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-blue-200" />
                      <span>Generate wireframe</span>
                      <ArrowRight className="w-4 h-4 ml-0.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sample Presets Section */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Test Gallery — Select a preset UI</span>
            </h2>
            <span className="text-xs text-slate-400">Click any card to load</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SAMPLE_SCREENSHOTS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => selectSample(sample)}
                className="group relative p-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/70 hover:border-blue-500/50 rounded-xl text-left transition-all hover:shadow-xl hover:shadow-blue-500/5 flex flex-col cursor-pointer"
              >
                <div className="w-full h-32 bg-slate-950 rounded-lg overflow-hidden mb-3 border border-slate-800 flex items-center justify-center p-2 transition-transform duration-200 group-hover:scale-102">
                  <img
                    src={sample.dataUrl}
                    alt={sample.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="font-semibold text-xs text-white group-hover:text-blue-400 transition-colors truncate">
                  {sample.title}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                  <span>{sample.category}</span>
                  <span className="font-mono text-slate-400 text-[10px]">
                    {sample.width} × {sample.height}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="w-full max-w-4xl mx-auto pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span>WireShift</span>
          <span>·</span>
          <span>Session-only storage (no database or tracking)</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Export pure SVG / PNG</span>
          <span>·</span>
          <span>Full vector fidelity</span>
        </div>
      </footer>
    </div>
  );
}
