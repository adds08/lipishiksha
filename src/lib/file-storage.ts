'use server';
import fs from 'fs/promises';
import path from 'path';
import { constants } from 'fs';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'fonts');

/**
 * Ensures that the upload directory exists.
 */
async function ensureUploadsDirExists() {
  try {
    await fs.access(UPLOADS_DIR, constants.F_OK);
  } catch (e) {
    // Directory does not exist, create it
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
}

/**
 * Saves a font file to the local public/uploads/fonts directory.
 * @param file The font file to save.
 * @returns Promise resolving to the relative path (from /public) of the saved file.
 */
export async function saveFontLocally(file: File): Promise<{ filePath: string; publicUrl: string }> {
  await ensureUploadsDirExists();

  const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  const publicUrl = `/uploads/fonts/${fileName}`;
  return { filePath, publicUrl };
}
