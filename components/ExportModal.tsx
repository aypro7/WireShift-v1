'use client';

import React, { useState } from 'react';
import {
  WireframeDocument,
  WireframeTheme,
} from '@/lib/wireframe-types';
import {
  generateCleanSvgString,
  convertSvgToPngBlob,
} from '@/lib/svg-generator';
import {
  X,
  Download,
  Copy,
  Check,
  FileCode,
  Image as ImageIcon,
  Palette,
  Sparkles,
} from 'lucide-react';

interface ExportModalProps {
  document: WireframeDocument;
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: WireframeTheme;
  onThemeChange?: (theme: WireframeTheme) => void;
}

export default function ExportModal({
  document: doc,
  isOpen,
  onClose,
  currentTheme = 'standard',
  onThemeChange,
}: ExportModalProps) {
  const [selectedTheme, setSelectedTheme] = useState<WireframeTheme>(doc.theme || currentTheme);
  const [pngScale, setPngScale] = useState<number>(2);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'svg' | 'json'>('preview');

  if (!isOpen) return null;

  const docWithTheme: WireframeDocument = {
    ...doc,
    theme: selectedTheme,
  };

  const svgString = generateCleanSvgString(docWithTheme);
  const jsonString = JSON.stringify(docWithTheme, null, 2);

  const handleDownloadSvg = () => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.sourceImageName || 'wireframe'}-${selectedTheme}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = async () => {
    try {
      setIsExportingPng(true);
      const blob = await convertSvgToPngBlob(svgString, pngScale);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${doc.sourceImageName || 'wireframe'}-${selectedTheme}@${pngScale}x.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting PNG:', err);
      alert('Failed to export PNG. You can download as SVG instead.');
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleCopySvg = async () => {
    try {
      await navigator.clipboard.writeText(svgString);
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 2000);
    } catch (err) {
      console.error('Failed to copy SVG:', err);
    }
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-400" />
              <span>Export Vector Wireframe</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pure vector geometry without external bitmaps or raster artifacts.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Theme & Scale selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-slate-300">Style Theme:</span>
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                {(['standard', 'blueprint', 'sketch'] as WireframeTheme[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setSelectedTheme(t);
                      if (onThemeChange) onThemeChange(t);
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                      selectedTheme === t
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">PNG Scale:</span>
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                {[1, 2, 3].map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => setPngScale(scale)}
                    className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
                      pngScale === scale
                        ? 'bg-slate-800 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {scale}×
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Primary Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* SVG Card */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-blue-950/80 text-blue-400 rounded-lg border border-blue-900/50">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Vector SVG (.svg)
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Scale-independent vector
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Lossless vector file. Drop directly into Figma, Illustrator, or embed into React code.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SVG</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopySvg}
                  title="Copy SVG markup to clipboard"
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                >
                  {copiedSvg ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* PNG Card */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-indigo-950/80 text-indigo-400 rounded-lg border border-indigo-900/50">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      High-Res PNG (@{pngScale}×)
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {doc.canvasWidth * pngScale} × {doc.canvasHeight * pngScale} px
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Crisp rasterized screenshot mockup for design reviews, documentation, and slides.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={isExportingPng}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold border border-slate-700 shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExportingPng ? 'Rendering PNG...' : `Download PNG (${pngScale}×)`}</span>
              </button>
            </div>
          </div>

          {/* Inspector Tabs (Visual Preview vs Raw SVG vs JSON) */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/70">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Visual Preview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('svg')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeTab === 'svg'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Raw SVG Code
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('json')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeTab === 'json'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  JSON Schema
                </button>
              </div>

              {activeTab === 'svg' && (
                <button
                  type="button"
                  onClick={handleCopySvg}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  {copiedSvg ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSvg ? 'Copied' : 'Copy code'}</span>
                </button>
              )}

              {activeTab === 'json' && (
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                </button>
              )}
            </div>

            <div className="p-3">
              {activeTab === 'preview' && (
                <div className="w-full h-48 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center p-2">
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{
                      __html: svgString.replace(/width="[^"]+"/, 'width="100%"').replace(/height="[^"]+"/, 'height="100%"'),
                    }}
                  />
                </div>
              )}

              {activeTab === 'svg' && (
                <pre className="p-3 rounded-lg text-[11px] font-mono text-slate-300 bg-slate-950 overflow-x-auto max-h-48 scrollbar-thin">
                  {svgString}
                </pre>
              )}

              {activeTab === 'json' && (
                <pre className="p-3 rounded-lg text-[11px] font-mono text-slate-300 bg-slate-950 overflow-x-auto max-h-48 scrollbar-thin">
                  {jsonString}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="font-mono text-[11px]">
            {doc.elements.length} elements · {doc.canvasWidth}×{doc.canvasHeight}px
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
