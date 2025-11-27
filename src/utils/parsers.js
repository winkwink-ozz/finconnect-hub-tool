/**
 * TESSERACT REGEX PARSERS
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

  // 1. REGISTRATION NUMBER (Cyprus HE, UK SC/OC, or generic 6-8 digits)
  const heMatch = text.match(/\b(HE\s?\d{5,8})\b/i);
  const ukMatch = text.match(/\b(SC\d{6}|OC\d{6})\b/i);
  const genericMatch = text.match(/\b(\d{6,8})\b/); 

  if (heMatch) extracted.registration_number = heMatch[0].replace(/\s/g, '');
  else if (ukMatch) extracted.registration_number = ukMatch[0];
  else if (genericMatch) extracted.registration_number = genericMatch[0];

  // 2. DATES (DD/MM/YYYY or DD-Month-YYYY)
  const dateMatch = text.match(/(\d{1,2}[/-]\d{2}[/-]\d{4})/);
  if (dateMatch) extracted.incorporation_date = dateMatch[0];

  // 3. COMPANY NAME (Exclude Headers)
  const nameLine = lines.find(line => 
    /^[A-Z0-9\s\.]+$/.test(line) && 
    (line.includes("LIMITED") || line.includes("LTD") || line.includes("INC")) &&
    !line.includes("CERTIFY") &&
    !line.includes("CERTIFICATE") &&
    !line.includes("INCORPORATION")
  );
  if (nameLine) extracted.company_name = nameLine;

  return extracted;
};

const parsePassport = (text, lines) => {
  const extracted = {};

  // 1. MRZ PARSING
  const mrzLine = lines.find(l => l.startsWith("P<"));
  if (mrzLine) {
    const parts = mrzLine.split('<').filter(p => p.length > 0);
    // Rough logic: Name is usually the 2nd part in P<Type<Name
    if (parts.length >= 2) {
      extracted.passport_number = text.match(/[A-Z0-9]{9}/) ? text.match(/[A-Z0-9]{9}/)[0] : ""; 
    }
  }

  // 2. VISUAL PASSPORT NUMBER
  if (!extracted.passport_number) {
    const passMatch = text.match(/\b([A-Z0-9]{9})\b/);
    if (passMatch) extracted.passport_number = passMatch[0];
  }

  // 3. DOB
  const dobMatch = text.match(/(\d{2}\s[A-Z]{3}\s\d{4}|\d{2}[/-]\d{2}[/-]\d{4})/);
  if (dobMatch) extracted.dob = dobMatch[0];

  return extracted;
};
