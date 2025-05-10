'use server';

import fs from 'fs/promises';
import path from 'path';
import type { ParsedFontDetails } from '@/components/admin/font-upload-form';
import { saveFontLocally } from '@/lib/file-storage';

// Define the path to the JSON database file
const DB_PATH = path.join(process.cwd(), 'data', 'fonts.json');

export interface SavedFontConfig extends Omit<ParsedFontDetails, 'language'> {
  id: string; // Unique ID for the font config
  assignedLanguage: string;
  fileName: string;
  fileSize: number;
  storagePath: string; // Local file system path or relative public path
  downloadURL: string; // Publicly accessible URL (relative to /public)
  createdAt: string; // ISO 8601 date string
}

interface FontDatabase {
  fonts: SavedFontConfig[];
}

/**
 * Reads the font database from the JSON file.
 * @returns Promise resolving to the FontDatabase object.
 */
async function readDb(): Promise<FontDatabase> {
  try {
    await fs.access(DB_PATH);
  } catch (error) {
    // If the file doesn't exist, create it with an empty structure
    await fs.writeFile(DB_PATH, JSON.stringify({ fonts: [] }, null, 2), 'utf-8');
  }
  const jsonData = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(jsonData) as FontDatabase;
}

/**
 * Writes the font database to the JSON file.
 * @param dbData The FontDatabase object to write.
 */
async function writeDb(dbData: FontDatabase): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(dbData, null, 2), 'utf-8');
}

/**
 * Uploads a font file to the local server.
 * For this local JSON setup, it means saving to public/uploads/fonts.
 * @param file The font file to upload.
 * @returns Promise resolving to the storage path and public URL of the uploaded file.
 */
export async function uploadFontFile(file: File): Promise<{ storagePath: string; downloadURL: string }> {
  const { filePath, publicUrl } = await saveFontLocally(file);
  // For local storage, storagePath might be the absolute fs path, 
  // and downloadURL is the web-accessible path.
  return { storagePath: filePath, downloadURL: publicUrl };
}

/**
 * Saves font configuration to the JSON database file.
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
  const dbData = await readDb();
  const newId = `font_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const newFontConfig: SavedFontConfig = {
    id: newId,
    name: fontDetails.name,
    assignedLanguage: fontDetails.language,
    characters: fontDetails.characters,
    fileName: fontFile.name,
    fileSize: fontFile.size,
    storagePath,
    downloadURL,
    createdAt: new Date().toISOString(),
  };

  dbData.fonts.push(newFontConfig);
  dbData.fonts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by date desc
  await writeDb(dbData);
  
  return newId;
}

/**
 * Fetches all saved font configurations from the JSON database file.
 * @returns Promise resolving to an array of SavedFontConfig.
 */
export async function getSavedFontConfigurations(): Promise<SavedFontConfig[]> {
  const dbData = await readDb();
  // Ensure sorting by createdAt descending if not already handled by writeDb (it is, but good for consistency)
  return dbData.fonts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Renaming from SavedFontConfigServer for consistency with the new local approach
export type { SavedFontConfig as SavedFontConfigServer } from '@/lib/font-data-service';
