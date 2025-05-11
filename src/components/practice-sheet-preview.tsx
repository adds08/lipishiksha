
"use client";

import React, { useEffect, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import Image from "next/image";

interface PracticeSheetPreviewProps {
  language: string;
  fontName: string;
  characters: string[];
  fontFileUrl: string | null;
}

const PREFERRED_COLS = 8;
// Estimate based on 8 cols, and aiming for ~10-12 rows per A4 page.
// (8 cols * 10 rows = 80 chars). This is a rough guide.
const CHARS_PER_PAGE_ESTIMATE = 80; 

export function PracticeSheetPreview({ 
  language, 
  fontName, 
  characters, 
  fontFileUrl 
}: PracticeSheetPreviewProps) {
  const [dynamicFontFamily, setDynamicFontFamily] = useState<string | null>(null);
  const [fontStyleTag, setFontStyleTag] = useState<HTMLStyleElement | null>(null);

  useEffect(() => {
    // Cleanup previous font style tag
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
          font-display: swap;
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

  const totalCharacters = characters.length;

  if (totalCharacters === 0) {
    return (
      <div className="mt-6 bg-muted/30 p-4 rounded-md printable-area">
        <h3 className="text-lg font-semibold">Practice Sheet Preview</h3>
        <p className="text-muted-foreground">
          No characters available for the selected font, or please select a language/font.
        </p>
      </div>
    );
  }
  
  const pagesOfCharacters: string[][] = [];
  if (totalCharacters > 0) {
    for (let i = 0; i < totalCharacters; i += CHARS_PER_PAGE_ESTIMATE) {
      pagesOfCharacters.push(characters.slice(i, i + CHARS_PER_PAGE_ESTIMATE));
    }
  }
  const totalPages = pagesOfCharacters.length || 1;

  const currentFontFamilyToApply = dynamicFontFamily || 
                                 (language.toLowerCase() === 'ne' || language.toLowerCase() === 'nepali' && !dynamicFontFamily ? "'Noto Sans Devanagari', var(--font-geist-sans), sans-serif" 
                                                    : "var(--font-geist-sans), sans-serif");
  
  const referenceCharScreenFontSize = language.toLowerCase() === 'ne' || language.toLowerCase() === 'nepali' ? '18px' : '16px'; 

  return (
    <div className="printable-area bg-card text-card-foreground p-0 md:p-2 rounded-md shadow-lg">
      <ScrollArea className="w-full h-[60vh] md:h-[70vh] border-none rounded-md bg-card"> 
        {pagesOfCharacters.map((pageChars, pageIndex) => {
          const currentPageCharsCount = pageChars.length;
          const rowsOnThisPage = currentPageCharsCount > 0 ? Math.ceil(currentPageCharsCount / PREFERRED_COLS) : 0;
          const qrData = `Page: ${pageIndex + 1}/${totalPages} | Language: ${language} | Font: ${fontName}`;

          return (
            <div key={pageIndex} className="print-page-container bg-white"> {/* Ensure white background for print page */}
              <div className="print-page-header-qr-wrapper">
                <div className="print-page-header">
                  <h2 className="text-lg font-semibold">Handwriting Practice: {fontName}</h2>
                  <p className="text-xs text-muted-foreground">
                    Language: {language} | Page {pageIndex + 1} of {totalPages}
                  </p>
                </div>
                <div className="print-page-qr">
                  <Image 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(qrData)}`} 
                    alt={`QR Code for Page ${pageIndex + 1}`} 
                    width={60} 
                    height={60} 
                    data-ai-hint="qr code sheet"
                  />
                </div>
              </div>
              
              {currentPageCharsCount > 0 ? (
                <div
                  className="printable-grid p-0 mt-2" 
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${PREFERRED_COLS}, 1fr)`,
                    gridAutoRows: `minmax(60px, auto))`, // Adjusted min height for cell
                  }}
                >
                  {/* Ensure we only map over enough cells for characters on this page */}
                  {Array.from({ length: rowsOnThisPage * PREFERRED_COLS }).map((_, cellIndex) => {
                    const charToDisplay = pageChars[cellIndex] || ""; 
                    
                    return (
                      <div
                        key={cellIndex}
                        className="printable-grid-cell bg-card flex flex-col items-start justify-start p-1.5 border border-border" 
                        style={{
                          minHeight: '60px', 
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
                              marginBottom: '3mm', 
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
              ) : (
                <p className="text-muted-foreground p-4">No characters for this page.</p>
              )}
            </div>
          );
        })}
      </ScrollArea>
    </div>
  );
}
