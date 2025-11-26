import Tesseract from 'tesseract.js';

/**
 * ADAPTER PATTERN:
 * Currently uses Tesseract (Free).
 * In V2, we can swap this function to call Google Vision API without breaking the app.
 */
export const runOCR = async (file, onProgress) => {
  try {
    const result = await Tesseract.recognize(
      file,
      'eng',
      {
        logger: m => {
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(parseInt(m.progress * 100));
          }
        }
      }
    );
    
    // Return both raw text AND the geometric data (for Sniper Mode later)
    return {
      text: result.data.text,
      words: result.data.words // Contains {text, bbox} for coordinates
    };
  } catch (error) {
    console.error("OCR Failed", error);
    throw new Error("Failed to scan document");
  }
};
