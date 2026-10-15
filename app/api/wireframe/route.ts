import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { WireframeDocument, WireframeElement, ElementType } from '@/lib/wireframe-types';

export const maxDuration = 60; // Allow sufficient time for vision multimodal processing

const VALID_TYPES: Set<ElementType> = new Set([
  'heading',
  'text',
  'button',
  'input',
  'image',
  'avatar',
  'card',
  'icon',
  'navbar',
  'badge',
  'divider',
  'container',
]);

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { imageBase64, mimeType, naturalWidth, naturalHeight, sourceName } = body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid imageBase64 in request body.' },
        { status: 400 }
      );
    }

    // Strip data URI prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
    const validMime = mimeType && mimeType.startsWith('image/') ? mimeType : 'image/png';

    const width = typeof naturalWidth === 'number' && naturalWidth > 0 ? Math.round(naturalWidth) : 1280;
    const height = typeof naturalHeight === 'number' && naturalHeight > 0 ? Math.round(naturalHeight) : 800;

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `You are an expert design systems engineer and wireframing specialist.
Analyze this user interface screenshot and deconstruct it into a clean, editable, low-fidelity wireframe.
The original screenshot dimensions are ${width} x ${height} px.

STRICT CONVERSION RULES:
1. Preserve composition, proportions, alignment, horizontal/vertical spacing, and layout hierarchy as closely as possible.
2. Coordinates MUST be in pixels relative to the [0, 0, ${width}, ${height}] canvas.
   - x: horizontal offset from left (0 to ${width})
   - y: vertical offset from top (0 to ${height})
   - width: element width in px (> 0)
   - height: element height in px (> 0)
3. Element Types:
   - "heading": Titles, main headlines, card headings. Represents text with bolder gray skeleton bars. (Set 'lines' between 1 and 4).
   - "text": Subtitles, paragraph bodies, list copy, labels, captions, table text. Represents text with thinner gray bars. (Set 'lines' count).
   - "button": Action buttons, CTA buttons, icon buttons. Box shape with rounded corners.
   - "input": Text fields, search bars, select inputs, textareas. Outlined input shape.
   - "image": Photos, hero illustrations, banners, product shots, thumbnail previews. Box with diagonal crosses.
   - "avatar": User profiles, author faces, circular logos. Circle shape.
   - "card": Content cards, panels, modal dialogs, pricing cards, feature cards. Outlined rectangular container.
   - "navbar": Header navigation bars, top app bars, bottom tab bars.
   - "icon": Small utility icons, chevrons, stars, action badges (< 40x40px).
   - "badge": Small chips, tag pills, count bubbles.
   - "divider": Thin horizontal or vertical separator lines.
   - "container": Major section boundaries or layout wrappers (hero section, sidebar, footer).
4. Do NOT redesign or rearrange the layout. Do NOT invent new elements.
5. All visible brand colors, gradients, shadows, and textures MUST be simplified into neutral whites and grays.
6. Stacking order (zIndex):
   - Backgrounds & containers: 1 - 10
   - Cards & panels: 10 - 20
   - Inner content (headings, text, buttons, images, avatars, inputs): 20 - 100
7. Capture all distinct functional UI elements in the screenshot. Return a structured list.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: validMime,
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            canvasWidth: {
              type: Type.INTEGER,
              description: 'The overall canvas width in pixels',
            },
            canvasHeight: {
              type: Type.INTEGER,
              description: 'The overall canvas height in pixels',
            },
            elements: {
              type: Type.ARRAY,
              description: 'The extracted UI elements in the wireframe',
              items: {
                type: Type.OBJECT,
                properties: {
                  id: {
                    type: Type.STRING,
                    description: 'Unique string ID for the element, e.g. "el-1"',
                  },
                  type: {
                    type: Type.STRING,
                    enum: [
                      'heading',
                      'text',
                      'button',
                      'input',
                      'image',
                      'avatar',
                      'card',
                      'icon',
                      'navbar',
                      'badge',
                      'divider',
                      'container',
                    ],
                  },
                  x: { type: Type.NUMBER, description: 'X position in px' },
                  y: { type: Type.NUMBER, description: 'Y position in px' },
                  width: { type: Type.NUMBER, description: 'Width in px' },
                  height: { type: Type.NUMBER, description: 'Height in px' },
                  label: { type: Type.STRING, description: 'Short semantic role, e.g. "Hero Heading"' },
                  lines: { type: Type.INTEGER, description: 'Number of text lines for text/heading' },
                  radius: { type: Type.NUMBER, description: 'Corner radius in px' },
                  zIndex: { type: Type.INTEGER, description: 'Stacking order integer' },
                },
                required: ['id', 'type', 'x', 'y', 'width', 'height', 'zIndex'],
              },
            },
          },
          required: ['canvasWidth', 'canvasHeight', 'elements'],
        },
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error('Gemini returned an empty response.');
    }

    let parsed: {
      canvasWidth?: number;
      canvasHeight?: number;
      elements?: Array<Record<string, unknown>>;
    };

    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('Failed to parse Gemini JSON output:', rawText);
      throw new Error('Failed to parse model output as JSON.');
    }

    const canvasWidth =
      typeof parsed.canvasWidth === 'number' && parsed.canvasWidth > 50
        ? Math.round(parsed.canvasWidth)
        : width;
    const canvasHeight =
      typeof parsed.canvasHeight === 'number' && parsed.canvasHeight > 50
        ? Math.round(parsed.canvasHeight)
        : height;

    const rawElements = Array.isArray(parsed.elements) ? parsed.elements : [];

    // Sanitize and validate every element
    const sanitizedElements: WireframeElement[] = rawElements
      .map((item, index) => {
        const rawType = String(item.type || '').toLowerCase();
        const type: ElementType = VALID_TYPES.has(rawType as ElementType)
          ? (rawType as ElementType)
          : 'text';

        let x = typeof item.x === 'number' ? Math.round(item.x) : 0;
        let y = typeof item.y === 'number' ? Math.round(item.y) : 0;
        let elWidth = typeof item.width === 'number' ? Math.round(item.width) : 100;
        let elHeight = typeof item.height === 'number' ? Math.round(item.height) : 32;

        // Ensure minimum dimensions
        elWidth = Math.max(8, Math.min(elWidth, canvasWidth));
        elHeight = Math.max(6, Math.min(elHeight, canvasHeight * 2));
        x = Math.max(0, Math.min(x, canvasWidth - 10));
        y = Math.max(0, y);

        const zIndex =
          typeof item.zIndex === 'number'
            ? item.zIndex
            : type === 'container' || type === 'card'
            ? index + 1
            : index + 20;

        const lines =
          typeof item.lines === 'number' && item.lines > 0
            ? Math.min(10, Math.max(1, Math.round(item.lines)))
            : type === 'heading'
            ? 1
            : type === 'text'
            ? Math.max(1, Math.round(elHeight / 18))
            : undefined;

        // Assign standardized neutral wireframe styling
        let fill = '#FFFFFF';
        let stroke = '#D1D5DB';
        let strokeWidth = 1;
        let radius = typeof item.radius === 'number' ? Math.max(0, Math.round(item.radius)) : 4;

        switch (type) {
          case 'heading':
            fill = '#9CA3AF'; // Medium gray skeleton bar
            stroke = 'transparent';
            strokeWidth = 0;
            radius = 3;
            break;
          case 'text':
            fill = '#D1D5DB'; // Light gray skeleton bar
            stroke = 'transparent';
            strokeWidth = 0;
            radius = 2;
            break;
          case 'button':
            fill = '#4B5563'; // Darker gray button representation
            stroke = '#374151';
            strokeWidth = 1;
            radius = radius > 0 ? radius : 6;
            break;
          case 'input':
            fill = '#FFFFFF';
            stroke = '#9CA3AF';
            strokeWidth = 1;
            radius = 4;
            break;
          case 'image':
            fill = '#F3F4F6';
            stroke = '#D1D5DB';
            strokeWidth = 1;
            radius = 4;
            break;
          case 'avatar':
            fill = '#E5E7EB';
            stroke = '#9CA3AF';
            strokeWidth = 1;
            radius = Math.round(Math.min(elWidth, elHeight) / 2);
            break;
          case 'card':
            fill = '#FFFFFF';
            stroke = '#E5E7EB';
            strokeWidth = 1;
            radius = radius > 0 ? radius : 8;
            break;
          case 'navbar':
            fill = '#FFFFFF';
            stroke = '#E5E7EB';
            strokeWidth = 1;
            radius = 0;
            break;
          case 'icon':
            fill = '#F3F4F6';
            stroke = '#9CA3AF';
            strokeWidth = 1.5;
            radius = 4;
            break;
          case 'badge':
            fill = '#F3F4F6';
            stroke = '#D1D5DB';
            strokeWidth = 1;
            radius = 999;
            break;
          case 'divider':
            fill = '#E5E7EB';
            stroke = '#E5E7EB';
            strokeWidth = 1;
            radius = 0;
            break;
          case 'container':
            fill = '#FAFAFA';
            stroke = '#E5E7EB';
            strokeWidth = 1;
            radius = 0;
            break;
        }

        const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `elem-${index + 1}`;
        const label = typeof item.label === 'string' && item.label.trim() ? item.label.trim() : undefined;

        return {
          id,
          type,
          x,
          y,
          width: elWidth,
          height: elHeight,
          label,
          lines,
          radius,
          fill,
          stroke,
          strokeWidth,
          zIndex,
        };
      })
      // Ensure unique IDs
      .map((el, idx, arr) => {
        const isDuplicate = arr.slice(0, idx).some((other) => other.id === el.id);
        if (isDuplicate) {
          return { ...el, id: `${el.id}-${idx}` };
        }
        return el;
      });

    // Sort by zIndex ascending
    sanitizedElements.sort((a, b) => a.zIndex - b.zIndex);

    const wireframe: WireframeDocument = {
      version: '1.0',
      canvasWidth,
      canvasHeight,
      elements: sanitizedElements,
      sourceImageName: typeof sourceName === 'string' ? sourceName : 'screenshot',
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      wireframe,
    });
  } catch (err: unknown) {
    console.error('Error generating wireframe with Gemini:', err);
    const message = err instanceof Error ? err.message : 'Unknown error during wireframe generation';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
