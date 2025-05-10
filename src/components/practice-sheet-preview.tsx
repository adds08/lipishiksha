
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

  const referenceCharScreenFontSize = language === 'ne' ? 12 : 10;

  const languageName = SUPPORTED_LANGUAGES.find(lang => lang.value === language)?.label || language;
  const sheetTitle = `${languageName} Alphabet Practice`;

  return (
    <div className="printable-area bg-card text-card-foreground p-4 md:p-8 rounded-md shadow-lg">
      <h2 className="text-2xl font-semibold mb-2 text-center">{sheetTitle}</h2>
      <p className="text-sm text-muted-foreground mb-6 text-center">Grid: {rows} rows x {cols} columns</p>
      
      <ScrollArea className="w-full h-[60vh] md:h-[70vh] border rounded-md bg-card"> 
        <div
          className="printable-grid p-0" 
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`, 
          }}
        >
          {Array.from({ length: rows * cols }).map((_, index) => {
            const charToDisplay = alphabetsToDisplay[index] || ""; 
            
            return (
              <div
                key={index}
                // Screen: Cell with solid border. Print: Overridden by globals.css for table-like cells.
                className="printable-grid-cell bg-card flex flex-col items-start justify-start p-1 border border-border" 
                style={{
                  minHeight: '60px', // Increased min height for screen readability/writability with inner box
                }}
              >
                {charToDisplay && (
                  <span 
                    className="reference-char text-muted-foreground select-none" 
                    style={{ 
                      fontSize: `${referenceCharScreenFontSize}px`,
                      lineHeight: `1`, 
                      fontFamily: language === 'ne' ? "'Noto Sans Devanagari', var(--font-geist-sans), sans-serif" : "var(--font-geist-sans), sans-serif",
                      marginBottom: '4px', // Small space between ref char and writing area on screen
                    }}
                  >
                    {charToDisplay}
                  </span>
                )}
                {/* This div will be the dotted box for writing, primarily styled for print */}
                <div 
                  className="writing-area-dotted w-full flex-grow border border-dashed border-gray-300" // Basic screen style for the dotted area
                  style={{minHeight: '30px'}} // Minimum height for the writing area on screen
                >
                  {/* Content for writing area (e.g., guidelines) could go here if needed, but usually empty */}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

