import React, { useState } from 'react';
import { Upload, Plus, Trash2, CheckCircle, Loader2, Save, FileText, Shield } from 'lucide-react';
import { api } from '../services/api';
import { runOCR } from '../utils/ocr';

const MerchantIntake = () => {
  // --- STATE MANAGEMENT ---
  const [step, setStep] = useState(1); // 1 = Company, 2 = Officers
  const [loading, setLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  
  // Data State: Company
  const [company, setCompany] = useState({
    company_name: '',
    registration_number: '',
    incorporation_date: '',
    country: '',
    registered_address: '',
    folder_url: '' // Will be filled by API
  });

  // Data State: Officers (Array)
  const [officers, setOfficers] = useState([
    { id: 1, full_name: '', role: 'Director', dob: '', passport_number: '', residential_address: '' }
  ]);

  // --- HANDLERS: COMPANY ---
  
  const handleCompanyOCR = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      // 1. Run OCR
      const { text } = await runOCR(file, setOcrProgress);
      
      // 2. Simple Regex Parsing (Smart guessing)
      const nameMatch = text.match(/(?:Company Name|Name of Company)[:\s]+([^\n]+)/i);
      const regMatch = text.match(/(?:Registration No|Reg No)[:\s]+([\w\d]+)/i);
      const dateMatch = text.match(/(\d{2}[/-]\d{2}[/-]\d{4})/);

      // 3. Auto-fill
      setCompany(prev => ({
        ...prev,
        company_name: nameMatch ? nameMatch[1].trim() : prev.company_name,
        registration_number: regMatch ? regMatch[1].trim() : prev.registration_number,
        incorporation_date: dateMatch ? dateMatch[1] : prev.incorporation_date
      }));
    } catch (err) {
      alert("OCR Failed: " + err.message);
    } finally {
      setLoading(false);
      setOcrProgress(0);
    }
  };

  const saveCompanyStep = async () => {
    if (!company.company_name) return alert("Company Name is required");
    setLoading(true);
    try {
      const res = await api.initMerchant(company);
      if (res.status === 'success') {
        // Save the IDs returned by backend
        setCompany(prev => ({ ...prev, merchant_id: res.data.merchant_id }));
        setStep(2); // Move to next step
      }
    } catch (err) {
      alert("Save Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS: OFFICERS ---

  const addOfficer = () => {
    setOfficers([...officers, { 
      id: Date.now(), 
      full_name: '', role: 'Director', dob: '', passport_number: '', residential_address: '' 
    }]);
  };

  const removeOfficer = (id) => {
    setOfficers(officers.filter(o => o.id !== id));
  };

  const updateOfficer = (id, field, value) => {
    setOfficers(officers.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const handleOfficerOCR = async (id, e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Local loading state for specific card could be added here
    setLoading(true); 
    try {
      const { text } = await runOCR(file);
      
      // Smart Parse for Passport/ID
      const dobMatch = text.match(/(\d{2}\s[A-Z]{3}\s\d{4}|\d{2}[/-]\d{2}[/-]\d{4})/);
      const passportMatch = text.match(/[A-Z0-9]{9}/); // Generic passport regex

      updateOfficer(id, 'dob', dobMatch ? dobMatch[0] : '');
      updateOfficer(id, 'passport_number', passportMatch ? passportMatch[0] : '');
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitAll = async () => {
    setLoading(true);
    try {
      // Loop through all officers and save them linked to the merchant
      const promises = officers.map(officer => 
        api.saveOfficer({
          ...officer,
          merchant_id: company.merchant_id // Link foreign key
        })
      );
      
      await Promise.all(promises);
      
      api.logAudit("SUBMIT_APPLICATION", company.merchant_id, `Submitted with ${officers.length} officers`);
      
      alert("Application Submitted Successfully!");
      window.location.href = "/"; // Go back to dashboard
    } catch (err) {
      alert("Error saving officers: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- UI COMPONENTS ---

  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-100">
      
      {/* Header */}
      <div className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-gold-400">New Client Intake</h1>
        <div className="flex gap-4 mt-4 text-sm">
          <span className={`px-3 py-1 rounded ${step === 1 ? 'bg-gold-500 text-black' : 'bg-gray-800'}`}>1. Entity Details</span>
          <span className={`px-3 py-1 rounded ${step === 2 ? 'bg-gold-500 text-black' : 'bg-gray-800'}`}>2. Officers (KYC)</span>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-gold-400 mx-auto mb-2" />
            <p>Processing... {ocrProgress > 0 && `${ocrProgress}%`}</p>
          </div>
        </div>
      )}

      {/* STEP 1: COMPANY INFO */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          
          {/* File Upload Zone */}
          <div className="bg-obsidian-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload className="text-gold-400" size={20} /> Upload Certificate of Incorporation
            </h3>
            <input 
              type="file" 
              onChange={handleCompanyOCR} 
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold-500 file:text-black hover:file:bg-gold-400"
            />
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Company Name" value={company.company_name} onChange={e => setCompany({...company, company_name: e.target.value})} />
            <Input label="Registration Number" value={company.registration_number} onChange={e => setCompany({...company, registration_number: e.target.value})} />
            <Input label="Incorporation Date" value={company.incorporation_date} onChange={e => setCompany({...company, incorporation_date: e.target.value})} />
            <Input label="Country of Registration" value={company.country} onChange={e => setCompany({...company, country: e.target.value})} />
            <div className="md:col-span-2">
              <Input label="Registered Address" value={company.registered_address} onChange={e => setCompany({...company, registered_address: e.target.value})} />
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button 
              onClick={saveCompanyStep}
              className="bg-gold-500 hover:bg-gold-400 text-black font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all"
            >
              Next: Add Officers <CheckCircle size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: OFFICERS */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Directors & Shareholders</h2>
            <button onClick={addOfficer} className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded flex items-center gap-2">
              <Plus size={16} /> Add Person
            </button>
          </div>

          {officers.map((officer, index) => (
            <div key={officer.id} className="bg-obsidian-800 p-6 rounded-xl border border-gray-700 relative">
              
              <div className="absolute top-4 right-4 text-gray-500 hover:text-red-400 cursor-pointer" onClick={() => removeOfficer(officer.id)}>
                <Trash2 size={18} />
              </div>

              <h3 className="text-gold-400 font-medium mb-4 flex items-center gap-2">
                <Shield size={16} /> Officer #{index + 1}
              </h3>

              {/* Officer Upload */}
              <div className="mb-4 p-4 bg-black/20 rounded border border-dashed border-gray-700">
                <p className="text-xs text-gray-500 mb-2">Upload ID/Passport to Auto-fill</p>
                <input type="file" onChange={(e) => handleOfficerOCR(officer.id, e)} className="text-xs text-gray-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name" value={officer.full_name} onChange={e => updateOfficer(officer.id, 'full_name', e.target.value)} />
                <Input label="Role (Director/UBO)" value={officer.role} onChange={e => updateOfficer(officer.id, 'role', e.target.value)} />
                <Input label="Passport Number" value={officer.passport_number} onChange={e => updateOfficer(officer.id, 'passport_number', e.target.value)} />
                <Input label="Date of Birth" value={officer.dob} onChange={e => updateOfficer(officer.id, 'dob', e.target.value)} />
                <div className="md:col-span-2">
                   <Input label="Residential Address" value={officer.residential_address} onChange={e => updateOfficer(officer.id, 'residential_address', e.target.value)} />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-800">
            <button 
              onClick={submitAll}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-green-500/20 transition-all"
            >
              <Save size={20} /> Submit Application
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Input Component to keep code clean
const Input = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
    <input 
      type="text" 
      value={value || ''}
      onChange={onChange}
      className="w-full bg-obsidian-900 border border-gray-600 rounded p-2 text-white focus:border-gold-400 focus:outline-none transition-colors"
    />
  </div>
);

export default MerchantIntake;
