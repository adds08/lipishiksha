
"use client";

import React, { useEffect, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";

interface PracticeSheetPreviewProps {
  language: string; // e.g. "ne", "en" -> this is assignedLanguage from DB
  fontName: string; // e.g. "Preeti", "Arial"
  characters: string[];
  fontFileUrl: string | null;
}

const PREFERRED_COLS = 8; 

export function PracticeSheetPreview({ 
  language, 
  fontName, 
  characters, 
  fontFileUrl 
}: PracticeSheetPreviewProps) {
  const [dynamicFontFamily, setDynamicFontFamily] = useState<string | null>(null);
  const [fontStyleTag, setFontStyleTag] = useState<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (fontStyleTag && fontStyleTag.parentNode) {
      fontStyleTag.parentNode.removeChild(fontStyleTag);
      setFontStyleTag(null);
    }
    setDynamicFontFamily(null);

    if (fontFileUrl && fontName) {
      const uniqueFontFamily = `GenSheet_${fontName.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`;
      
      let fontFormat = '';
      if (fontFileUrl.toLowerCase().endsWith('.otf')) {
        fontFormat = 'opentype';
      } else if (fontFileUrl.toLowerCase().endsWith('.ttf')) {
        fontFormat = 'truetype';
      }


      if (!fontFormat && fontFileUrl) { 
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
  
  const referenceCharScreenFontSize = language.toLowerCase() === 'ne' || language.toLowerCase() === 'nepali' ? '18px' : '16px'; 

  const currentFontFamilyToApply = dynamicFontFamily || 
                                 (language.toLowerCase() === 'ne' || language.toLowerCase() === 'nepali' && !dynamicFontFamily ? "'Noto Sans Devanagari', var(--font-geist-sans), sans-serif" 
                                                    : "var(--font-geist-sans), sans-serif");
  
  return (
    <div className="printable-area bg-card text-card-foreground p-4 md:p-6 rounded-md shadow-lg">
      <h2 className="text-xl md:text-2xl font-semibold mb-1 text-center">Handwriting Practice Sheet</h2>
      {fontName && (
        <p className="text-lg md:text-xl text-muted-foreground mb-1 text-center">
          Font: {fontName}
        </p>
      )}
      <p className="text-xs md:text-sm text-muted-foreground mb-4 text-center">
        Language: {language} | Grid: {rows} rows x {cols} columns
      </p>
      
      <ScrollArea className="w-full h-[60vh] md:h-[70vh] border rounded-md bg-card"> 
        <div
          className="printable-grid p-0" 
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridAutoRows: `minmax(70px, auto))`, 
          }}
        >
          {Array.from({ length: rows * cols }).map((_, index) => {
            const charToDisplay = characters[index] || ""; 
            
            return (
              <div
                key={index}
                className="printable-grid-cell bg-card flex flex-col items-start justify-start p-2 border border-border" 
                style={{
                  minHeight: '70px', 
                }}
              >
                {charToDisplay && (
                  <span 
                    className="reference-char text-muted-foreground select-none" 
                    style={{ 
                      fontSize: referenceCharScreenFontSize,
                      fontWeight: 600, 
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
                  style={{minHeight: '40px'}} 
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

