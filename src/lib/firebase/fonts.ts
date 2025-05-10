
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config';
import type { ParsedFontDetails } from '@/components/admin/font-upload-form';

export interface SavedFontConfigServer extends Omit<ParsedFontDetails, 'language'> {
  id?: string; // Firestore document ID, optional before save
  assignedLanguage: string; // Renamed from language for clarity as per user request interpretation
  fileName: string;
  fileSize: number;
  storagePath: string;
  downloadURL?: string; // Optional, if needed publicly
  createdAt: any; // Firestore ServerTimestamp
}


// Firestore collection reference
const fontsCollectionRef = collection(db, 'fonts');

/**
 * Uploads a font file to Firebase Storage.
 * @param file The font file to upload.
 * @param userId Optional user ID for namespacing, or use a generic path.
 * @returns Promise resolving to the storage path of the uploaded file.
 */
export async function uploadFontFile(file: File): Promise<{ storagePath: string, downloadURL: string }> {
  // Using a simple path for now, consider namespacing if multi-user or complex org needed.
  const storageRef = ref(storage, `fonts/${Date.now()}_${file.name}`);
  
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return { storagePath: snapshot.ref.fullPath, downloadURL };
}

/**
 * Saves font configuration to Firestore.
 * @param fontDetails The parsed font details from the form.
 * @param fontFile The original font file (for name and size).
 * @param storagePath The path where the font is stored in Firebase Storage.
 * @param downloadURL The public download URL of the font file.
 * @returns Promise resolving to the ID of the newly created Firestore document.
 */
export async function saveFontConfiguration(
  fontDetails: ParsedFontDetails, // Contains name, characters, and user-selected language
  fontFile: File,
  storagePath: string,
  downloadURL: string
): Promise<string> {
  
  const newFontConfig: Omit<SavedFontConfigServer, 'id'> = {
    name: fontDetails.name,
    assignedLanguage: fontDetails.language, // This comes from the form's language field
    characters: fontDetails.characters,
    fileName: fontFile.name,
    fileSize: fontFile.size,
    storagePath: storagePath,
    downloadURL: downloadURL,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(fontsCollectionRef, newFontConfig);
  return docRef.id;
}

/**
 * Fetches all saved font configurations from Firestore, ordered by creation date.
 * @returns Promise resolving to an array of SavedFontConfigServer.
 */
export async function getSavedFontConfigurations(): Promise<SavedFontConfigServer[]> {
  const q = query(fontsCollectionRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  const fonts: SavedFontConfigServer[] = [];
  querySnapshot.forEach((doc) => {
    fonts.push({ id: doc.id, ...doc.data() } as SavedFontConfigServer);
  });
  return fonts;
}
