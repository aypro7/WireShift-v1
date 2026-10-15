import { WireframeDocument, WireframeElement } from './wireframe-types';

/**
 * Generates clean, standalone SVG XML string from a WireframeDocument.
 * Strictly adheres to low-fidelity wireframing rules:
 * - Neutral white and gray palette (#FFFFFF, #F3F4F6, #E5E7EB, #D1D5DB, #9CA3AF, #6B7280, #374151)
 * - Text replaced with skeleton bars
 * - Images replaced with diagonal cross boxes
 * - Avatars replaced with circles
 * - Buttons & inputs simplified into basic outlined shapes
 * - Zero external images or brand styling
 */
export function generateCleanSvgString(doc: WireframeDocument): string {
  const { canvasWidth, canvasHeight, elements, theme = 'standard' } = doc;

  // Stacking order, exclude hidden elements
  const sorted = [...elements]
    .filter((el) => !el.hidden)
    .sort((a, b) => a.zIndex - b.zIndex);

  const elementsSvg = sorted.map((el) => renderElementToSvg(el)).join('\n  ');

  // Theme-specific CSS styling
  let styleRules = `
      .wf-card { fill: #FFFFFF; stroke: #E5E7EB; stroke-width: 1px; }
      .wf-container { fill: #FAFAFA; stroke: #E5E7EB; stroke-width: 1px; }
      .wf-navbar { fill: #FFFFFF; stroke: #E5E7EB; stroke-width: 1px; }
      .wf-image-bg { fill: #F3F4F6; stroke: #D1D5DB; stroke-width: 1px; }
      .wf-cross { stroke: #D1D5DB; stroke-width: 1.5px; stroke-linecap: round; }
      .wf-avatar { fill: #E5E7EB; stroke: #9CA3AF; stroke-width: 1px; }
      .wf-btn-box { fill: #4B5563; stroke: #374151; stroke-width: 1px; }
      .wf-btn-bar { fill: #FFFFFF; }
      .wf-input-box { fill: #FFFFFF; stroke: #9CA3AF; stroke-width: 1px; }
      .wf-input-bar { fill: #D1D5DB; }
      .wf-heading-bar { fill: #9CA3AF; }
      .wf-text-bar { fill: #D1D5DB; }
      .wf-badge-box { fill: #F3F4F6; stroke: #D1D5DB; stroke-width: 1px; }
      .wf-badge-bar { fill: #9CA3AF; }
      .wf-divider { stroke: #E5E7EB; stroke-width: 1px; }
      .wf-icon-box { fill: #F3F4F6; stroke: #9CA3AF; stroke-width: 1px; }
  `;
  let bgColor = '#FFFFFF';

  if (theme === 'blueprint') {
    bgColor = '#0B1929';
    styleRules = `
      .wf-card { fill: #132A44; stroke: #2D5887; stroke-width: 1px; }
      .wf-container { fill: #0E2239; stroke: #20456C; stroke-width: 1px; }
      .wf-navbar { fill: #132A44; stroke: #2D5887; stroke-width: 1px; }
      .wf-image-bg { fill: #163252; stroke: #36679C; stroke-width: 1px; }
      .wf-cross { stroke: #36679C; stroke-width: 1.5px; stroke-linecap: round; }
      .wf-avatar { fill: #1D3E64; stroke: #4F86C2; stroke-width: 1px; }
      .wf-btn-box { fill: #1D4ED8; stroke: #3B82F6; stroke-width: 1px; }
      .wf-btn-bar { fill: #E0E7FF; }
      .wf-input-box { fill: #0F243B; stroke: #36679C; stroke-width: 1px; }
      .wf-input-bar { fill: #5289C7; }
      .wf-heading-bar { fill: #7FB0E8; }
      .wf-text-bar { fill: #487BB3; }
      .wf-badge-box { fill: #163252; stroke: #36679C; stroke-width: 1px; }
      .wf-badge-bar { fill: #7FB0E8; }
      .wf-divider { stroke: #20456C; stroke-width: 1px; }
      .wf-icon-box { fill: #163252; stroke: #4F86C2; stroke-width: 1px; }
    `;
  } else if (theme === 'sketch') {
    bgColor = '#FBFBFA';
    styleRules = `
      .wf-card { fill: #FFFFFF; stroke: #44403C; stroke-width: 1.5px; }
      .wf-container { fill: #F5F5F0; stroke: #57534E; stroke-width: 1.5px; }
      .wf-navbar { fill: #FFFFFF; stroke: #44403C; stroke-width: 1.5px; }
      .wf-image-bg { fill: #F5F5F4; stroke: #78716C; stroke-width: 1.5px; }
      .wf-cross { stroke: #78716C; stroke-width: 1.5px; stroke-linecap: round; }
      .wf-avatar { fill: #E7E5E4; stroke: #44403C; stroke-width: 1.5px; }
      .wf-btn-box { fill: #292524; stroke: #1C1917; stroke-width: 1.5px; }
      .wf-btn-bar { fill: #FAFAF9; }
      .wf-input-box { fill: #FFFFFF; stroke: #57534E; stroke-width: 1.5px; }
      .wf-input-bar { fill: #A8A29E; }
      .wf-heading-bar { fill: #57534E; }
      .wf-text-bar { fill: #A8A29E; }
      .wf-badge-box { fill: #F5F5F4; stroke: #78716C; stroke-width: 1.5px; }
      .wf-badge-bar { fill: #57534E; }
      .wf-divider { stroke: #78716C; stroke-width: 1.5px; }
      .wf-icon-box { fill: #F5F5F4; stroke: #44403C; stroke-width: 1.5px; }
    `;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasWidth} ${canvasHeight}" width="${canvasWidth}" height="${canvasHeight}">
  <defs>
    <style>${styleRules}</style>
  </defs>

  <!-- Canvas Background -->
  <rect width="${canvasWidth}" height="${canvasHeight}" fill="${bgColor}" />

  <!-- Wireframe Vector Elements -->
  ${elementsSvg}
</svg>`;
}

export function renderElementToSvg(el: WireframeElement): string {
  const { x, y, width, height, type, radius = 4, lines = 1 } = el;

  switch (type) {
    case 'heading': {
      const lineCount = Math.max(1, lines);
      const barHeight = Math.max(10, Math.min(22, Math.round(height / lineCount - 6)));
      const gap = Math.max(4, Math.round((height - barHeight * lineCount) / Math.max(1, lineCount - 1)));
      const bars: string[] = [];

      for (let i = 0; i < lineCount; i++) {
        const curY = y + i * (barHeight + gap);
        // If multiline, make the last line slightly shorter for natural typographic rhythm
        const curWidth = i === lineCount - 1 && lineCount > 1 ? Math.round(width * 0.72) : width;
        bars.push(
          `<rect x="${x}" y="${curY}" width="${curWidth}" height="${barHeight}" rx="3" class="wf-heading-bar" />`
        );
      }
      return `<g data-id="${el.id}" data-type="heading">${bars.join('')}</g>`;
    }

    case 'text': {
      const lineCount = Math.max(1, lines);
      const barHeight = Math.max(6, Math.min(14, Math.round(height / lineCount - 4)));
      const gap = Math.max(3, Math.round((height - barHeight * lineCount) / Math.max(1, lineCount - 1)));
      const bars: string[] = [];

      for (let i = 0; i < lineCount; i++) {
        const curY = y + i * (barHeight + gap);
        const curWidth = i === lineCount - 1 && lineCount > 1 ? Math.round(width * 0.65) : width;
        bars.push(
          `<rect x="${x}" y="${curY}" width="${curWidth}" height="${barHeight}" rx="2" class="wf-text-bar" />`
        );
      }
      return `<g data-id="${el.id}" data-type="text">${bars.join('')}</g>`;
    }

    case 'image': {
      const r = radius || 4;
      return `<g data-id="${el.id}" data-type="image">
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${r}" class="wf-image-bg" />
    <line x1="${x}" y1="${y}" x2="${x + width}" y2="${y + height}" class="wf-cross" />
    <line x1="${x + width}" y1="${y}" x2="${x}" y2="${y + height}" class="wf-cross" />
  </g>`;
    }

    case 'avatar': {
      const r = Math.min(width, height) / 2;
      const cx = x + width / 2;
      const cy = y + height / 2;
      return `<g data-id="${el.id}" data-type="avatar">
    <circle cx="${cx}" cy="${cy}" r="${r}" class="wf-avatar" />
    <circle cx="${cx}" cy="${cy - r * 0.2}" r="${r * 0.35}" fill="#D1D5DB" />
    <path d="M ${cx - r * 0.6} ${cy + r * 0.75} A ${r * 0.7} ${r * 0.7} 0 0 1 ${cx + r * 0.6} ${cy + r * 0.75}" fill="none" stroke="#D1D5DB" stroke-width="2" stroke-linecap="round" />
  </g>`;
    }

    case 'button': {
      const r = radius || 6;
      const innerW = Math.max(20, Math.round(width * 0.55));
      const innerH = Math.max(6, Math.min(12, Math.round(height * 0.28)));
      const innerX = x + Math.round((width - innerW) / 2);
      const innerY = y + Math.round((height - innerH) / 2);
      return `<g data-id="${el.id}" data-type="button">
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${r}" class="wf-btn-box" />
    <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" rx="2" class="wf-btn-bar" />
  </g>`;
    }

    case 'input': {
      const r = radius || 4;
      const innerW = Math.max(16, Math.round(width * 0.4));
      const innerH = Math.max(6, Math.min(10, Math.round(height * 0.25)));
      const innerX = x + 12;
      const innerY = y + Math.round((height - innerH) / 2);
      return `<g data-id="${el.id}" data-type="input">
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${r}" class="wf-input-box" />
    <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" rx="2" class="wf-input-bar" />
  </g>`;
    }

    case 'card': {
      const r = radius || 8;
      return `<g data-id="${el.id}" data-type="card">
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${r}" class="wf-card" />
  </g>`;
    }

    case 'navbar': {
      return `<g data-id="${el.id}" data-type="navbar">
    <rect x="${x}" y="${y}" width="${width}" height="${height}" class="wf-navbar" />
    <line x1="${x}" y1="${y + height}" x2="${x + width}" y2="${y + height}" stroke="#E5E7EB" stroke-width="1" />
  </g>`;
    }

    case 'badge': {
      const r = radius || 999;
      const innerW = Math.max(12, Math.round(width * 0.5));
      const innerH = Math.max(4, Math.min(8, Math.round(height * 0.35)));
      const innerX = x + Math.round((width - innerW) / 2);
      const innerY = y + Math.round((height - innerH) / 2);
      return `<g data-id="${el.id}" data-type="badge">
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${r}" class="wf-badge-box" />
    <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" rx="2" class="wf-badge-bar" />
  </g>`;
    }

    case 'icon': {
      const r = radius || 4;
      const cx = x + width / 2;
      const cy = y + height / 2;
      const size = Math.min(width, height) * 0.45;
      return `<g data-id="${el.id}" data-type="icon">
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${r}" class="wf-icon-box" />
    <circle cx="${cx}" cy="${cy}" r="${size / 2}" fill="none" stroke="#9CA3AF" stroke-width="1.5" />
  </g>`;
    }

    case 'divider': {
      if (width >= height) {
        // Horizontal divider
        const lineY = y + Math.round(height / 2);
        return `<line x1="${x}" y1="${lineY}" x2="${x + width}" y2="${lineY}" class="wf-divider" data-id="${el.id}" />`;
      } else {
        // Vertical divider
        const lineX = x + Math.round(width / 2);
        return `<line x1="${lineX}" y1="${y}" x2="${lineX}" y2="${y + height}" class="wf-divider" data-id="${el.id}" />`;
      }
    }

    case 'container':
    default: {
      const r = radius || 0;
      return `<g data-id="${el.id}" data-type="container">
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${r}" class="wf-container" />
  </g>`;
    }
  }
}

/**
 * Converts an SVG string into a downloadable PNG Blob
 */
export async function convertSvgToPngBlob(svgString: string, scale = 2): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgEl = doc.documentElement;
    const width = parseFloat(svgEl.getAttribute('width') || '1200') * scale;
    const height = parseFloat(svgEl.getAttribute('height') || '800') * scale;

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas 2D context not supported'));
        return;
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create PNG blob from canvas'));
        }
      }, 'image/png');
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG into image for PNG rendering'));
    };

    img.src = url;
  });
}
