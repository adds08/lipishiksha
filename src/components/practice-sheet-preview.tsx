
"use client";

import React, { useEffect, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";

interface PracticeSheetPreviewProps {
  language: string; // e.g. "ne", "en"
  fontName: string; // e.g. "Preeti", "Arial"
  characters: string[];
  fontFileUrl: string | null;
}

const PREFERRED_COLS = 10;

export function PracticeSheetPreview({ 
  language, 
  fontName, 
  characters, 
  fontFileUrl 
}: PracticeSheetPreviewProps) {
  const [dynamicFontFamily, setDynamicFontFamily] = useState<string | null>(null);
  const [fontStyleTag, setFontStyleTag] = useState<HTMLStyleElement | null>(null);

  useEffect(() => {
    // Cleanup previous font style tag if any
    if (fontStyleTag && fontStyleTag.parentNode) {
      fontStyleTag.parentNode.removeChild(fontStyleTag);
      setFontStyleTag(null);
    }
    setDynamicFontFamily(null);

    if (fontFileUrl && fontName) {
      const uniqueFontFamily = `GenSheet_${fontName.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`;
      
      // Basic format detection from URL extension (less reliable) or assume based on common types
      let fontFormat = '';
      if (fontFileUrl.toLowerCase().endsWith('.otf')) fontFormat = 'opentype';
      else if (fontFileUrl.toLowerCase().endsWith('.ttf')) fontFormat = 'truetype';
      // Add more formats if needed (woff, woff2)

      if (!fontFormat) {
        console.warn("Could not determine font format for preview from URL:", fontFileUrl);
        // Proceed without custom font or try a default
      }

      const fontFaceRule = `
        @font-face {
          font-family: "${uniqueFontFamily}";
          src: url("${fontFileUrl}") ${fontFormat ? `format("${fontFormat}")` : ''};
        }
      `;

      const newStyleTag = document.createElement('style');
      newStyleTag.textContent = fontFaceRule;
      document.head.appendChild(newStyleTag);

      setFontStyleTag(newStyleTag);
      setDynamicFontFamily(uniqueFontFamily);
    }

    return () => {
      if (fontStyleTag && fontStyleTag.parentNode) { // Check current closure's styleTag
        fontStyleTag.parentNode.removeChild(fontStyleTag);
      }
    };
  }, [fontFileUrl, fontName]); // Re-run if fontFileUrl or fontName changes

  const totalAlphabets = characters.length;

  if (totalAlphabets === 0) {
    return (
      <div className="mt-6 bg-muted/30 p-4 rounded-md">
        <h3 className="text-lg font-semibold">Practice Sheet Preview</h3>
        <p className="text-muted-foreground">
          No characters available for the selected font, or please select a language/font.
        </p>
      </div>
    );
  }

  const cols = Math.min(PREFERRED_COLS, totalAlphabets);
  const rows = Math.ceil(totalAlphabets / cols);

  const referenceCharScreenFontSize = language === 'ne' ? 12 : 10; // Keep language-specific sizing

  // Use dynamicFontFamily if available, otherwise fallback or use a generic sans-serif
  const currentFontFamilyToApply = dynamicFontFamily || 
                                 (language === 'ne' && !dynamicFontFamily ? "'Noto Sans Devanagari', var(--font-geist-sans), sans-serif" 
                                                    : "var(--font-geist-sans), sans-serif");
  
  const sheetTitle = `${fontName || language} Alphabet Practice`;

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
            const charToDisplay = characters[index] || ""; 
            
            return (
              <div
                key={index}
                className="printable-grid-cell bg-card flex flex-col items-start justify-start p-1 border border-border" 
                style={{
                  minHeight: '60px',
                }}
              >
                {charToDisplay && (
                  <span 
                    className="reference-char text-muted-foreground select-none" 
                    style={{ 
                      fontSize: `${referenceCharScreenFontSize}px`,
                      lineHeight: `1`, 
                      fontFamily: currentFontFamilyToApply,
                      marginBottom: '4px',
                    }}
                  >
                    {charToDisplay}
                  </span>
                )}
                <div 
                  className="writing-area-dotted w-full flex-grow border border-dashed border-gray-300"
                  style={{minHeight: '30px'}} 
                >
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
