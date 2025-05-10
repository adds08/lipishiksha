"use client";

import type { PracticeSheetConfig } from "@/app/generator/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "./ui/scroll-area";

interface PracticeSheetPreviewProps {
  config: PracticeSheetConfig;
}

export function PracticeSheetPreview({ config }: PracticeSheetPreviewProps) {
  const { character, rows, cols, language } = config;

  // Basic validation for display
  if (!character || rows <= 0 || cols <= 0) {
    return (
      <Card className="mt-6 bg-muted/30">
        <CardHeader>
          <CardTitle>Practice Sheet Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please configure the sheet settings to see a preview.</p>
        </CardContent>
      </Card>
    );
  }
  
  const cellWidth = Math.max(50, 800 / Math.max(cols, 10)); // Ensure minimum width, adapt to column count
  const cellHeight = Math.max(50, 600 / Math.max(rows, 10)); // Ensure minimum height

  // Dynamic font size based on cell size, more responsive for Nepali characters
  const baseFontSize = Math.min(cellWidth, cellHeight) * 0.3;
  const fontSize = language === 'ne' ? Math.max(16, baseFontSize * 1.2) : Math.max(14, baseFontSize); // Nepali chars might need to be larger

  return (
    <div id="printable-area" className="bg-white text-black p-4 md:p-8 rounded-md shadow-lg">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            margin: 0;
            padding: 10mm; /* Adjust print padding */
            box-shadow: none;
            border: none;
          }
          .no-print {
            display: none !important;
          }
          .printable-grid-cell {
            border: 1px solid #ccc !important; /* Ensure borders are visible */
            page-break-inside: avoid;
          }
          .printable-grid {
            display: grid !important; /* Ensure grid layout prints */
          }
        }
      `}</style>
      <h2 className="text-2xl font-semibold mb-2 text-center">Handwriting Practice: {character}</h2>
      <p className="text-sm text-gray-600 mb-6 text-center">Language: {language === 'ne' ? 'Nepali' : 'English'} | Grid: {rows} x {cols}</p>
      
      <ScrollArea className="w-full h-[60vh] md:h-[70vh] border rounded-md">
        <div
          className="printable-grid p-2 bg-white" // Added p-2 for some internal padding in view mode
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, minmax(${cellWidth}px, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(${cellHeight}px, 1fr))`,
            gap: '2px', // Small gap for visual separation, border will handle print separation
            // aspectRatio: `${cols / rows}`, // Maintain aspect ratio if desired, might be tricky with scroll
          }}
        >
          {Array.from({ length: rows * cols }).map((_, index) => (
            <div
              key={index}
              className="printable-grid-cell border border-gray-300 flex flex-col items-center justify-start p-1"
              style={{
                minWidth: `${cellWidth}px`,
                minHeight: `${cellHeight}px`,
              }}
            >
              <span 
                className="text-gray-500 select-none"
                style={{ 
                  fontSize: `${fontSize}px`,
                  lineHeight: `${fontSize * 1.2}px`, // Adjust line height based on font size
                  fontFamily: language === 'ne' ? 'Noto Sans Devanagari, sans-serif' : 'var(--font-geist-sans), sans-serif', // Specify Nepali font
                }}
              >
                {character}
              </span>
              {/* Empty space below for writing */}
              <div className="flex-grow w-full mt-1 border-t border-dashed border-gray-200"></div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
