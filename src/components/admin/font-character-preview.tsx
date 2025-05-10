"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface FontCharacterPreviewProps {
  fontName: string;
  language: string;
  characters: string[];
}

const PREFERRED_COLS = 15; // Adjust as needed for character preview

export function FontCharacterPreview({ fontName, language, characters }: FontCharacterPreviewProps) {
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

  // Note: Applying the actual uploaded font dynamically for preview is complex
  // and typically involves creating dynamic @font-face rules or using Font Loading API.
  // For simplicity, this preview will use system/default fonts for rendering characters.
  // The `fontName` is for display information.

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle>Font Character Preview</CardTitle>
          {fontName && <Badge variant="secondary" className="text-sm">Font: {fontName}</Badge>}
        </div>
        <CardDescription>
          Displaying {totalCharacters > 0 ? `${totalCharacters} unique printable characters` : "no characters (or error during parsing)"} found in the font for language: {language}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {totalCharacters > 0 ? (
          <ScrollArea className="w-full h-[60vh] md:h-[70vh] border rounded-md p-1">
            <div
              className="grid p-2 gap-0.5" // Small gap to distinguish cells
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
                     // Applying a specific font for Nepali characters if the language is Nepali for better rendering.
                     // This doesn't use the uploaded font, but a common system font.
                    fontFamily: language === 'ne' ? "'Noto Sans Devanagari', var(--font-geist-sans), sans-serif" : "var(--font-geist-sans), sans-serif",
                    fontSize: language === 'ne' ? '1.25rem' : '1.1rem', // Larger for complex scripts
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
