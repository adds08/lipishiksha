
"use client";

import { useState } from "react";
import { useQuery, useMutation, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FontUploadForm, type ParsedFontDetails } from "@/components/admin/font-upload-form";
import { FontCharacterPreview } from "@/components/admin/font-character-preview";
import { SavedFontsDisplay, type SavedFontDisplayData } from "@/components/admin/saved-fonts-display";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { getSavedFontConfigurations, saveFontConfiguration, uploadFontFile, type SavedFontConfig } from "@/lib/font-data-service";
import { Loader2 } from "lucide-react";

// Create a client
const queryClient = new QueryClient();

function FontManagementPageContent() {
  const [currentFontForPreview, setCurrentFontForPreview] = useState<ParsedFontDetails | null>(null);
  const [currentFontFileForPreview, setCurrentFontFileForPreview] = useState<File | null>(null);
  const { toast } = useToast();

  const { data: savedFontsData, isLoading: isLoadingFonts, error: fontsError, refetch: refetchFonts } = useQuery<SavedFontConfig[], Error, SavedFontDisplayData[]>({
    queryKey: ['savedFonts'],
    queryFn: getSavedFontConfigurations, // Uses SQLite now
    select: (data: SavedFontConfig[]) => data.map(font => ({
      id: font.id,
      name: font.name,
      assignedLanguage: font.assignedLanguage,
      fileName: font.fileName,
      fileSize: font.fileSize, // Already a number after service layer transformation
      characterCount: font.characters.length,
      createdAt: font.createdAt, // Already a Date object from service layer
      characters: font.characters,
      storagePath: font.storagePath,
      downloadURL: font.downloadURL,
    })),
  });

  const saveFontMutation = useMutation({
    mutationFn: async ({ details, fontFile }: { details: ParsedFontDetails, fontFile: File }) => {
      const { storagePath, downloadURL } = await uploadFontFile(fontFile);
      const newFontId = await saveFontConfiguration(details, fontFile, storagePath, downloadURL); // Uses SQLite now
      return { newFontId, name: details.name, language: details.language };
    },
    onSuccess: (data) => {
      toast({
        title: "Font Configuration Saved",
        description: `"${data.name}" for ${data.language} has been saved to the database.`,
        variant: "default",
      });
      refetchFonts(); 
      setCurrentFontForPreview(null);
      setCurrentFontFileForPreview(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Save Font",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });


  const handleFontProcessed = (details: ParsedFontDetails | null, file: File | null) => {
    setCurrentFontForPreview(details);
    setCurrentFontFileForPreview(file);
  };

  const handleSaveFontConfiguration = (details: ParsedFontDetails, fontFile: File) => {
    saveFontMutation.mutate({ details, fontFile });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Font Management</h2>
        <p className="text-muted-foreground">
          Upload OpenType Font (OTF) files, assign a language, preview characters, and save configurations to the database.
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
              isSaving={saveFontMutation.isPending}
            />
             {saveFontMutation.isPending && (
              <div className="mt-4 flex items-center text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Saving font configuration to database...</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {currentFontForPreview && currentFontFileForPreview ? (
            <FontCharacterPreview
              fontName={currentFontForPreview.name}
              language={currentFontForPreview.language}
              characters={currentFontForPreview.characters}
              fontFile={currentFontFileForPreview}
            />
          ) : (
             <FontCharacterPreview
              fontName={currentFontForPreview?.name || ""}
              language={currentFontForPreview?.language || ""}
              characters={currentFontForPreview?.characters || []}
              fontFile={null}
            />
          )}
        </div>
      </div>

      <Separator />

      <SavedFontsDisplay 
        fonts={savedFontsData || []} 
        isLoading={isLoadingFonts}
        error={fontsError}
      />
    </div>
  );
}

export default function FontManagementPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <FontManagementPageContent />
    </QueryClientProvider>
  );
}
