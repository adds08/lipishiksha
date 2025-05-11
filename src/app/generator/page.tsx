
"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { PracticeSheetGeneratorForm, type AvailableLanguage } from "@/components/practice-sheet-generator-form";
import { PracticeSheetPreview } from "@/components/practice-sheet-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, Settings, Loader2 } from "lucide-react";
import { getFontsForGenerator, type LanguageFontInfo } from "@/lib/font-data-service";

export interface PracticeSheetConfig {
  language: string; 
}

const queryClient = new QueryClient();

function GeneratorPageContent() {
  const [config, setConfig] = useState<PracticeSheetConfig>({ language: "" });
  const [selectedFontDetails, setSelectedFontDetails] = useState<LanguageFontInfo | null>(null);

  const { data: availableFontsData, isLoading: isLoadingFonts, error: fontsError } = useQuery<LanguageFontInfo[], Error>({
    queryKey: ['fontsForGenerator'],
    queryFn: getFontsForGenerator, 
  });

  useEffect(() => {
    if (availableFontsData && availableFontsData.length > 0 && !config.language) {
      const firstFont = availableFontsData[0];
      setConfig({ language: firstFont.id }); // language in config is the font ID
      setSelectedFontDetails(firstFont);
    } else if (availableFontsData && config.language) {
      const currentSelected = availableFontsData.find(f => f.id === config.language);
      setSelectedFontDetails(currentSelected || null);
    }
  }, [availableFontsData, config.language]);


  const handleConfigChange = (newConfig: PracticeSheetConfig) => {
    setConfig(newConfig);
    if (availableFontsData) {
      const newSelectedFont = availableFontsData.find(f => f.id === newConfig.language); // language is font ID
      setSelectedFontDetails(newSelectedFont || null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formLanguages: AvailableLanguage[] = availableFontsData
    ? availableFontsData.map(f => ({ value: f.id, label: f.label })) // value is font ID
    : [];

  return (
    <MainLayout>
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Practice Sheet Generator</h1>
          <p className="text-muted-foreground">
            Create handwriting practice sheets. Select the language and font to generate a sheet with all its standard characters.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <Card className="lg:col-span-1 shadow-lg sticky top-20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                <CardTitle>Settings</CardTitle>
              </div>
              <CardDescription>Select a language/font. The sheet will use all characters from the chosen font.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingFonts && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading fonts...</span>
                </div>
              )}
              {fontsError && (
                <p className="text-destructive">Error loading fonts: {fontsError.message}</p>
              )}
              {!isLoadingFonts && !fontsError && (
                <PracticeSheetGeneratorForm 
                  onConfigChange={handleConfigChange} 
                  defaultConfig={config} 
                  availableLanguages={formLanguages}
                  isLoadingLanguages={isLoadingFonts}
                />
              )}
               <Button onClick={handlePrint} className="w-full mt-6 no-print" disabled={!selectedFontDetails}>
                <Printer className="mr-2 h-4 w-4" /> Print Practice Sheet
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
             {selectedFontDetails ? (
                <PracticeSheetPreview 
                  language={selectedFontDetails.assignedLanguage} 
                  fontId={selectedFontDetails.id} // Pass fontId
                  fontName={selectedFontDetails.fontName}
                  characters={selectedFontDetails.characters}
                  fontFileUrl={selectedFontDetails.downloadURL}
                />
             ) : (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Practice Sheet Preview</CardTitle>
                   {selectedFontDetails && <CardDescription>Font: {selectedFontDetails.fontName}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {isLoadingFonts ? 'Loading font list...' : 'Select a language and font to see the preview.'}
                  </p>
                </CardContent>
              </Card>
             )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function GeneratorPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <GeneratorPageContent />
    </QueryClientProvider>
  );
}
