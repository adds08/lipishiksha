'use server';

import type { ParsedFontDetails } from '@/components/admin/font-upload-form';
import { saveFontLocally } from '@/lib/file-storage';
import { query as executeSelectQuery, execute as executeModifyQuery } from '@/lib/db'; // Renamed for clarity
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

// This type represents the raw row from the database.
interface FontConfigRow {
  id: string;
  name: string;
  assignedLanguage: string; 
  characters: string; // JSON string from DB
  fileName: string; 
  fileSize: number; // SQLite stores as INTEGER, directly maps to number
  storagePath: string; 
  downloadURL: string; 
  createdAt: string; // Stored as ISO8601 TEXT string
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
  
  const sql = `
    INSERT INTO "FontConfiguration" (id, name, "assignedLanguage", characters, "fileName", "fileSize", "storagePath", "downloadURL", "createdAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `;
  // SQLite uses $1, $2 placeholders for parameters in the sqlite3 Node.js library
  const params = [
    newFontId,
    fontDetails.name,
    fontDetails.language,
    JSON.stringify(fontDetails.characters),
    fontFile.name,
    fontFile.size,
    storagePath,
    downloadURL,
    new Date().toISOString(), // Store as ISO string
  ];
  
  await executeModifyQuery(sql, params);
  return newFontId;
}

export async function getSavedFontConfigurations(): Promise<SavedFontConfig[]> {
  const sql = `
    SELECT id, name, "assignedLanguage", characters, "fileName", "fileSize", "storagePath", "downloadURL", "createdAt"
    FROM "FontConfiguration"
    ORDER BY "createdAt" DESC
  `;
  const fontsFromDb = await executeSelectQuery<FontConfigRow>(sql);

  return fontsFromDb.map(font => ({
    id: font.id,
    name: font.name,
    assignedLanguage: font.assignedLanguage,
    characters: JSON.parse(font.characters || '[]'), 
    fileName: font.fileName,
    fileSize: font.fileSize, // Directly a number from SQLite
    storagePath: font.storagePath,
    downloadURL: font.downloadURL,
    createdAt: new Date(font.createdAt), // Parse ISO string back to Date
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
  // SQLite equivalent for selecting the latest font for each language.
  // This query selects rows where createdAt is the maximum for that assignedLanguage.
  const sql = `
    SELECT fc.id, fc.name, fc."assignedLanguage", fc.characters, fc."fileName", fc."fileSize", fc."storagePath", fc."downloadURL", fc."createdAt"
    FROM "FontConfiguration" fc
    INNER JOIN (
        SELECT "assignedLanguage", MAX("createdAt") as max_created_at
        FROM "FontConfiguration"
        GROUP BY "assignedLanguage"
    ) as latest_fonts
    ON fc."assignedLanguage" = latest_fonts."assignedLanguage" AND fc."createdAt" = latest_fonts.max_created_at
    ORDER BY fc."assignedLanguage" ASC;
  `;
  
  const fontsFromDb = await executeSelectQuery<FontConfigRow>(sql);

  return fontsFromDb.map(font => ({
    id: font.id, 
    label: `${font.assignedLanguage} (${font.name})`,
    fontName: font.name,
    characters: JSON.parse(font.characters || '[]'), 
    downloadURL: font.downloadURL,
    assignedLanguage: font.assignedLanguage,
  }));
}
