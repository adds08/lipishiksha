"use client";

import type { PracticeSheetConfig } from "@/app/generator/page";
import { ScrollArea } from "./ui/scroll-area";
import { NEPALI_ALPHABETS, ENGLISH_ALPHABETS, SUPPORTED_LANGUAGES } from "@/lib/constants";

interface PracticeSheetPreviewProps {
  config: PracticeSheetConfig;
}

const PREFERRED_COLS = 10;

export function PracticeSheetPreview({ config }: PracticeSheetPreviewProps) {
  const { language } = config;

  const alphabetsToDisplay = language === 'ne' ? NEPALI_ALPHABETS : ENGLISH_ALPHABETS;
  const totalAlphabets = alphabetsToDisplay.length;

  if (totalAlphabets === 0) {
    return (
      <div className="mt-6 bg-muted/30 p-4 rounded-md">
        <h3 className="text-lg font-semibold">Practice Sheet Preview</h3>
        <p className="text-muted-foreground">
          No alphabets defined for the selected language, or please select a language.
        </p>
      </div>
    );
  }

  const cols = Math.min(PREFERRED_COLS, totalAlphabets);
  const rows = Math.ceil(totalAlphabets / cols);

  // Screen font size for reference character - fixed small size
  const referenceCharScreenFontSize = language === 'ne' ? 12 : 10;

  const languageName = SUPPORTED_LANGUAGES.find(lang => lang.value === language)?.label || language;
  const sheetTitle = `${languageName} Alphabet Practice`;

  return (
    <div className="printable-area bg-card text-card-foreground p-4 md:p-8 rounded-md shadow-lg">
      <h2 className="text-2xl font-semibold mb-2 text-center">{sheetTitle}</h2>
      <p className="text-sm text-muted-foreground mb-6 text-center">Grid: {rows} rows x {cols} columns</p>
      
      <ScrollArea className="w-full h-[60vh] md:h-[70vh] border rounded-md bg-border"> {/* ScrollArea bg is border color for grid lines */}
        <div
          className="printable-grid p-0" // Grid itself has no padding, bg is set by ScrollArea or overridden for print
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`, // Ensure rows can shrink if needed
            gap: '1px', // This creates the grid lines
            // backgroundColor is handled by parent ScrollArea for screen, and print CSS for print
          }}
        >
          {Array.from({ length: rows * cols }).map((_, index) => {
            const charToDisplay = alphabetsToDisplay[index] || ""; 
            
            return (
              <div
                key={index}
                // Cell has bg-card for screen, print CSS uses white. No cell border, grid gap forms lines.
                className="printable-grid-cell bg-card flex flex-col items-start justify-between p-1" 
                style={{
                  minHeight: '50px', // Minimum height for screen readability/writability
                }}
              >
                {charToDisplay && (
                  <span 
                    className="reference-char text-muted-foreground select-none" // Muted color for screen reference
                    style={{ 
                      fontSize: `${referenceCharScreenFontSize}px`,
                      lineHeight: `1`, // Compact line height
                      fontFamily: language === 'ne' ? "'Noto Sans Devanagari', var(--font-geist-sans), sans-serif" : "var(--font-geist-sans), sans-serif",
                    }}
                  >
                    {charToDisplay}
                  </span>
                )}
                {/* Writing line, pushed to the bottom by justify-between on parent */}
                <div className="writing-line w-full border-t border-dashed border-border/50"></div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
