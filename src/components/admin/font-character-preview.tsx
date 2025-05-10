
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface FontCharacterPreviewProps {
  fontName: string;
  language: string;
  characters: string[];
  fontFile: File | null;
}

const PREFERRED_COLS = 15;

export function FontCharacterPreview({ fontName, language, characters, fontFile }: FontCharacterPreviewProps) {
  const [dynamicFontFamily, setDynamicFontFamily] = useState<string | null>(null);
  const [fontObjectUrl, setFontObjectUrl] = useState<string | null>(null);
  const [fontStyleTag, setFontStyleTag] = useState<HTMLStyleElement | null>(null);

  useEffect(() => {
    // Cleanup previous font if any
    if (fontObjectUrl) {
      URL.revokeObjectURL(fontObjectUrl);
      setFontObjectUrl(null);
    }
    if (fontStyleTag && fontStyleTag.parentNode) {
      fontStyleTag.parentNode.removeChild(fontStyleTag);
      setFontStyleTag(null);
    }
    setDynamicFontFamily(null);

    if (fontFile && fontName) {
      const objectURL = URL.createObjectURL(fontFile);
      // Create a unique font-family name for this preview instance to avoid collisions
      const uniqueFontFamily = `Preview_${fontName.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`;
      
      const fontFormat = fontFile.type === 'font/otf' ? 'opentype' :
                         fontFile.type === 'font/ttf' ? 'truetype' :
                         fontFile.name.toLowerCase().endsWith('.otf') ? 'opentype' : 
                         fontFile.name.toLowerCase().endsWith('.ttf') ? 'truetype' : '';

      if (!fontFormat) {
        console.warn("Could not determine font format for preview.");
        URL.revokeObjectURL(objectURL);
        return;
      }

      const fontFaceRule = `
        @font-face {
          font-family: "${uniqueFontFamily}";
          src: url("${objectURL}") format("${fontFormat}");
        }
      `;

      const styleTag = document.createElement('style');
      styleTag.textContent = fontFaceRule;
      document.head.appendChild(styleTag);

      setFontObjectUrl(objectURL);
      setFontStyleTag(styleTag);
      setDynamicFontFamily(uniqueFontFamily);
    }

    return () => {
      // This cleanup runs when the component unmounts or dependencies change before effect runs again
      if (fontObjectUrl) { // Check state variable at the time of cleanup closure
        URL.revokeObjectURL(fontObjectUrl);
      }
      if (fontStyleTag && fontStyleTag.parentNode) {
        fontStyleTag.parentNode.removeChild(fontStyleTag);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontFile, fontName]); // fontName is part of the unique name generation

  const totalCharacters = characters.length;

  if (totalCharacters === 0 && !fontName) {
     return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Character Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Upload a font to see its character set displayed here.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const cols = Math.min(PREFERRED_COLS, totalCharacters > 0 ? totalCharacters : PREFERRED_COLS);
  const rows = totalCharacters > 0 ? Math.ceil(totalCharacters / cols) : 1;

  const currentFontFamilyToApply = dynamicFontFamily || 
                                 (language === 'ne' ? "'Noto Sans Devanagari', var(--font-geist-sans), sans-serif" 
                                                    : "var(--font-geist-sans), sans-serif");

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle>Font Character Preview</CardTitle>
          {fontName && <Badge variant="secondary" className="text-sm">Font: {fontName}</Badge>}
        </div>
        <CardDescription>
          Displaying {totalCharacters > 0 ? `${totalCharacters} unique printable characters` : "no characters (or error during parsing)"} found in the font for language: {language}.
          {dynamicFontFamily && <span className="block text-xs"> (Previewing with uploaded font)</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {totalCharacters > 0 ? (
          <ScrollArea className="w-full h-[60vh] md:h-[70vh] border rounded-md p-1">
            <div
              className="grid p-2 gap-0.5"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, minmax(40px, auto))`,
              }}
            >
              {characters.map((char, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center border border-border bg-card p-1 aspect-square"
                  title={`Char: ${char} (U+${char.charCodeAt(0).toString(16).toUpperCase()})`}
                  style={{
                    fontFamily: currentFontFamilyToApply,
                    fontSize: language === 'ne' ? '1.25rem' : '1.1rem',
                  }}
                >
                  {char}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-muted-foreground">
            {fontName ? "No displayable characters found or error during parsing." : "Upload a font to preview its characters."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
