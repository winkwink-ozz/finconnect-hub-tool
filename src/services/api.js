import axios from 'axios';

// 🚀 YOUR LIVE BACKEND URL
const API_URL = 'https://script.google.com/macros/s/AKfycbx74tEsxqCNcg78-mgEkPUdXBo8BluJ9GrsLoakNVKavsrMCUxDRp9kTYgYDWWZaa3L/exec';

export const api = {
  // 1. Analyze Document (Passes Category for Context)
  analyzeDocument: async (file, category) => { 
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64 = reader.result.split(',')[1]; 
          
          const response = await postRequest('ANALYZE_DOCUMENT', {
            fileBase64: base64,
            mimeType: file.type,
            fileName: file.name,
            docCategory: category // 👈 Key for the backend prompt switch
          });
          resolve(response.data);
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = error => reject(error);
    });
  },

  initMerchant: async (data) => {
    return await postRequest('INIT_MERCHANT', data);
  },

  saveOfficer: async (data) => {
    return await postRequest('SAVE_OFFICER', data);
  },

  logAudit: async (action, merchantId, details) => {
    postRequest('LOG_AUDIT', { user_action: action, target_merchant_id: merchantId, details });
  }
};

async function postRequest(action, payload) {
  try {
    const response = await axios.post(API_URL, JSON.stringify({ action, payload }), {
      headers: { 'Content-Type': 'text/plain' }
    });
    
    if (response.data.status === 'error') throw new Error(response.data.message);
    return response.data;
  } catch (error) {
    console.error(`API Error [${action}]:`, error);
    throw error;
  }
}
