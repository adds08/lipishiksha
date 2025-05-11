
'use server';

import { PrismaClient } from '@prisma/client';
import type { ParsedFontDetails } from '@/components/admin/font-upload-form';
import { saveFontLocally } from '@/lib/file-storage'; // For saving the actual font file

const prisma = new PrismaClient();

// This interface now primarily describes the shape of data returned to components,
// after potential transformations (like parsing JSON 'characters').
export interface SavedFontConfig extends Omit<ParsedFontDetails, 'language' | 'characters'> {
  id: string;
  assignedLanguage: string;
  characters: string[]; // Ensure this is string[] after parsing
  fileName: string;
  fileSize: number; // Ensure this is number after conversion
  storagePath: string;
  downloadURL: string;
  createdAt: Date; // Prisma returns Date objects for DateTime fields
}


/**
 * Uploads a font file to the local server (public/uploads/fonts).
 * This part remains the same as it deals with the physical file.
 * @param file The font file to upload.
 * @returns Promise resolving to the storage path and public URL of the uploaded file.
 */
export async function uploadFontFile(file: File): Promise<{ storagePath: string; downloadURL: string }> {
  const { filePath, publicUrl } = await saveFontLocally(file);
  return { storagePath: filePath, downloadURL: publicUrl };
}

/**
 * Saves font configuration to the SQLite database via Prisma.
 * @param fontDetails The parsed font details from the form.
 * @param fontFile The original font file (for name and size).
 * @param storagePath The path where the font is stored (local file system path).
 * @param downloadURL The public download URL of the font file.
 * @returns Promise resolving to the ID of the newly saved font configuration.
 */
export async function saveFontConfiguration(
  fontDetails: ParsedFontDetails,
  fontFile: File,
  storagePath: string,
  downloadURL: string
): Promise<string> {
  const newFontConfig = await prisma.fontConfiguration.create({
    data: {
      name: fontDetails.name,
      assignedLanguage: fontDetails.language,
      characters: JSON.stringify(fontDetails.characters), // Store characters as a JSON string
      fileName: fontFile.name,
      fileSize: BigInt(fontFile.size), // Store fileSize as BigInt
      storagePath,
      downloadURL,
      createdAt: new Date(), // Prisma handles ISO string conversion
    },
  });
  
  return newFontConfig.id;
}

/**
 * Fetches all saved font configurations from the SQLite database.
 * @returns Promise resolving to an array of SavedFontConfig.
 */
export async function getSavedFontConfigurations(): Promise<SavedFontConfig[]> {
  const fontsFromDb = await prisma.fontConfiguration.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return fontsFromDb.map(font => ({
    ...font,
    characters: JSON.parse(font.characters as string), // Parse JSON string to string[]
    fileSize: Number(font.fileSize), // Convert BigInt to number for component use
  }));
}


export interface LanguageFontInfo {
  id: string; 
  label: string; 
  fontName: string;
  characters: string[];
  downloadURL: string;
  assignedLanguage: string;
}

/**
 * Fetches a list of unique languages and their associated font details for the generator.
 * It picks the most recently added font for each unique language.
 * @returns Promise resolving to an array of LanguageFontInfo.
 */
export async function getFontsForGenerator(): Promise<LanguageFontInfo[]> {
  // Fetch all fonts, ordered by assignedLanguage and then by createdAt descending
  // to easily pick the latest for each language.
  const allFonts = await prisma.fontConfiguration.findMany({
    orderBy: [
      { assignedLanguage: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  const languageMap = new Map<string, LanguageFontInfo>();

  for (const font of allFonts) {
    // If this language is not yet in the map, add it (it's the most recent due to sorting)
    if (!languageMap.has(font.assignedLanguage)) {
      languageMap.set(font.assignedLanguage, {
        id: font.assignedLanguage, // Using language code as ID for selection
        label: `${font.assignedLanguage} (${font.name})`,
        fontName: font.name,
        characters: JSON.parse(font.characters as string), // Parse JSON string
        downloadURL: font.downloadURL,
        assignedLanguage: font.assignedLanguage,
      });
    }
  }
  return Array.from(languageMap.values());
}

// Alias for type used in components, reflecting the structure after DB retrieval and parsing
export type { SavedFontConfig as SavedFontConfigServer };
