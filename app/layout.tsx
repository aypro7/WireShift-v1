import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'WireShift — UI Screenshot to Editable Wireframe',
  description: 'Convert uploaded UI screenshots into editable low-fidelity vector wireframes using Gemini multimodal vision.',
  openGraph: {
    title: 'WireShift — UI Screenshot to Editable Wireframe',
    description: 'Convert uploaded UI screenshots into editable low-fidelity vector wireframes using Gemini multimodal vision.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WireShift — UI Screenshot to Editable Wireframe',
    description: 'Convert uploaded UI screenshots into editable low-fidelity vector wireframes using Gemini multimodal vision.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
