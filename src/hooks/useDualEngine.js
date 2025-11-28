import { useState } from 'react';
import { api } from '../services/api'; 
import { runOCR } from '../utils/ocr'; // ✅ Fixed Import

export const useDualEngine = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState('');

  const analyzeDocument = async (file, category) => {
    setAnalyzing(true);
    setProgress('Initializing Dual-Engine...');
    
    try {
      // 🚀 STEP 1: Parallel Execution
      setProgress('Scanning (Gemini + Tesseract)...');
      
      // Engine A: Gemini (Server-Side)
      // Note: Ensure your api.js has analyzeDocument. If not, this returns empty.
      const engineAPromise = api.analyzeDocument 
        ? api.analyzeDocument(file, category).catch(e => ({ analysis: {}, error: e.message }))
        : Promise.resolve({ analysis: {} });
      
      // Engine B: Tesseract (Client-Side)
      const engineBPromise = runOCR(file, category)
        .catch(e => ({ data: {}, error: e.message }));

      const [geminiResult, tesseractResult] = await Promise.all([engineAPromise, engineBPromise]);

      console.log("Gemini Raw:", geminiResult);
      console.log("Tesseract Raw:", tesseractResult);

      // 🧠 STEP 2: Consensus Merge
      // Priority: Gemini (Context) > Tesseract (Regex)
      
      const mergedData = { ...(geminiResult.analysis || {}) };
      const tessData = tesseractResult.data || {};
      
      // Fill gaps with Tesseract if Gemini missed them
      if (!mergedData.registration_number && tessData.registration_number) {
        mergedData.registration_number = tessData.registration_number;
      }
      if (!mergedData.incorporation_date && tessData.incorporation_date) {
        mergedData.incorporation_date = tessData.incorporation_date;
      }
      if (!mergedData.passport_number && tessData.passport_number) {
        mergedData.passport_number = tessData.passport_number;
      }

      setProgress('Complete');
      return {
        success: true,
        data: mergedData,
        file_id: geminiResult.file_id, 
        file_url: geminiResult.file_url 
      };

    } catch (error) {
      console.error("Dual Engine Failed:", error);
      return { success: false, error: error.message };
    } finally {
      setAnalyzing(false);
    }
  };

  return { analyzeDocument, analyzing, progress };
};
