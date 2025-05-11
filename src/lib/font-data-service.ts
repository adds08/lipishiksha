
'use server';

import type { ParsedFontDetails } from '@/components/admin/font-upload-form';
import { saveFontLocally } from '@/lib/file-storage';
import knex from '@/lib/db'; // Import Knex instance
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
// Knex will return objects matching this structure.
interface FontConfigRow {
  id: string;
  name: string;
  assignedLanguage: string; 
  characters: string; // JSON string from DB
  fileName: string; 
  fileSize: number; 
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
  
  const fontConfigToInsert = {
    id: newFontId,
    name: fontDetails.name,
    assignedLanguage: fontDetails.language,
    characters: JSON.stringify(fontDetails.characters),
    fileName: fontFile.name,
    fileSize: fontFile.size,
    storagePath: storagePath,
    downloadURL: downloadURL,
    createdAt: new Date().toISOString(),
  };
  
  await knex('FontConfiguration').insert(fontConfigToInsert);
  return newFontId;
}

export async function getSavedFontConfigurations(): Promise<SavedFontConfig[]> {
  const fontsFromDb: FontConfigRow[] = await knex('FontConfiguration')
    .select(
      'id', 
      'name', 
      'assignedLanguage', 
      'characters', 
      'fileName', 
      'fileSize', 
      'storagePath', 
      'downloadURL', 
      'createdAt'
    )
    .orderBy('createdAt', 'desc');

  return fontsFromDb.map(font => ({
    id: font.id,
    name: font.name,
    assignedLanguage: font.assignedLanguage,
    characters: JSON.parse(font.characters || '[]'), 
    fileName: font.fileName,
    fileSize: font.fileSize,
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
  // Using Knex to build the subquery for latest fonts per language
  const latestFontsSubquery = knex('FontConfiguration')
    .select('assignedLanguage')
    .max('createdAt as max_created_at')
    .groupBy('assignedLanguage')
    .as('latest_fonts');

  const fontsFromDb: FontConfigRow[] = await knex('FontConfiguration as fc')
    .join(latestFontsSubquery, function() {
      this.on('fc.assignedLanguage', '=', 'latest_fonts.assignedLanguage')
          .andOn('fc.createdAt', '=', 'latest_fonts.max_created_at');
    })
    .select(
      'fc.id', 
      'fc.name', 
      'fc.assignedLanguage', 
      'fc.characters', 
      'fc.fileName', 
      'fc.fileSize', 
      'fc.storagePath', 
      'fc.downloadURL', 
      'fc.createdAt'
    )
    .orderBy('fc.assignedLanguage', 'asc');
  
  return fontsFromDb.map(font => ({
    id: font.id, 
    label: `${font.assignedLanguage} (${font.name})`,
    fontName: font.name,
    characters: JSON.parse(font.characters || '[]'), 
    downloadURL: font.downloadURL,
    assignedLanguage: font.assignedLanguage,
  }));
}
