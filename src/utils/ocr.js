import Tesseract from 'tesseract.js';
import { parseRawText } from './parsers';

/**
 * CLIENT-SIDE OPTICAL CHARACTER RECOGNITION
 * Powered by Tesseract.js (WASM)
 */
export const runOCR = async (file, category) => {
  try {
    // 🛡️ Safe Execution Block
    const result = await Tesseract.recognize(file, 'eng', {
      // logger: m => console.log(`[OCR] ${m.status}: ${Math.round(m.progress * 100)}%`),
      // Fallback if CDN is blocked (uses default worker)
      errorHandler: (err) => console.warn("Tesseract Worker Warning:", err)
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
    // 🛡️ Graceful Failure (Return empty so app continues with Gemini data)
    console.error("OCR Failed (Worker likely blocked):", error.message);
    return { 
        source: 'TESSERACT', 
        data: {}, 
        error: "Local OCR blocked. Used Server AI only." 
    };
  }
};
