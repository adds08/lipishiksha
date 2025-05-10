
"use client";

import { useState } from "react";
import { FontUploadForm, type ParsedFontDetails } from "@/components/admin/font-upload-form";
import { FontCharacterPreview } from "@/components/admin/font-character-preview";
import { SavedFontsDisplay, type SavedFontConfig } from "@/components/admin/saved-fonts-display";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";


export default function FontManagementPage() {
  const [currentFontForPreview, setCurrentFontForPreview] = useState<ParsedFontDetails | null>(null);
  const [savedFonts, setSavedFonts] = useState<SavedFontConfig[]>([]);
  const { toast } = useToast();

  const handleFontProcessed = (details: ParsedFontDetails | null) => {
    setCurrentFontForPreview(details);
  };

  const handleSaveFontConfiguration = (details: ParsedFontDetails, fontFile: File) => {
    // In a real app, here you would upload the fontFile to storage (e.g., Firebase Storage)
    // and save `details` along with the storage path to a database (e.g., Firestore).
    
    // For now, simulate saving by adding to local state.
    // Prevent adding duplicates by font name and language for this simulation
    const existingFont = savedFonts.find(f => f.name === details.name && f.language === details.language);
    if (existingFont) {
      toast({
        title: "Font Exists",
        description: `A font named "${details.name}" for language "${details.language}" is already saved.`,
        variant: "default",
      });
      return;
    }

    const newSavedFont: SavedFontConfig = {
      ...details,
      id: Date.now().toString(), // Simple unique ID for demo
      fileName: fontFile.name,
      fileSize: fontFile.size,
      // In a real app, you'd have a filePath or downloadURL from storage.
      // filePath: "simulated/path/to/" + fontFile.name 
    };

    setSavedFonts(prevFonts => [...prevFonts, newSavedFont]);
    toast({
      title: "Font Configuration Saved",
      description: `"${details.name}" for ${details.language} has been saved (simulated).`,
      variant: "default",
    });
    console.log("Simulated save:", newSavedFont, "Original file:", fontFile);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Font Management</h2>
        <p className="text-muted-foreground">
          Upload OpenType Font (OTF) files, assign a language, preview characters, and save configurations.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle>Upload & Configure Font</CardTitle>
            <CardDescription>Select an OTF file, assign a language, and save the configuration.</CardDescription>
          </CardHeader>
          <CardContent>
            <FontUploadForm 
              onFontProcessed={handleFontProcessed} 
              onSaveConfiguration={handleSaveFontConfiguration} 
            />
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {currentFontForPreview ? (
            <FontCharacterPreview
              fontName={currentFontForPreview.name}
              language={currentFontForPreview.language}
              characters={currentFontForPreview.characters}
            />
          ) : (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Character Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Upload a font and select a language to see its character set displayed here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Separator />

      <SavedFontsDisplay fonts={savedFonts} />

    </div>
  );
}

