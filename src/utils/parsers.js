/**
 * SYNTAX ENGINE: Regex Pattern Matchers
 * Used by Tesseract to validate strictly formatted data.
 */

export const patterns = {
  // Cyprus Company Reg (e.g., HE 123456)
  registration_number: /\b(HE|SE|AE)\s?(\d{5,6})\b/i,
  
  // Dates (DD/MM/YYYY)
  date: /\b(0[1-9]|[12][0-9]|3[01])[\/\-.](0[1-9]|1[0-2])[\/\-.](\d{4})\b/,
  
  // Passport MRZ (Machine Readable Zone) - 2 lines, 44 chars
  passport_mrz: /P<([A-Z]{3})([A-Z<]+)<<([A-Z<]+)<{2,}\n([A-Z0-9<]{9})(\d)([A-Z]{3})(\d{6})(\d)([MF<])(\d{6})(\d)/
};

export const parseOCRText = (text, category) => {
  const cleanText = text.replace(/\r\n/g, "\n");
  
  if (category === 'CERT_INC') {
    const regMatch = cleanText.match(patterns.registration_number);
    const dateMatch = cleanText.match(patterns.date);
    return {
      registration_number: regMatch ? regMatch[0].replace(/\s/g, '').toUpperCase() : null,
      incorporation_date: dateMatch ? dateMatch[0] : null
    };
  }

  if (category === 'PASSPORT_ID') {
    // Try to find MRZ or standard passport patterns
    const passportMatch = cleanText.match(/[A-Z0-9]{9}/); // Simple fallback
    return {
      passport_number: passportMatch ? passportMatch[0] : null
    };
  }

  return {};
};
