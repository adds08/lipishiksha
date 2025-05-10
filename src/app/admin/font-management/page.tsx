"use client";

import { useState } from "react";
import { FontUploadForm, type ParsedFontDetails } from "@/components/admin/font-upload-form";
import { FontCharacterPreview } from "@/components/admin/font-character-preview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FontManagementPage() {
  const [parsedFont, setParsedFont] = useState<ParsedFontDetails | null>(null);

  const handleFontParsed = (details: ParsedFontDetails) => {
    setParsedFont(details);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Font Management</h2>
        <p className="text-muted-foreground">
          Upload OpenType Font (OTF) files, assign a language, and preview the characters available in the font.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle>Upload Font</CardTitle>
            <CardDescription>Select an OTF file and assign a language.</CardDescription>
          </CardHeader>
          <CardContent>
            <FontUploadForm onFontParsed={handleFontParsed} />
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {parsedFont ? (
            <FontCharacterPreview
              fontName={parsedFont.name}
              language={parsedFont.language}
              characters={parsedFont.characters}
            />
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
