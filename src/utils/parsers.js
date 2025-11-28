/**
 * src/utils/parsers.js
 * SYNTAX ENGINE: Regex Pattern Matchers
 * Optimized for performance and stability.
 */

// 1. Define Strict Patterns (The "Hard Rules")
export const patterns = {
  // Cyprus Company Reg (e.g., HE 123456, HE123456)
  registration_number: /\b(HE|SE|AE)\s?(\d{5,6})\b/i,
  
  // Dates (DD/MM/YYYY or DD-MM-YYYY)
  date: /\b(0[1-9]|[12][0-9]|3[01])[\/\-.](0[1-9]|1[0-2])[\/\-.](\d{4})\b/,
  
  // Passport MRZ (Machine Readable Zone) - 2 lines, 44 chars
  passport_mrz: /P<([A-Z]{3})([A-Z<]+)<<([A-Z<]+)<{2,}\n([A-Z0-9<]{9})(\d)([A-Z]{3})(\d{6})(\d)([MF<])(\d{6})(\d)/,

  // Generic Passport Number (Alphanumeric 6-9 chars)
  passport_generic: /\b[A-Z0-9]{6,9}\b/
};

// 2. The Main Function (Renamed back to 'parseRawText' to fix build)
export const parseRawText = (text, category) => {
  if (!text) return {};
  
  const cleanText = text.replace(/\r\n/g, "\n");
  const extracted = {};

  // --- STRATEGY: CORPORATE DOCS ---
  if (category === 'CERT_INC' || category === 'CERT_INCUMBENCY') {
    const regMatch = cleanText.match(patterns.registration_number);
    const dateMatch = cleanText.match(patterns.date);
    
    if (regMatch) extracted.registration_number = regMatch[0].replace(/\s/g, '').toUpperCase();
    if (dateMatch) extracted.incorporation_date = dateMatch[0];
  }

  // --- STRATEGY: IDENTITY DOCS ---
  else if (category === 'PASSPORT_ID') {
    // Priority: Try to find MRZ first (High Confidence)
    const mrzMatch = cleanText.match(patterns.passport_mrz);
    
    if (mrzMatch) {
      extracted.passport_number = mrzMatch[4]; // Group 4 is the number in MRZ standard
    } else {
      // Fallback: Look for "Passport No" label
      const simpleMatch = cleanText.match(/(?:Passport No|Doc No)\.?\s*([A-Z0-9]+)/i);
      if (simpleMatch) extracted.passport_number = simpleMatch[1];
    }
    
    const dateMatch = cleanText.match(patterns.date);
    if (dateMatch) extracted.dob = dateMatch[0];
  }

  // --- STRATEGY: UTILITY BILLS ---
  else if (category === 'CERT_ADDRESS' || category === 'ENTITY_UTILITY') {
    // Utility bills are hard for Regex. We mostly rely on Gemini here.
    // We just look for a date to ensure the bill is recent.
    const dateMatch = cleanText.match(patterns.date);
    if (dateMatch) extracted.bill_date = dateMatch[0];
  }

  return extracted;
};
