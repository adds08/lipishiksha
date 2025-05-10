
"use client";

import React, { useEffect, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";

interface PracticeSheetPreviewProps {
  language: string; // e.g. "ne", "en"
  fontName: string; // e.g. "Preeti", "Arial"
  characters: string[];
  fontFileUrl: string | null;
}

const PREFERRED_COLS = 8; // Changed from 10 to 8

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
      
      let fontFormat = '';
      if (fontFileUrl.toLowerCase().endsWith('.otf')) fontFormat = 'opentype';
      else if (fontFileUrl.toLowerCase().endsWith('.ttf')) fontFormat = 'truetype';

      if (!fontFormat) {
        console.warn("Could not determine font format for preview from URL:", fontFileUrl);
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
      if (fontStyleTag && fontStyleTag.parentNode) { 
        fontStyleTag.parentNode.removeChild(fontStyleTag);
      }
    };
  }, [fontFileUrl, fontName]); 

  const totalAlphabets = characters.length;

  if (totalAlphabets === 0) {
    return (
      <div className="mt-6 bg-muted/30 p-4 rounded-md printable-area">
        <h3 className="text-lg font-semibold">Practice Sheet Preview</h3>
        <p className="text-muted-foreground">
          No characters available for the selected font, or please select a language/font.
        </p>
      </div>
    );
  }

  const cols = Math.min(PREFERRED_COLS, totalAlphabets > 0 ? totalAlphabets : PREFERRED_COLS);
  const rows = totalAlphabets > 0 ? Math.ceil(totalAlphabets / cols) : 0;
  
  // Adjusted font size for reference characters
  const referenceCharScreenFontSize = language === 'ne' ? 14 : 12; 

  const currentFontFamilyToApply = dynamicFontFamily || 
                                 (language === 'ne' && !dynamicFontFamily ? "'Noto Sans Devanagari', var(--font-geist-sans), sans-serif" 
                                                    : "var(--font-geist-sans), sans-serif");
  
  const sheetTitle = `${fontName || language} Character Practice`; // Changed "Alphabet" to "Character"

  return (
    <div className="printable-area bg-card text-card-foreground p-4 md:p-6 rounded-md shadow-lg"> {/* Adjusted padding */}
      <h2 className="text-xl md:text-2xl font-semibold mb-1 text-center">{sheetTitle}</h2>
      <p className="text-xs md:text-sm text-muted-foreground mb-4 text-center">Grid: {rows} rows x {cols} columns</p>
      
      <ScrollArea className="w-full h-[60vh] md:h-[70vh] border rounded-md bg-card"> 
        <div
          className="printable-grid p-0" 
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            // Rows will be sized by content, or ensure minmax allows for growth
            gridAutoRows: `minmax(70px, auto)`, // Ensure rows have a minimum height
          }}
        >
          {Array.from({ length: rows * cols }).map((_, index) => {
            const charToDisplay = characters[index] || ""; 
            
            return (
              <div
                key={index}
                className="printable-grid-cell bg-card flex flex-col items-start justify-start p-1.5 border border-border" 
                style={{
                  minHeight: '70px', // Increased minHeight for larger cells
                }}
              >
                {charToDisplay && (
                  <span 
                    className="reference-char text-muted-foreground select-none" 
                    style={{ 
                      fontSize: `${referenceCharScreenFontSize}px`,
                      lineHeight: `1`, 
                      fontFamily: currentFontFamilyToApply,
                      marginBottom: '4px', // Space between ref char and dotted box
                    }}
                  >
                    {charToDisplay}
                  </span>
                )}
                <div 
                  className="writing-area-dotted w-full flex-grow border border-dashed border-gray-300"
                  style={{minHeight: '40px'}} // Increased minHeight for writing area
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
