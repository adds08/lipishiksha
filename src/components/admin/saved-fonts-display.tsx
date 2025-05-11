
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
import { Eye, Loader2 } from "lucide-react";

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
  const [isLoadingFont, setIsLoadingFont] = useState(true);
  const [fontError, setFontError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoadingFont(true);
    setFontError(null);
    
    // Cleanup previous font style tag if any
    if (fontStyleTag && fontStyleTag.parentNode) {
      fontStyleTag.parentNode.removeChild(fontStyleTag);
    }
    setFontStyleTag(null); // Reset state for style tag
    setDynamicFontFamily(null); // Reset dynamic font family


    if (font.downloadURL && font.name) {
      const uniqueFontFamily = `DialogPreview_${font.name.replace(/[^a-zA-Z0-9]/g, "_")}_${font.id.substring(0, 8)}`;
      
      let fontFormat = '';
      if (font.downloadURL.toLowerCase().endsWith('.otf')) fontFormat = 'opentype';
      else if (font.downloadURL.toLowerCase().endsWith('.ttf')) fontFormat = 'truetype';

      if (!fontFormat) {
        const errorMsg = `Could not determine font format for dialog preview from URL: ${font.downloadURL}`;
        console.warn(errorMsg);
        setFontError(errorMsg);
        setIsLoadingFont(false);
        // Proceeding without format, browser might infer or fail.
      }

      const fontFaceRule = `
        @font-face {
          font-family: "${uniqueFontFamily}"; /* Quoted font family name */
          src: url("${font.downloadURL}") ${fontFormat ? `format("${fontFormat}")` : ''};
          font-display: swap; /* Improves perceived performance */
        }
      `;

      const newStyleTag = document.createElement('style');
      newStyleTag.textContent = fontFaceRule;
      document.head.appendChild(newStyleTag);

      // Attempt to detect font loading (basic check)
      // More robust detection would use FontFaceObserver or document.fonts API
      // For simplicity, using a timeout and assuming if not loaded, it failed.
      // Or, better, check if the font is in document.fonts after a short delay
      if (typeof document !== "undefined" && (document as any).fonts) {
        (document as any).fonts.load(`1em "${uniqueFontFamily}"`).then(() => {
          setDynamicFontFamily(uniqueFontFamily);
          setIsLoadingFont(false);
        }).catch((err: Error) => {
          console.error(`Error loading font "${uniqueFontFamily}" from ${font.downloadURL}:`, err);
          setFontError(`Failed to load font: ${err.message}`);
          setIsLoadingFont(false);
           if (newStyleTag.parentNode) newStyleTag.parentNode.removeChild(newStyleTag); // cleanup if failed
        });
      } else {
        // Fallback if document.fonts is not available (older browsers)
        // Assume it loads, or use a simple timeout (less reliable)
        setDynamicFontFamily(uniqueFontFamily);
        setIsLoadingFont(false);
      }
      setFontStyleTag(newStyleTag); // Store the style tag for cleanup
    } else {
      setIsLoadingFont(false);
      if (!font.downloadURL) setFontError("Font download URL is missing.");
      if (!font.name) setFontError("Font name is missing.");
    }

    return () => {
      if (fontStyleTag && fontStyleTag.parentNode) { // Use the state variable for cleanup
        fontStyleTag.parentNode.removeChild(fontStyleTag);
      }
    };
  }, [font.downloadURL, font.name, font.id]); // font.id added for more unique family name part

  const currentFontFamilyToApply = dynamicFontFamily 
                                 ? `"${dynamicFontFamily}"` /* Quote if dynamic */
                                 : "var(--font-geist-sans), sans-serif"; // Fallback
  const fontSizeForDisplay = font.assignedLanguage.toLowerCase() === 'ne' || font.assignedLanguage.toLowerCase() === 'nepali' ? '1.15rem' : '1rem';

  if (isLoadingFont) {
    return <div className="flex items-center justify-center h-[150px]"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading font preview...</div>;
  }
  if (fontError) {
    return <div className="text-destructive h-[150px]">Error loading font preview: {fontError}</div>;
  }

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
      {dynamicFontFamily && <p className="text-xs text-muted-foreground mt-1">Previewing with: {dynamicFontFamily}</p>}
      {!dynamicFontFamily && !fontError && <p className="text-xs text-destructive mt-1">Font preview might not be using the custom font.</p>}
    </div>
  );
}


export function SavedFontsDisplay({ fonts, isLoading, error }: SavedFontsDisplayProps) {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Saved Font Configurations</CardTitle>
          <CardDescription>Loading font configurations from the database...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Fetching data...</span>
          </div>
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
          List of font configurations stored in the SQLite database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {fonts.length === 0 ? (
          <p className="text-muted-foreground">No font configurations have been saved yet.</p>
        ) : (
          <ScrollArea className="max-h-[400px] w-full"> {/* Adjusted height */}
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
                               <p className="text-sm font-medium leading-none mb-1">Font File Server Path (Local):</p>
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
                                 SQLite Database
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
