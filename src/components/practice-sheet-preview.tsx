
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
      
      {/* Changed ScrollArea background from bg-border to bg-card for a white background on screen */}
      <ScrollArea className="w-full h-[60vh] md:h-[70vh] border rounded-md bg-card"> 
        <div
          className="printable-grid p-0" 
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`, 
            // Removed gap: '1px', cell borders will define the grid structure
          }}
        >
          {Array.from({ length: rows * cols }).map((_, index) => {
            const charToDisplay = alphabetsToDisplay[index] || ""; 
            
            return (
              <div
                key={index}
                // Cell has bg-card for screen. Added border for screen visibility.
                // Changed justify-between to justify-start to align content at the top.
                className="printable-grid-cell bg-card flex flex-col items-start justify-start p-1 border border-dashed border-border" 
                style={{
                  minHeight: '50px', // Minimum height for screen readability/writability
                }}
              >
                {charToDisplay && (
                  <span 
                    className="reference-char text-muted-foreground select-none" 
                    style={{ 
                      fontSize: `${referenceCharScreenFontSize}px`,
                      lineHeight: `1`, 
                      fontFamily: language === 'ne' ? "'Noto Sans Devanagari', var(--font-geist-sans), sans-serif" : "var(--font-geist-sans), sans-serif",
                      // Reference character will be at the top-left due to parent's flex settings
                    }}
                  >
                    {charToDisplay}
                  </span>
                )}
                {/* Writing line div is removed. Cell itself provides writing space. */}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

