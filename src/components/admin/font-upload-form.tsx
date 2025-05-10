"use client";

import type { ChangeEvent} from 'react';
import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as opentype from 'opentype.js';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, UploadCloud } from "lucide-react";

export interface ParsedFontDetails {
  name: string;
  language: string;
  characters: string[];
}

interface FontUploadFormProps {
  onFontParsed: (details: ParsedFontDetails) => void;
}

const formSchema = z.object({
  language: z.string().min(1, "Please select a language."),
});

type FontFormValues = z.infer<typeof formSchema>;

export function FontUploadForm({ onFontParsed }: FontUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const form = useForm<FontFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: SUPPORTED_LANGUAGES[0]?.value || "",
    },
  });

  const currentLanguage = form.watch("language");

  useEffect(() => {
    // Re-parse if language changes and a file is selected
    if (selectedFile && currentLanguage) {
      parseFont(selectedFile, currentLanguage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage]); // Only re-run if currentLanguage changes

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "font/otf" && !file.name.toLowerCase().endsWith(".otf")) {
        setFileError("Invalid file type. Please upload an OTF (.otf) font file.");
        setSelectedFile(null);
        onFontParsed({ name: "", language: "", characters: [] }); // Clear preview
        return;
      }
      setSelectedFile(file);
      setFileError(null);
      if (form.getValues("language")) {
        await parseFont(file, form.getValues("language"));
      } else {
        setParsingError("Please select a language first.");
      }
    } else {
      setSelectedFile(null);
      setFileError(null);
      onFontParsed({ name: "", language: "", characters: [] }); // Clear preview
    }
  };

  const parseFont = async (file: File, language: string) => {
    if (!language) {
      setParsingError("Language not selected. Cannot parse font.");
      return;
    }
    setIsParsing(true);
    setParsingError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const font = opentype.parse(arrayBuffer);
      
      const name = font.names.fontFamily?.en || font.names.fullName?.en || font.names.preferredFamily?.en || file.name;

      const characters: string[] = [];
      // Iterate through glyphs that have unicode values
      for (let i = 0; i < font.numGlyphs; i++) {
        const glyph = font.glyphs.get(i);
        if (glyph.unicode !== undefined) {
           characters.push(String.fromCharCode(glyph.unicode));
        } else if (glyph.unicodes && glyph.unicodes.length > 0) {
           // Handle glyphs with multiple unicode values (e.g., ligatures mapped to sequences)
           // For simplicity, we take the first one or join them if appropriate for the use case.
           // Here, we'll just add characters for each unicode point.
           glyph.unicodes.forEach(u => characters.push(String.fromCharCode(u)));
        }
      }
      
      // Filter out non-printable characters (ASCII < 32, except tab, lf, cr), control chars, and duplicates.
      // Also filter out the .notdef glyph which usually has unicode 0 or is unassigned.
      const uniquePrintableChars = Array.from(new Set(
        characters.filter(char => {
          const code = char.charCodeAt(0);
          return code >= 32 || code === 9 || code === 10 || code === 13; // Printable ASCII or tab/lf/cr
        })
      )).sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0)); // Sort by char code

      onFontParsed({ name, language, characters: uniquePrintableChars });

    } catch (e) {
      console.error("Font parsing error:", e);
      setParsingError(`Failed to parse font file. Ensure it's a valid OTF file. Error: ${e instanceof Error ? e.message : String(e)}`);
      onFontParsed({ name: file.name, language, characters: [] }); // Send empty chars on error
    }
    setIsParsing(false);
  };
  
  // Form's onSubmit isn't strictly needed if parsing happens on file/language change.
  // It could be used for a "save font configuration" action in the future.
  const onSubmit = async (values: FontFormValues) => {
    if (selectedFile) {
      await parseFont(selectedFile, values.language);
    } else {
      setFileError("Please select a font file.");
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormItem>
          <FormLabel htmlFor="font-file-upload">Font File (.otf)</FormLabel>
          <Input
            id="font-file-upload"
            type="file"
            accept=".otf,font/otf"
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          {fileError && <FormMessage>{fileError}</FormMessage>}
          <FormDescription>Upload an OpenType Font file.</FormDescription>
        </FormItem>

        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign Language</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language for the font" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                This language association will be used for practice sheets.
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
            <AlertTitle>Parsing Error</AlertTitle>
            <AlertDescription>{parsingError}</AlertDescription>
          </Alert>
        )}
        
        {/* Submit button might be for future use, e.g., saving to a backend */}
        {/* <Button type="submit" disabled={isParsing || !selectedFile} className="w-full">
          {isParsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
          {isParsing ? "Processing..." : "Process & Preview Font"}
        </Button> */}
      </form>
    </Form>
  );
}
