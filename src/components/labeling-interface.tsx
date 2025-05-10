"use client";

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Save, RotateCcw } from 'lucide-react';
import Image from 'next/image';

interface LabelingInterfaceProps {
  imageDataUri: string | null;
  imageRotation: number;
  initialLabels: string[];
  gridRows: number;
  gridCols: number;
  onSaveLabels: (labels: string[]) => void;
  language: string; // To potentially adjust input methods or display
}

export function LabelingInterface({
  imageDataUri,
  imageRotation,
  initialLabels,
  gridRows,
  gridCols,
  onSaveLabels,
  language
}: LabelingInterfaceProps) {
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    const totalCells = gridRows * gridCols;
    // Initialize labels: use initialLabels if available, pad with empty strings if not enough, or truncate if too many.
    const newLabels = Array(totalCells).fill('').map((_, i) => initialLabels[i] || '');
    setLabels(newLabels);
  }, [initialLabels, gridRows, gridCols]);

  const handleLabelChange = (index: number, value: string) => {
    const newLabels = [...labels];
    newLabels[index] = value;
    setLabels(newLabels);
  };

  const handleSave = () => {
    onSaveLabels(labels);
    // Potentially add a toast notification here for successful save
  };
  
  const handleReset = () => {
     const totalCells = gridRows * gridCols;
     const newLabels = Array(totalCells).fill('').map((_, i) => initialLabels[i] || '');
     setLabels(newLabels);
  }

  if (!imageDataUri) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Labeling Interface</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Upload an image and provide grid details to begin labeling.</p>
        </CardContent>
      </Card>
    );
  }

  const totalCells = gridRows * gridCols;
  if (totalCells === 0) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>Labeling Interface</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Grid rows and columns must be greater than 0.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-xl w-full">
      <CardHeader>
        <CardTitle>Manual Label Verification & Correction</CardTitle>
        <CardDescription>
          Review the AI-suggested labels below. Correct any inaccuracies and save your changes.
          Use your system's keyboard input for {language === 'ne' ? 'Nepali' : 'English'} characters.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="relative w-full aspect-[4/3] border rounded-md overflow-hidden bg-muted/20 flex items-center justify-center">
            <Image
              src={imageDataUri}
              alt="Practice sheet for labeling"
              fill
              className="object-contain transition-transform duration-300 ease-in-out"
              style={{ transform: `rotate(${imageRotation}deg)` }}
              data-ai-hint="scanned document labeling"
            />
          </div>

          <ScrollArea className="h-[60vh] border rounded-md p-1">
             <div
              className="grid gap-2 p-2"
              style={{
                gridTemplateColumns: `repeat(${gridCols}, minmax(60px, 1fr))`,
              }}
            >
              {labels.map((label, index) => (
                <div key={index} className="flex flex-col items-center">
                  <Input
                    type="text"
                    value={label}
                    onChange={(e) => handleLabelChange(index, e.target.value)}
                    className="text-center text-lg p-1 h-10"
                    aria-label={`Label for cell ${index + 1}`}
                    maxLength={5} // Assuming characters are short
                    style={{fontFamily: language === 'ne' ? 'Noto Sans Devanagari, sans-serif' : 'inherit'}}
                  />
                  <span className="text-xs text-muted-foreground mt-0.5">Cell {index + 1}</span>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset to AI Suggestions
          </Button>
          <Button onClick={handleSave} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Save className="mr-2 h-4 w-4" /> Save Corrected Labels
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
