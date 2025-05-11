
'use server';

import type { ParsedFontDetails } from '@/components/admin/font-upload-form';
import { saveFontLocally } from '@/lib/file-storage';
import db from '@/lib/db'; // Knex instance
import { v4 as uuidv4 } from 'uuid';


// This interface describes data primarily for component consumption.
export interface SavedFontConfig extends Omit<ParsedFontDetails, 'language' | 'characters'> {
  id: string;
  assignedLanguage: string;
  characters: string[];
  fileName:string;
  fileSize: number;
  storagePath: string;
  downloadURL: string;
  createdAt: Date;
}

// This type matches the database row more closely, before transformations.
interface FontConfigRow {
  id: string;
  name: string;
  assignedLanguage: string;
  characters: string; // JSON string from DB
  fileName: string;
  fileSize: string | number | bigint; // Knex might return string for bigint
  storagePath: string;
  downloadURL: string;
  createdAt: Date | string; // Knex might return string or Date
}


export async function uploadFontFile(file: File): Promise<{ storagePath: string; downloadURL: string }> {
  const { filePath, publicUrl } = await saveFontLocally(file);
  return { storagePath: filePath, downloadURL: publicUrl };
}

export async function saveFontConfiguration(
  fontDetails: ParsedFontDetails,
  fontFile: File,
  storagePath: string,
  downloadURL: string
): Promise<string> {
  const newFontId = uuidv4();
  
  await db<FontConfigRow>('FontConfiguration').insert({
    id: newFontId,
    name: fontDetails.name,
    assignedLanguage: fontDetails.language,
    characters: JSON.stringify(fontDetails.characters),
    fileName: fontFile.name,
    fileSize: fontFile.size, // Store as number/bigint directly, Knex handles it for PostgreSQL
    storagePath,
    downloadURL,
    createdAt: new Date(),
  });
  
  return newFontId;
}

export async function getSavedFontConfigurations(): Promise<SavedFontConfig[]> {
  const fontsFromDb = await db<FontConfigRow>('FontConfiguration')
    .select('*')
    .orderBy('createdAt', 'desc');

  return fontsFromDb.map(font => ({
    id: font.id,
    name: font.name,
    assignedLanguage: font.assignedLanguage,
    characters: JSON.parse(font.characters),
    fileName: font.fileName,
    fileSize: Number(font.fileSize), // Ensure it's a number
    storagePath: font.storagePath,
    downloadURL: font.downloadURL,
    createdAt: new Date(font.createdAt), // Ensure it's a Date object
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

export async function getFontsForGenerator(): Promise<LanguageFontInfo[]> {
  // Using PostgreSQL's DISTINCT ON for simplicity and efficiency
  const result = await db.raw(`
    SELECT DISTINCT ON ("assignedLanguage")
    id, name, "assignedLanguage", characters, "fileName", "fileSize", "storagePath", "downloadURL", "createdAt"
    FROM "FontConfiguration"
    ORDER BY "assignedLanguage" ASC, "createdAt" DESC
  `);
  
  const fontsFromDb: FontConfigRow[] = result.rows;

  return fontsFromDb.map(font => ({
    id: font.assignedLanguage, // Use language code as ID for selection, or font.id if unique font instances are preferred
    label: `${font.assignedLanguage} (${font.name})`,
    fontName: font.name,
    characters: JSON.parse(font.characters),
    downloadURL: font.downloadURL,
    assignedLanguage: font.assignedLanguage,
  }));
}

// Alias for type used in components, reflecting the structure after DB retrieval and parsing
// Keeping this for compatibility if any component still uses it, though SavedFontConfig is more accurate.
export type { SavedFontConfig as SavedFontConfigServer };
