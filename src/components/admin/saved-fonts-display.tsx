
"use client";

import type { SavedFontConfigServer } from "@/lib/firebase/fonts"; // Updated import
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
import { format } from 'date-fns'; // For formatting timestamp

// Interface used by this component, derived from server data
export interface SavedFontDisplayData {
  id: string;
  name: string;
  assignedLanguage: string;
  fileName: string;
  fileSize: number;
  characterCount: number;
  createdAt?: Date | string; // Allow string for initial display before full parsing
  // downloadURL?: string; // Can add if a download button is desired
}


interface SavedFontsDisplayProps {
  fonts: SavedFontDisplayData[];
  isLoading: boolean;
  error?: Error | null;
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
          <p className="text-muted-foreground">Fetching data from the database.</p>
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
          List of font configurations stored in the database.
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
                      {font.createdAt ? 
                        (typeof font.createdAt === 'string' ? font.createdAt : format(font.createdAt, 'PPpp')) 
                        : 'N/A'}
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
