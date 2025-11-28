import axios from 'axios';

// 🚀 ENV CONFIGURATION
const API_URL = import.meta.env.VITE_API_URL;
const API_SECRET = import.meta.env.VITE_API_SECRET;

if (!API_URL || !API_SECRET) {
  console.error("CRITICAL: VITE_API_URL or VITE_API_SECRET is missing in .env file");
}

export const api = {
  // --- READ OPERATIONS (ADMIN) ---
  getMerchants: async () => {
    const res = await postRequest('GET_ALL_MERCHANTS', {});
    return res.data;
  },

  getMerchantDetails: async (id) => {
    const res = await postRequest('GET_MERCHANT_FULL', { merchant_id: id });
    return res.data;
  },

  getFolderFiles: async (folderId) => {
    const res = await postRequest('GET_FOLDER_FILES', { folder_id: folderId });
    return res.data;
  },

  updateMerchant: async (data) => {
    return await postRequest('UPDATE_MERCHANT', data);
  },

  // --- WRITE OPERATIONS (ONBOARDING) ---
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
            docCategory: category
          });
          resolve(response.data);
        } catch (e) { reject(e); }
      };
      reader.onerror = error => reject(error);
    });
  },

  initMerchant: async (data) => postRequest('INIT_MERCHANT', data),
  saveOfficer: async (data) => postRequest('SAVE_OFFICER', data),
  logAudit: async (action, merchantId, details) => postRequest('LOG_AUDIT', { user_action: action, target_merchant_id: merchantId, details })
};

// Helper function to handle GAS CORS and Authentication
async function postRequest(action, payload) {
  try {
    const body = JSON.stringify({
      action,
      payload,
      auth_token: API_SECRET // 🔒 INJECT SECRET
    });

    const response = await axios.post(API_URL, body, {
      headers: { 'Content-Type': 'text/plain' }
    });
    
    if (response.data.status === 'error') throw new Error(response.data.message);
    return response.data;
  } catch (error) {
    console.error(`API Error [${action}]:`, error);
    throw error;
  }
}
