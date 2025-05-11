'use server';

import type { ParsedFontDetails } from '@/components/admin/font-upload-form';
import { saveFontLocally } from '@/lib/file-storage';
import { query as executeQuery } from '@/lib/db'; 
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
  fileSize: string; // pg driver returns numbers as strings for bigint/numeric, needs conversion
  storagePath: string; 
  downloadURL: string; 
  createdAt: string | Date; 
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
  const params = [
    newFontId,
    fontDetails.name,
    fontDetails.language,
    JSON.stringify(fontDetails.characters),
    fontFile.name,
    fontFile.size,
    storagePath,
    downloadURL,
    new Date(),
  ];
  
  await executeQuery(sql, params);
  return newFontId;
}

export async function getSavedFontConfigurations(): Promise<SavedFontConfig[]> {
  const sql = `
    SELECT id, name, "assignedLanguage", characters, "fileName", "fileSize", "storagePath", "downloadURL", "createdAt"
    FROM "FontConfiguration"
    ORDER BY "createdAt" DESC
  `;
  const result = await executeQuery<FontConfigRow>(sql);
  const fontsFromDb = result.rows;

  return fontsFromDb.map(font => ({
    id: font.id,
    name: font.name,
    assignedLanguage: font.assignedLanguage,
    characters: JSON.parse(font.characters || '[]'), // Ensure characters is parsed, default to empty array if null/undefined
    fileName: font.fileName,
    fileSize: Number(font.fileSize), 
    storagePath: font.storagePath,
    downloadURL: font.downloadURL,
    createdAt: new Date(font.createdAt), 
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
  const sql = `
    SELECT DISTINCT ON ("assignedLanguage")
    id, name, "assignedLanguage", characters, "fileName", "fileSize", "storagePath", "downloadURL", "createdAt"
    FROM "FontConfiguration"
    ORDER BY "assignedLanguage" ASC, "createdAt" DESC
  `;
  
  const result = await executeQuery<FontConfigRow>(sql);
  const fontsFromDb: FontConfigRow[] = result.rows;

  return fontsFromDb.map(font => ({
    id: font.id, // Use the font configuration ID as the unique ID for selection
    label: `${font.assignedLanguage} (${font.name})`,
    fontName: font.name,
    characters: JSON.parse(font.characters || '[]'), // Ensure characters is parsed
    downloadURL: font.downloadURL,
    assignedLanguage: font.assignedLanguage,
  }));
}
