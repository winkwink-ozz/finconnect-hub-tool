import axios from 'axios';

// Load Environment Variables
const API_URL = import.meta.env.VITE_API_URL;
const API_SECRET = import.meta.env.VITE_API_SECRET;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    // Standard headers (CORS is handled by GAS script or proxy)
    'Content-Type': 'text/plain', // Keep text/plain for GAS compatibility
  },
});

export const api = {
  // Generic POST wrapper
  post: async (action, payload = {}) => {
    try {
      // GAS expects stringified body to avoid OPTIONS preflight issues
      const body = JSON.stringify({
        auth_token: API_SECRET,
        action: action,
        payload: payload,
      });

      const response = await apiClient.post('', body);
      
      if (response.data.status === 'error') {
        throw new Error(response.data.message);
      }
      return response.data.data;
    } catch (error) {
      console.error(`API Error [${action}]:`, error);
      throw error;
    }
  },

  // --- MERCHANT OPERATIONS ---
  getAllMerchants: () => api.post('GET_ALL_MERCHANTS'),
  
  // Updated to match your GAS 'INIT_MERCHANT'
  initMerchant: (data) => api.post('INIT_MERCHANT', data), 
  
  updateMerchant: (data) => api.post('UPDATE_MERCHANT', data),
  
  saveOfficer: (data) => api.post('SAVE_OFFICER', data),

  // --- AI OPERATIONS (Required for MerchantIntake) ---
  analyzeDocument: async (file, category) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        api.post('ANALYZE_DOCUMENT', {
          fileBase64: base64,
          fileName: file.name,
          mimeType: file.type,
          docCategory: category
        }).then(resolve).catch(reject);
      };
      reader.onerror = (error) => reject(error);
    });
  },

  // --- LOGGING ---
  logAudit: (action, merchantId, details) => api.post('LOG_AUDIT', {
    user_action: action,
    target_merchant_id: merchantId,
    details: details
  })
};
