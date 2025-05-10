
"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { PracticeSheetGeneratorForm } from "@/components/practice-sheet-generator-form";
import { PracticeSheetPreview } from "@/components/practice-sheet-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS, SUPPORTED_LANGUAGES } from "@/lib/constants";
import { Printer, Settings } from "lucide-react";

export interface PracticeSheetConfig {
  language: string;
  character?: string; // Character is now optional
  rows: number;
  cols: number;
}

export default function GeneratorPage() {
  const initialLanguage = SUPPORTED_LANGUAGES[0].value;
  const [config, setConfig] = useState<PracticeSheetConfig>({
    language: initialLanguage,
    character: initialLanguage === 'ne' ? undefined : "A", // Undefined for Nepali to signify all alphabets
    rows: DEFAULT_GRID_ROWS,
    cols: DEFAULT_GRID_COLS,
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Practice Sheet Generator</h1>
          <p className="text-muted-foreground">
            Create custom handwriting practice sheets. Adjust the settings below and print your sheet.
            For Nepali, all standard alphabets will be generated.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <Card className="lg:col-span-1 shadow-lg sticky top-20"> {/* Sticky for settings panel */}
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                <CardTitle>Settings</CardTitle>
              </div>
              <CardDescription>Configure your practice sheet. Select Nepali to generate all alphabets.</CardDescription>
            </CardHeader>
            <CardContent>
              <PracticeSheetGeneratorForm onConfigChange={setConfig} defaultConfig={config} />
               <Button onClick={handlePrint} className="w-full mt-6 no-print">
                <Printer className="mr-2 h-4 w-4" /> Print Practice Sheet
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
             <PracticeSheetPreview config={config} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
