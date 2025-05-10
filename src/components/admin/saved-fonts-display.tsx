
"use client";

import type { ParsedFontDetails } from "./font-upload-form";
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

export interface SavedFontConfig extends ParsedFontDetails {
  id: string; // Unique ID for the saved configuration
  fileName: string;
  fileSize: number;
  // filePath?: string; // Path in cloud storage, if applicable
}

interface SavedFontsDisplayProps {
  fonts: SavedFontConfig[];
}

export function SavedFontsDisplay({ fonts }: SavedFontsDisplayProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Saved Font Configurations</CardTitle>
        <CardDescription>
          List of font configurations that have been "saved" (simulated in this demo). In a real application, these would be persisted in a database.
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
                  <TableHead>Language</TableHead>
                  <TableHead>Original File</TableHead>
                  <TableHead className="text-right">Characters</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fonts.map((font) => (
                  <TableRow key={font.id}>
                    <TableCell className="font-medium">{font.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{font.language.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>{font.fileName} ({(font.fileSize / 1024).toFixed(2)} KB)</TableCell>
                    <TableCell className="text-right">{font.characters.length}</TableCell>
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

