
// SUPPORTED_LANGUAGES might still be used in other parts like LabelingForm,
// but for the generator, the list of languages will come from available fonts.
export const SUPPORTED_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ne', label: 'Nepali' },
  // Add other languages here if needed
];

export const DEFAULT_GRID_ROWS = 10; // Kept for labeling form defaults
export const DEFAULT_GRID_COLS = 10; // Kept for labeling form defaults

// NEPALI_ALPHABETS and ENGLISH_ALPHABETS are no longer the primary source for PracticeSheetPreview.
// The character sets will come from the uploaded font data.
// These can be kept for fallback or other purposes if necessary, but are not directly used by generator preview now.

export const NEPALI_ALPHABETS_FALLBACK: string[] = [
  // Vowels (स्वरवर्ण)
  'अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः',
  // Consonants (व्यञ्जनवर्ण)
  'क', 'ख', 'ग', 'घ', 'ङ',
  'च', 'छ', 'ज', 'झ', 'ञ',
  'ट', 'ठ', 'ड', 'ढ', 'ण',
  'त', 'थ', 'द', 'ध', 'न',
  'प', 'फ', 'ब', 'भ', 'म',
  'य', 'र', 'ल', 'व',
  'श', 'ष', 'स', 'ह',
  'क्ष', 'त्र', 'ज्ञ',
  // Devanagari Numerals (देवनागरी अङ्क)
  '०', '१', '२', '३', '४', '५', '६', '७', '८', '९',
];


export const ENGLISH_ALPHABETS_FALLBACK: string[] = [
  // Uppercase
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  // Lowercase
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  // Numbers
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
];
