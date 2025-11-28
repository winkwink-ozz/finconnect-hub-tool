import Tesseract from 'tesseract.js';
import { parseOCRText } from './parsers';

export const runSyntaxEngine = async (file, category) => {
  try {
    const result = await Tesseract.recognize(file, 'eng', {
      logger: m => console.log(`[OCR] ${m.status}: ${Math.round(m.progress * 100)}%`)
    });

    const rawText = result.data.text;
    const extracted = parseOCRText(rawText, category);

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
