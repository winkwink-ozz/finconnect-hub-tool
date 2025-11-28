import Tesseract from 'tesseract.js';
import { parseRawText } from './parsers';

/**
 * CLIENT-SIDE OPTICAL CHARACTER RECOGNITION
 * Powered by Tesseract.js (WASM)
 */
export const runOCR = async (file, category) => {
  try {
    // 1. Execute Tesseract
    const result = await Tesseract.recognize(file, 'eng', {
      // logger: m => console.log(`[OCR] ${m.status}: ${Math.round(m.progress * 100)}%`) // Uncomment for debug
    });

    const rawText = result.data.text;
    
    // 2. Parse Text (Regex Engine)
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
