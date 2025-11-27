import React, { useState } from 'react';
import { Upload, Plus, Trash2, CheckCircle, Loader2, Save, Shield, ArrowLeft, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';

const MerchantIntake = () => {
  // --- STATE ---
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  const [company, setCompany] = useState({
    company_name: '', registration_number: '', incorporation_date: '',
    country: '', registered_address: '', 
    file_id: '', folder_url: '' 
  });

  const [officers, setOfficers] = useState([
    { id: 1, full_name: '', role: 'Director', dob: '', passport_number: '', residential_address: '', file_id: '' }
  ]);

  // --- HANDLERS ---

  const handleAnalysis = async (file, type, officerId = null) => {
    if (!file) return;
    setAnalyzing(true);
    
    try {
      const result = await api.analyzeDocument(file);
      const data = result.analysis;
      const fileId = result.file_id;

      if (type === 'COMPANY') {
        setCompany(prev => ({
          ...prev,
          file_id: fileId,
          company_name: data.company_name || prev.company_name,
          registration_number: data.registration_number || prev.registration_number,
          incorporation_date: data.incorporation_date || prev.incorporation_date,
          country: data.country || prev.country,
          registered_address: data.registered_address || prev.registered_address
        }));
      } else if (type === 'OFFICER') {
        setOfficers(prev => prev.map(o => o.id === officerId ? {
          ...o,
          file_id: fileId,
          full_name: data.full_name || o.full_name,
          dob: data.dob || o.dob,
          passport_number: data.passport_number || o.passport_number
        } : o));
      }

    } catch (err) {
      alert("AI Analysis Failed: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const saveCompanyStep = async () => {
    if (!company.company_name) return alert("Company Name is required");
    setLoading(true);
    try {
      const res = await api.initMerchant(company);
      if (res.status === 'success') {
        setCompany(prev => ({ 
          ...prev, 
          merchant_id: res.data.merchant_id,
          folder_url: res.data.folder_url 
        }));
        setStep(2); 
      }
    } catch (err) {
      alert("Save Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitAll = async () => {
    setLoading(true);
    try {
      const promises = officers.map(officer => 
        api.saveOfficer({
          ...officer,
          merchant_id: company.merchant_id,
          merchant_folder_url: company.folder_url 
        })
      );
      await Promise.all(promises);
      api.logAudit("SUBMIT_APPLICATION", company.merchant_id, `Submitted with ${officers.length} officers`);
      alert("Onboarding Complete! Files saved to Drive.");
      window.location.href = "/"; 
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- UI COMPONENTS ---

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-100 pb-20 font-sans">
      
      {/* 🔹 HEADER WITH LOGO ANIMATION */}
      <div className="mb-10 border-b border-gray-800 pb-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          {/* LOGO CONTAINER */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative w-16 h-16 flex items-center justify-center bg-white rounded-2xl shadow-2xl border border-gold-500/50"
          >
            {/* The Logo Image */}
            <img src="/finconnect-hub-tool/logo.png" alt="Logo" className="w-10 h-10 object-contain z-10" />
            
            {/* Pulsing Gold Glow Behind */}
            <motion.div 
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-gold-400/20 rounded-2xl blur-lg -z-10"
            />
          </motion.div>

          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gold-gradient tracking-tight">
              Merchant Onboarding
            </h1>
            <p className="text-gray-500 text-sm mt-1">FinConnect Hub Secure Portal</p>
          </div>
        </div>

        <div className="flex gap-2 text-sm">
          <StepBadge num={1} label="Entity Details" active={step === 1} />
          <StepBadge num={2} label="Officers KYC" active={step === 2} />
        </div>
      </div>

      {/* 🔹 AI LOADING OVERLAY */}
      {analyzing && (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-6 relative"
          >
            <div className="absolute inset-0 bg-gold-500/20 blur-xl rounded-full"></div>
            <Cpu size={64} className="text-gold-400 relative z-10" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Gemini AI is Analyzing...</h2>
          <p className="text-gray-400">Extracting data & Securing file to Vault</p>
        </div>
      )}

      {/* 🔹 GLOBAL LOADING */}
      {loading && !analyzing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <Loader2 className="w-12 h-12 animate-spin text-gold-400" />
        </div>
      )}

      {/* STEP 1: COMPANY INFO */}
      {step === 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Upload Section */}
          <div className="bg-obsidian-800 p-8 rounded-2xl border border-gray-700 shadow-xl">
             <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-white">
                <div className="p-2 bg-gold-500/10 rounded-lg"><Upload className="text-gold-400" size={20} /></div>
                Upload Corporate Documents
             </h3>
             
             <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-gold-400 hover:bg-gray-800/50 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-gray-500 group-hover:text-gold-400 transition-colors" />
                  <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-white">Click to upload</span> Certificate of Inc.</p>
                  <p className="text-xs text-gray-500">JPG, PNG, PDF (AI Supported)</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*,application/pdf"
                  onChange={(e) => handleAnalysis(e.target.files[0], 'COMPANY')} 
                />
             </label>

             {company.file_id && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle size={16} /> File secured in Vault
                </div>
             )}
          </div>

          {/* Form Section */}
          <div className="space-y-5">
            <Input label="Company Legal Name" value={company.company_name} onChange={e => setCompany({...company, company_name: e.target.value})} />
            <Input label="Registration Number" value={company.registration_number} onChange={e => setCompany({...company, registration_number: e.target.value})} />
            <Input label="Date of Incorporation" value={company.incorporation_date} onChange={e => setCompany({...company, incorporation_date: e.target.value})} />
            <Input label="Country of Registration" value={company.country} onChange={e => setCompany({...company, country: e.target.value})} />
            <Input label="Registered Address" value={company.registered_address} onChange={e => setCompany({...company, registered_address: e.target.value})} />

            <div className="pt-4 flex justify-end">
              <button 
                onClick={saveCompanyStep}
                className="bg-gold-gradient text-black font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-gold-500/20"
              >
                Proceed to Officers <CheckCircle size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 2: OFFICERS */}
      {step === 2 && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Directors & Shareholders</h2>
            <button 
              onClick={() => setOfficers([...officers, { id: Date.now(), full_name: '', role: 'Director', dob: '', passport_number: '', file_id: '' }])} 
              className="text-sm bg-obsidian-800 hover:bg-gray-700 px-4 py-2 rounded-lg border border-gray-600 flex items-center gap-2 transition-colors"
            >
              <Plus size={16} /> Add Person
            </button>
          </div>

          {officers.map((officer, index) => (
            <div key={officer.id} className="bg-obsidian-800 p-6 rounded-xl border border-gray-700 relative shadow-xl hover:border-gray-600 transition-colors">
              <div className="absolute top-4 right-4 text-gray-500 hover:text-red-400 cursor-pointer p-2" onClick={() => setOfficers(officers.filter(o => o.id !== officer.id))}>
                <Trash2 size={18} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Upload Area for Officer */}
                <div className="col-span-1">
                   <h3 className="text-gold-400 font-medium mb-3 flex items-center gap-2">
                    <Shield size={16} /> Officer #{index + 1}
                   </h3>
                   <label className="flex flex-col items-center justify-center h-32 border border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-black/20">
                      <div className="text-center">
                         <Upload className="mx-auto text-gray-500 mb-1" size={20} />
                         <span className="text-xs text-gray-400">Upload ID/Passport</span>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*,application/pdf"
                        onChange={(e) => handleAnalysis(e.target.files[0], 'OFFICER', officer.id)} 
                      />
                   </label>
                   {officer.file_id && <p className="text-xs text-green-400 mt-2 flex items-center gap-1"><CheckCircle size={12}/> ID Secured</p>}
                </div>

                {/* Form Inputs */}
                <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Full Name" value={officer.full_name} onChange={e => setOfficers(officers.map(o => o.id === officer.id ? { ...o, full_name: e.target.value } : o))} />
                  <Input label="Role" value={officer.role} onChange={e => setOfficers(officers.map(o => o.id === officer.id ? { ...o, role: e.target.value } : o))} />
                  <Input label="Passport Number" value={officer.passport_number} onChange={e => setOfficers(officers.map(o => o.id === officer.id ? { ...o, passport_number: e.target.value } : o))} />
                  <Input label="Date of Birth" value={officer.dob} onChange={e => setOfficers(officers.map(o => o.id === officer.id ? { ...o, dob: e.target.value } : o))} />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-6 border-t border-gray-800">
            <button 
              onClick={submitAll}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg shadow-green-500/20 hover:scale-105 transition-all"
            >
              <Save size={20} /> Complete Onboarding
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const Input = ({ label, value, onChange }) => (
  <div className="w-full">
    <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">{label}</label>
    <input 
      type="text" 
      value={value || ''}
      onChange={onChange}
      className="w-full bg-obsidian-900 border border-gray-700 rounded-lg p-3 text-white focus:border-gold-400 focus:ring-1 focus:ring-gold-400 focus:outline-none transition-all"
    />
  </div>
);

const StepBadge = ({ num, label, active }) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${active ? 'bg-gold-500/20 border border-gold-500/30' : 'bg-transparent opacity-50'}`}>
    <span className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${active ? 'bg-gold-400 text-black' : 'bg-gray-700 text-gray-400'}`}>
      {num}
    </span>
    <span className={`text-xs font-medium ${active ? 'text-gold-100' : 'text-gray-500'}`}>{label}</span>
  </div>
);

export default MerchantIntake;
