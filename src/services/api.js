import axios from 'axios';

// 🚀 YOUR LIVE BACKEND URL
const API_URL = 'https://script.google.com/macros/s/AKfycbx74tEsxqCNcg78-mgEkPUdXBo8BluJ9GrsLoakNVKavsrMCUxDRp9kTYgYDWWZaa3L/exec';

export const api = {
  // 1. Initialize Merchant (Create Folder + Merchant Row)
  initMerchant: async (companyData) => {
    return await postRequest('INIT_MERCHANT', companyData);
  },

  // 2. Save Officer (Director/Shareholder)
  saveOfficer: async (officerData) => {
    return await postRequest('SAVE_OFFICER', officerData);
  },

  // 3. Save Questionnaire
  saveQuestionnaire: async (qData) => {
    return await postRequest('SAVE_QUESTIONNAIRE', qData);
  },

  // 4. Audit Log
  logAudit: async (action, merchantId, details) => {
    // Fire and forget (don't await)
    postRequest('LOG_AUDIT', { 
      user_action: action, 
      target_merchant_id: merchantId, 
      details 
    });
  }
};

// Helper function to handle GAS CORS behavior
async function postRequest(action, payload) {
  try {
    const response = await axios.post(API_URL, JSON.stringify({
      action,
      payload
    }), {
      headers: { 'Content-Type': 'text/plain' }
    });
    
    if (response.data.status === 'error') throw new Error(response.data.message);
    return response.data;
  } catch (error) {
    console.error(`API Error [${action}]:`, error);
    throw error;
  }
}