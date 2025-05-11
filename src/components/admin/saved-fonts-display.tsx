
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { format } from 'date-fns';
import { Eye } from "lucide-react";

export interface SavedFontDisplayData {
  id: string;
  name: string;
  assignedLanguage: string;
  fileName: string;
  fileSize: number;
  characterCount: number;
  createdAt?: Date;
  characters: string[];
  storagePath: string;
  downloadURL: string;
}

interface SavedFontsDisplayProps {
  fonts: SavedFontDisplayData[];
  isLoading: boolean;
  error?: Error | null;
}

// Helper component to manage dynamic font loading for the dialog's character map
function CharacterMapWithDynamicFont({ font }: { font: SavedFontDisplayData }) {
  const [dynamicFontFamily, setDynamicFontFamily] = useState<string | null>(null);
  const [fontStyleTag, setFontStyleTag] = useState<HTMLStyleElement | null>(null);

  useEffect(() => {
    // Cleanup previous font style tag if any
    if (fontStyleTag && fontStyleTag.parentNode) {
      fontStyleTag.parentNode.removeChild(fontStyleTag);
      setFontStyleTag(null);
    }
    setDynamicFontFamily(null);

    if (font.downloadURL && font.name) {
      // Create a unique font-family name for this preview instance
      const uniqueFontFamily = `DialogPreview_${font.name.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`;
      
      let fontFormat = '';
      if (font.downloadURL.toLowerCase().endsWith('.otf')) fontFormat = 'opentype';
      else if (font.downloadURL.toLowerCase().endsWith('.ttf')) fontFormat = 'truetype';

      if (!fontFormat) {
        console.warn("Could not determine font format for dialog preview from URL:", font.downloadURL);
      }

      const fontFaceRule = `
        @font-face {
          font-family: "${uniqueFontFamily}";
          src: url("${font.downloadURL}") ${fontFormat ? `format("${fontFormat}")` : ''};
        }
      `;

      const newStyleTag = document.createElement('style');
      newStyleTag.textContent = fontFaceRule;
      document.head.appendChild(newStyleTag);

      setFontStyleTag(newStyleTag);
      setDynamicFontFamily(uniqueFontFamily);
    }

    return () => {
      // Cleanup when component unmounts or dependencies change
      if (fontStyleTag && fontStyleTag.parentNode) {
        fontStyleTag.parentNode.removeChild(fontStyleTag);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [font.downloadURL, font.name]); // Effect runs when these props change (i.e., different dialog opens)

  const currentFontFamilyToApply = dynamicFontFamily || "var(--font-geist-sans), sans-serif"; // Fallback font
  const fontSizeForDisplay = font.assignedLanguage.toLowerCase() === 'ne' || font.assignedLanguage.toLowerCase() === 'nepali' ? '1.15rem' : '1rem';


  return (
    <div>
      <p className="text-sm font-medium leading-none mb-1">Character Map ({font.characters.length} chars):</p>
      <ScrollArea className="h-[150px] w-full rounded-md border p-3 text-sm bg-muted/30">
        {font.characters.length > 0 ? (
          <p className="break-all" style={{ fontFamily: currentFontFamilyToApply, fontSize: fontSizeForDisplay }}>
            {font.characters.join(' ')}
          </p>
        ) : (
          <p className="text-muted-foreground">No characters found or extracted for this font.</p>
        )}
      </ScrollArea>
    </div>
  );
}


export function SavedFontsDisplay({ fonts, isLoading, error }: SavedFontsDisplayProps) {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Saved Font Configurations</CardTitle>
          <CardDescription>Loading font configurations...</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Fetching data from the local store.</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Saved Font Configurations</CardTitle>
          <CardDescription>Error loading configurations.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Could not load fonts: {error.message}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Saved Font Configurations</CardTitle>
        <CardDescription>
          List of font configurations stored in the local JSON file.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {fonts.length === 0 ? (
          <p className="text-muted-foreground">No font configurations have been saved yet.</p>
        ) : (
          <ScrollArea className="h-[300px] w-full">
            <Table>
              <TableCaption>A list of your saved font configurations.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Font Name</TableHead>
                  <TableHead>Assigned Language</TableHead>
                  <TableHead>Original File</TableHead>
                  <TableHead className="text-right">Characters</TableHead>
                  <TableHead>Saved On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fonts.map((font) => (
                  <TableRow key={font.id}>
                    <TableCell className="font-medium">{font.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{font.assignedLanguage.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>{font.fileName} ({(font.fileSize / 1024).toFixed(2)} KB)</TableCell>
                    <TableCell className="text-right">{font.characterCount}</TableCell>
                    <TableCell>
                      {font.createdAt ? format(font.createdAt, 'PPpp') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Font Details: {font.name}</DialogTitle>
                            <DialogDescription>
                              Detailed information for the font &quot;{font.name}&quot; assigned to &quot;{font.assignedLanguage}&quot;.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <CharacterMapWithDynamicFont font={font} />
                            
                            <div>
                               <p className="text-sm font-medium leading-none mb-1">Font File Path (Server Storage):</p>
                               <code className="block text-xs font-mono bg-muted p-2 rounded overflow-x-auto">
                                 {font.storagePath}
                               </code>
                            </div>
                             <div>
                               <p className="text-sm font-medium leading-none mb-1">Font Public URL:</p>
                               <code className="block text-xs font-mono bg-muted p-2 rounded overflow-x-auto">
                                 {font.downloadURL}
                               </code>
                            </div>
                             <div>
                               <p className="text-sm font-medium leading-none mb-1">Configuration Data Source:</p>
                               <code className="block text-xs font-mono bg-muted p-2 rounded">
                                 data/fonts.json
                               </code>
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                               <Button variant="outline">Close</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

