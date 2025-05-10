
"use client";

import type { PracticeSheetConfig } from "@/app/generator/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { NEPALI_ALPHABETS, ENGLISH_ALPHABETS } from "@/lib/constants";

interface PracticeSheetPreviewProps {
  config: PracticeSheetConfig;
}

const PREFERRED_COLS = 10; // You can adjust this for layout preference

export function PracticeSheetPreview({ config }: PracticeSheetPreviewProps) {
  const { language } = config;

  const alphabetsToDisplay = language === 'ne' ? NEPALI_ALPHABETS : ENGLISH_ALPHABETS;
  const totalAlphabets = alphabetsToDisplay.length;

  if (totalAlphabets === 0) {
    return (
      <Card className="mt-6 bg-muted/30">
        <CardHeader>
          <CardTitle>Practice Sheet Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No alphabets defined for the selected language, or please select a language.
          </p>
        </CardContent>
      </Card>
    );
  }

  const cols = Math.min(PREFERRED_COLS, totalAlphabets); // Don't have more columns than alphabets
  const rows = Math.ceil(totalAlphabets / cols);
  
  const cellWidth = Math.max(50, 800 / Math.max(cols, 10)); 
  const cellHeight = Math.max(50, 600 / Math.max(rows, 10)); 

  const baseFontSize = Math.min(cellWidth, cellHeight) * 0.3;
  const fontSize = language === 'ne' ? Math.max(16, baseFontSize * 1.2) : Math.max(14, baseFontSize);

  const languageName = SUPPORTED_LANGUAGES.find(lang => lang.value === language)?.label || language;
  const sheetTitle = `${languageName} Alphabet Practice`;

  return (
    <div id="printable-area" className="bg-white text-black p-4 md:p-8 rounded-md shadow-lg">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&display=swap');
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
      <h2 className="text-2xl font-semibold mb-2 text-center">{sheetTitle}</h2>
      <p className="text-sm text-gray-600 mb-6 text-center">Grid: {rows} rows x {cols} columns</p>
      
      <ScrollArea className="w-full h-[60vh] md:h-[70vh] border rounded-md">
        <div
          className="printable-grid p-2 bg-white"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, minmax(${cellWidth}px, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(${cellHeight}px, 1fr))`,
            gap: '2px', 
          }}
        >
          {Array.from({ length: rows * cols }).map((_, index) => {
            const charToDisplay = alphabetsToDisplay[index] || ""; // Get char or empty if beyond alphabet length
            
            return (
              <div
                key={index}
                className="printable-grid-cell border border-gray-300 flex flex-col items-center justify-start p-1"
                style={{
                  minWidth: `${cellWidth}px`,
                  minHeight: `${cellHeight}px`,
                }}
              >
                {charToDisplay && (
                  <span 
                    className="text-gray-500 select-none"
                    style={{ 
                      fontSize: `${fontSize}px`,
                      lineHeight: `${fontSize * 1.2}px`,
                      fontFamily: language === 'ne' ? "'Noto Sans Devanagari', var(--font-geist-sans), sans-serif" : "var(--font-geist-sans), sans-serif",
                    }}
                  >
                    {charToDisplay}
                  </span>
                )}
                <div className="flex-grow w-full mt-1 border-t border-dashed border-gray-200"></div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

// Helper to find language label (can be moved to utils if needed elsewhere)
const SUPPORTED_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ne', label: 'Nepali' },
];
