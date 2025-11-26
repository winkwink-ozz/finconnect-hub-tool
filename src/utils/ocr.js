import Tesseract from 'tesseract.js';

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
    
    return {
      text: result.data.text,
      words: result.data.words 
    };
  } catch (error) {
    console.error("OCR Failed", error);
    throw new Error("Failed to scan document");
  }
};
