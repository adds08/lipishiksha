
export const SUPPORTED_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ne', label: 'Nepali' },
  // Add other languages here if needed
];

export const DEFAULT_GRID_ROWS = 10; // Kept for labeling form defaults
export const DEFAULT_GRID_COLS = 10; // Kept for labeling form defaults

export const NEPALI_ALPHABETS: string[] = [
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

  // Common Conjuncts (संयुक्त अक्षर)
  'क्ष', 'त्र', 'ज्ञ',

  // Devanagari Numerals (देवनागरी अङ्क)
  '०', '१', '२', '३', '४', '५', '६', '७', '८', '९',

  // Selected Matra Forms (मात्रा लागेका अक्षरहरू - उदाहरण)
  // Using 'क'
  'का', 'कि', 'की', 'कु', 'कू', 'कृ', 'के', 'कै', 'को', 'कौ', 'कं', 'कः',
  // Using 'ग'
  'गा', 'गि', 'गी', 'गु', 'गू', 'गृ', 'गे', 'गै', 'गो', 'गौ', 'गं', 'गः',
  // Using 'त'
  'ता', 'ति', 'ती', 'तु', 'तू', 'तृ', 'ते', 'तै', 'तो', 'तौ', 'तं', 'तः',
  // Using 'न'
  'ना', 'नि', 'नी', 'नु', 'नू', 'नृ', 'ने', 'नै', 'नो', 'नौ', 'नं', 'नः',
  // Using 'म'
  'मा', 'मि', 'मी', 'मु', 'मू', 'मृ', 'मे', 'मै', 'मो', 'मौ', 'मं', 'मः',
  
  // Chandrabindu examples (चन्द्रबिन्दु)
  'अँ', 'आँ', 'इँ', 'उँ', 'कँ', 'गँ', 'चाँ',

  // More common conjuncts/forms (थप संयुक्त अक्षरहरू)
  'द्य', // द् + य (vidyalaya)
  'द्व', // द् + व (dwara)
  'प्र', // प् + र (prakaash)
  'क्र', // क् + र (krama)
  'ग्र', // ग् + र (graha)
  'ट्र', // ट् + र (truck - often used for English words)
  'र्क', // र् + क (arka - reph form)
  'र्म', // र् + म (karma)
  'र्व', // र् + व (sarva)
  'र्य', // र् + य (karya)
  'द्ध', // द् + ध (buddha)
  'द्म', // द् + म (padma)
  'श्च', // श् + च (pashchim)
  'क्व', // क् + व (क्वचित्)
  'ङ्ग', // ङ् + ग (सङ्ग)
  'ङ्क्त', // ङ् + क + त (पङ्क्ति)
  'श्च', // श् + च (निश्चित)
  'ज्ञ', // Already included, but is a conjunct
  'श्र'  // श् + र (shram)
];


export const ENGLISH_ALPHABETS: string[] = [
  // Uppercase
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  // Lowercase
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  // Numbers
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
];
