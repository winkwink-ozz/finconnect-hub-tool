/**
 * TESSERACT REGEX PARSERS (V3.2 - Flexible Dates & Visual Priority)
 */

export const parseRawText = (text, docCategory) => {
  const cleanLines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  if (docCategory.includes('CERT_')) {
    return parseEntity(text, cleanLines);
  } else if (docCategory.includes('PASSPORT') || docCategory.includes('ID')) {
    return parsePassport(text, cleanLines);
  }
  return {};
};

const parseEntity = (text, lines) => {
  const extracted = {};

  // 1. REGISTRATION NUMBER
  const heMatch = text.match(/\b(HE\s?\d{5,8})\b/i);
  const ukMatch = text.match(/\b(SC\d{6}|OC\d{6})\b/i);
  const genericMatch = text.match(/\b(\d{6,8})\b/); 

  if (heMatch) extracted.registration_number = heMatch[0].replace(/\s/g, '');
  else if (ukMatch) extracted.registration_number = ukMatch[0];
  else if (genericMatch) extracted.registration_number = genericMatch[0];

  // 2. DATES (Flexible Formats)
  const numericDate = text.match(/(\d{1,2}[/-]\d{2}[/-]\d{4})/);
  const alphaDate = text.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i);
  const verboseDate = text.match(/(\d{1,2}(?:st|nd|rd|th)?\s+day\s+of\s+[A-Za-z]+\s*,?\s*\d{4})/i);

  if (numericDate) extracted.incorporation_date = numericDate[0];
  else if (alphaDate) extracted.incorporation_date = alphaDate[0];
  else if (verboseDate) extracted.incorporation_date = verboseDate[0];

  // 3. COMPANY NAME
  const nameLine = lines.find(line => 
    /^[A-Z0-9\s\.\&]+$/.test(line) && 
    (line.includes("LIMITED") || line.includes("LTD") || line.includes("INC")) &&
    !line.includes("CERTIFY") &&
    !line.includes("CERTIFICATE")
  );
  if (nameLine) extracted.company_name = nameLine;

  // 4. COUNTRY (Keyword Search)
  if (text.match(/Cyprus/i) || text.match(/HE\d+/)) extracted.country = "Cyprus";
  else if (text.match(/Hong Kong/i)) extracted.country = "Hong Kong";
  else if (text.match(/United Kingdom|England|Wales|Companies House/i)) extracted.country = "United Kingdom";
  else if (text.match(/British Virgin Islands|BVI/i)) extracted.country = "British Virgin Islands";

  return extracted;
};

const parsePassport = (text, lines) => {
  const extracted = {};

  // 1. VISUAL PRIORITY (Top Right)
  const potentialIds = text.match(/\b([A-Z0-9]{9})\b/g);
  if (potentialIds) {
    const validId = potentialIds.find(id => !/\d{2}[A-Z]{3}\d{4}/.test(id));
    if (validId) extracted.passport_number = validId;
  }

  // 2. MRZ BACKUP
  const mrzLine2 = lines.find(l => l.match(/[A-Z0-9]{9}\d[A-Z]{3}\d{6}/)); 
  if (!extracted.passport_number && mrzLine2) {
    extracted.passport_number = mrzLine2.substring(0, 9).replace(/</g, '');
  }

  // 3. DOB
  const dobMatch = text.match(/(\d{1,2}\s[A-Z]{3}\s\d{4}|\d{2}[/-]\d{2}[/-]\d{4})/i);
  if (dobMatch) extracted.dob = dobMatch[0];

  return extracted;
};
