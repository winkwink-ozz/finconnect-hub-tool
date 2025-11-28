import Tesseract from 'tesseract.js';
// ✅ FIX: Import the function with the correct name existing in parsers.js
import { parseRawText } from './parsers';

export const runSyntaxEngine = async (file, category) => {
  try {
    // 1. Run Tesseract (Client-Side OCR)
    const result = await Tesseract.recognize(file, 'eng', {
      logger: m => console.log(`[OCR] ${m.status}: ${Math.round(m.progress * 100)}%`)
    });

    const rawText = result.data.text;
    
    // 2. Parse the text using our Regex Engine
    // ✅ FIX: Call the correct function
    const extracted = parseRawText(rawText, category);

    return {
      source: 'TESSERACT',
      raw_text: rawText,
      data: extracted
    };
  } catch (error) {
    console.error("OCR Failed:", error);
    return { source: 'TESSERACT', data: {}, error: error.message };
  }
};
