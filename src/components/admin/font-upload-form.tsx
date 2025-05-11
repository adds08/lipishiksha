
"use client";

import type { ChangeEvent} from 'react';
import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as opentype from 'opentype.js';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Save } from "lucide-react";

export interface ParsedFontDetails {
  name: string;
  language: string; 
  characters: string[];
}

interface FontUploadFormProps {
  onFontProcessed: (details: ParsedFontDetails | null, file: File | null) => void;
  onSaveConfiguration: (details: ParsedFontDetails, fontFile: File) => void;
  isSaving: boolean;
}

const formSchema = z.object({
  language: z.string().min(2, "Language name/code is required (e.g., 'en', 'Nepali').").max(50, "Language name/code is too long."),
});

type FontFormValues = z.infer<typeof formSchema>;

export function FontUploadForm({ onFontProcessed, onSaveConfiguration, isSaving }: FontUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentParsedDetails, setCurrentParsedDetails] = useState<ParsedFontDetails | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const form = useForm<FontFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: "", 
    },
  });

  const currentLanguageValue = form.watch("language");

  useEffect(() => {
    if (selectedFile && currentLanguageValue) {
      parseFont(selectedFile, currentLanguageValue);
    } else if (!selectedFile || !currentLanguageValue) {
      setCurrentParsedDetails(null);
      onFontProcessed(null, null); // Pass null for file as well
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguageValue, selectedFile]); 

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setParsingError(null); 
    setCurrentParsedDetails(null); 
    onFontProcessed(null, null); // Pass null for file as well

    if (file) {
      const isOTF = file.type === "font/otf" || file.name.toLowerCase().endsWith(".otf");
      const isTTF = file.type === "font/ttf" || file.type === "application/x-font-truetype" || file.name.toLowerCase().endsWith(".ttf");

      if (!isOTF && !isTTF) {
        setFileError("Invalid file type. Please upload an OTF (.otf) or TTF (.ttf) font file.");
        setSelectedFile(null);
        event.target.value = ""; 
        return;
      }
      setSelectedFile(file);
      setFileError(null);
      if (form.getValues("language")) {
        await parseFont(file, form.getValues("language"));
      }
    } else {
      setSelectedFile(null);
      setFileError(null);
    }
  };

  const parseFont = async (file: File, language: string) => {
    if (!language) {
      setParsingError("Language not entered. Cannot parse font.");
      onFontProcessed(null, file); // Pass file even if language is missing initially
      setCurrentParsedDetails(null);
      return;
    }
    setIsParsing(true);
    setParsingError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const font = opentype.parse(arrayBuffer);
      
      const name = font.names.fontFamily?.en || font.names.fullName?.en || font.names.preferredFamily?.en || file.name;

      const characters: string[] = [];
      for (let i = 0; i < font.numGlyphs; i++) {
        const glyph = font.glyphs.get(i);
        if (glyph.unicode !== undefined) {
          const char = String.fromCharCode(glyph.unicode);
          // Filter for printable characters (ASCII 32 and above) or common whitespace (tab, LF, CR)
          if (glyph.unicode >= 32 || [9, 10, 13].includes(glyph.unicode)) {
            characters.push(char);
          }
        } else if (glyph.unicodes && glyph.unicodes.length > 0) {
           glyph.unicodes.forEach(u => {
             const char = String.fromCharCode(u);
             if (u >= 32 || [9, 10, 13].includes(u)) {
               characters.push(char);
             }
           });
        }
      }
      
      const uniquePrintableChars = Array.from(new Set(characters))
        .sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0));

      const parsedDetails = { name, language, characters: uniquePrintableChars };
      setCurrentParsedDetails(parsedDetails);
      onFontProcessed(parsedDetails, file);

    } catch (e) {
      console.error("Font parsing error:", e);
      const errorMsg = e instanceof Error ? e.message : String(e);
      setParsingError(`Failed to parse font: ${errorMsg}. Ensure it's a valid OTF or TTF file.`);
      onFontProcessed(null, file); // Pass file even on error
      setCurrentParsedDetails(null);
    }
    setIsParsing(false);
  };
  
  const onSubmit = (_values: FontFormValues) => { 
    if (!selectedFile) {
      setFileError("Please select a font file to save.");
      return;
    }
    if (!currentLanguageValue) { 
      form.setError("language", { type: "manual", message: "Language is required to save." });
      return;
    }
    if (!currentParsedDetails) {
      setParsingError("Font data is not available or parsing failed. Cannot save.");
      // Attempt to re-parse if file and language are present but details are missing
      if(selectedFile && currentLanguageValue) {
        parseFont(selectedFile, currentLanguageValue).then(() => {
           // After re-parse, currentParsedDetails might be updated. Check it again.
           const updatedDetails = currentParsedDetails; // Re-read state
           if(updatedDetails) { 
             onSaveConfiguration(updatedDetails, selectedFile);
           } else {
             // Still no details, persist parsing error.
             setParsingError("Font data could not be processed. Cannot save.");
           }
        });
      }
      return;
    }
    
    const detailsToSave: ParsedFontDetails = {
        ...currentParsedDetails,
        language: currentLanguageValue, 
        name: currentParsedDetails.name || selectedFile.name, 
    };

    onSaveConfiguration(detailsToSave, selectedFile);
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormItem>
          <FormLabel htmlFor="font-file-upload">Font File (.otf, .ttf)</FormLabel>
          <Input
            id="font-file-upload"
            type="file"
            accept=".otf,font/otf,.ttf,font/ttf,application/x-font-truetype"
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          {fileError && <FormMessage>{fileError}</FormMessage>}
          <FormDescription>Upload an OpenType (OTF) or TrueType (TTF) Font file. The character set will be previewed.</FormDescription>
        </FormItem>

        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign Language to Font</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Nepali or en" {...field} />
              </FormControl>
              <FormDescription>
                Enter a language name (e.g., English, Nepali) or code (e.g., en, ne). This will be stored with the font.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {isParsing && (
          <div className="flex items-center text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Parsing font...</span>
          </div>
        )}

        {parsingError && (
          <Alert variant="destructive">
            <AlertTitle>Font Processing Error</AlertTitle>
            <AlertDescription>{parsingError}</AlertDescription>
          </Alert>
        )}
        
        <Button type="submit" disabled={isParsing || isSaving || !selectedFile || !currentLanguageValue || !currentParsedDetails} className="w-full">
          {isSaving || isParsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {isSaving ? "Saving to Database..." : (isParsing ? "Parsing..." : "Save Font Configuration")}
        </Button>
      </form>
    </Form>
  );
}
