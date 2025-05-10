
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
  
  // Approximate cell dimensions for screen display - print styles will override for actual printing
  const screenCellWidth = Math.max(50, 800 / Math.max(cols, 10)); 
  const screenCellHeight = Math.max(50, 600 / Math.max(rows, 10)); 

  const baseFontSize = Math.min(screenCellWidth, screenCellHeight) * 0.3;
  const fontSize = language === 'ne' ? Math.max(16, baseFontSize * 1.2) : Math.max(14, baseFontSize);

  const languageName = SUPPORTED_LANGUAGES.find(lang => lang.value === language)?.label || language;
  const sheetTitle = `${languageName} Alphabet Practice`;

  return (
    // Changed id to className, removed inline styles handled by global print CSS
    <div className="printable-area bg-card text-card-foreground p-4 md:p-8 rounded-md shadow-lg">
      {/* Removed <style jsx global> block, styles moved to globals.css */}
      <h2 className="text-2xl font-semibold mb-2 text-center">{sheetTitle}</h2>
      <p className="text-sm text-muted-foreground mb-6 text-center">Grid: {rows} rows x {cols} columns</p>
      
      {/* ScrollArea is for screen view; print CSS will make its content flow */}
      <ScrollArea className="w-full h-[60vh] md:h-[70vh] border rounded-md">
        <div
          className="printable-grid p-2 bg-card" // bg-card for screen, print CSS uses bg-white
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, minmax(${screenCellWidth}px, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(${screenCellHeight}px, 1fr))`,
            gap: '2px', 
          }}
        >
          {Array.from({ length: rows * cols }).map((_, index) => {
            const charToDisplay = alphabetsToDisplay[index] || ""; 
            
            return (
              <div
                key={index}
                className="printable-grid-cell border border-border flex flex-col items-center justify-start p-1"
                style={{
                  // Screen-specific min dimensions, print CSS will override cell size if needed
                  minWidth: `${screenCellWidth}px`,
                  minHeight: `${screenCellHeight}px`,
                }}
              >
                {charToDisplay && (
                  <span 
                    className="text-foreground select-none" // Use foreground for screen, print CSS will make it black
                    style={{ 
                      fontSize: `${fontSize}px`,
                      lineHeight: `${fontSize * 1.2}px`,
                      // Apply Noto Sans Devanagari for Nepali, otherwise use theme default
                      fontFamily: language === 'ne' ? "'Noto Sans Devanagari', var(--font-geist-sans), sans-serif" : "var(--font-geist-sans), sans-serif",
                    }}
                  >
                    {charToDisplay}
                  </span>
                )}
                <div className="flex-grow w-full mt-1 border-t border-dashed border-border/50"></div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
