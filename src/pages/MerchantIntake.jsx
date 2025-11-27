import React, { useState } from 'react';
import { Upload, Plus, Trash2, CheckCircle, Loader2, Save, Shield, ArrowLeft, Cpu, Eye, EyeOff, FileJson, Lock, FileText, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { runOCR } from '../utils/ocr'; 
import { parseRawText } from '../utils/parsers';

const MerchantIntake = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [debugData, setDebugData] = useState(null); 
  const [localData, setLocalData] = useState(null); 
  
  const [docType, setDocType] = useState(""); 
  const [company, setCompany] = useState({
    company_name: '', registration_number: '', incorporation_date: '',
    country: '', registered_address: '', operational_address: '',
    file_id: '', folder_url: '' 
  });

  const [officers, setOfficers] = useState([
    { id: 1, full_name: '', role: '', dob: '', passport_number: '', residential_address: '', doc_type: '', file_id: '' }
  ]);

  // 🛠️ HELPER: Smartly unpacks data
  const getVal = (primary, secondary) => {
    if (primary) {
      if (typeof primary === 'object' && primary.val) return primary.val;
      if (typeof primary === 'string') return primary;
    }
    if (secondary) return secondary;
    return "";
  };

  // 🧠 LOGIC: Dynamic Document Filtering
  const getEntityDocOptions = () => {
    const options = [];
    // Only show ID docs if ID fields are missing
    if (!company.company_name || !company.registration_number || !company.incorporation_date) {
      options.push({ val: "CERT_INC", label: "Certificate of Incorporation" });
    }
    if (!company.registered_address) {
      options.push({ val: "CERT_INCUMBENCY", label: "Certificate of Incumbency" });
      options.push({ val: "CERT_ADDRESS", label: "Certificate of Reg Address" });
      options.push({ val: "ENTITY_UTILITY", label: "Company Utility Bill" });
    }
    return options.length > 0 ? options : [{ val: "", label: "All Data Extracted! (Review below)" }];
  };

  const getOfficerDocOptions = (officer) => {
    const options = [];
    if (!officer.full_name || !officer.passport_number || !officer.dob) {
      options.push({ val: "PASSPORT_ID", label: "Passport / ID Card" });
    }
    if (!officer.residential_address) {
      options.push({ val: "PERSONAL_UTILITY", label: "Personal Utility Bill" });
    }
    return options.length > 0 ? options : [{ val: "", label: "All Data Extracted!" }];
  };

  // --- HANDLERS ---

  const handleAnalysis = async (file, category, context, officerId = null) => {
    if (!file) return;
    setAnalyzing(true);
    setDebugData(null); 
    setLocalData(null);
    
    try {
      const geminiPromise = api.analyzeDocument(file, category);
      const tesseractPromise = runOCR(file).then(ocrResult => parseRawText(ocrResult.text, category));

      const [geminiResult, tesseractData] = await Promise.all([geminiPromise, tesseractPromise]);
      
      const aiData = geminiResult.analysis || {};
      const fileId = geminiResult.file_id;

      setDebugData(aiData); 
      setLocalData(tesseractData); 

      if (context === 'COMPANY') {
        setCompany(prev => ({
          ...prev,
          file_id: fileId,
          company_name:        getVal(aiData.company_name, tesseractData.company_name) || prev.company_name,
          registration_number: getVal(aiData.registration_number, tesseractData.registration_number) || prev.registration_number,
          incorporation_date:  getVal(aiData.incorporation_date, tesseractData.incorporation_date) || prev.incorporation_date,
          country:             getVal(aiData.country, tesseractData.country) || prev.country,
          registered_address:  getVal(aiData.registered_address, tesseractData.registered_address) || prev.registered_address,
          operational_address: getVal(aiData.operational_address, tesseractData.operational_address) || prev.operational_address
        }));
        setDocType(""); 
      } 
      else if (context === 'OFFICER') {
        setOfficers(prev => prev.map(o => o.id === officerId ? {
          ...o,
          file_id: fileId,
          doc_type: "", 
          full_name:         getVal(aiData.full_name, o.full_name),
          dob:               getVal(aiData.dob, tesseractData.dob) || o.dob,
          passport_number:   getVal(aiData.passport_number, tesseractData.passport_number) || o.passport_number,
          residential_address: getVal(aiData.residential_address, o.residential_address)
        } : o));
      }

    } catch (err) {
      console.error(err);
      alert("Analysis Partial Failure: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // 🔒 VALIDATION: Step 1 (Entity)
  const saveCompanyStep = async () => {
    // Check all required fields
    if (!company.company_name || !company.registration_number || !company.incorporation_date || !company.country || !company.registered_address) {
      alert("⚠️ Incomplete Data\n\nPlease fill in all required fields marked with * (Company Name, Reg Number, Date, Country, Registered Address).");
      return;
    }

    setLoading(true);
    try {
      const res = await api.initMerchant(company);
      if (res.status === 'success') {
        setCompany(prev => ({ ...prev, merchant_id: res.data.merchant_id, folder_url: res.data.folder_url }));
        setStep(2); 
      }
    } catch (err) { alert("Save Failed: " + err.message); } 
    finally { setLoading(false); }
  };

  // 🔒 VALIDATION: Step 2 (Officers)
  const submitAll = async () => {
    // Check every officer for missing fields
    for (let i = 0; i < officers.length; i++) {
      const o = officers[i];
      if (!o.full_name || !o.role || !o.passport_number || !o.dob || !o.residential_address) {
        alert(`⚠️ Incomplete Officer\n\nPlease fill in all details for Officer #${i + 1} (Name, Role, Passport No, DOB, Residential Address).`);
        return;
      }
    }

    setLoading(true);
    try {
      const promises = officers.map(officer => api.saveOfficer({ ...officer, merchant_id: company.merchant_id, merchant_folder_url: company.folder_url }));
      await Promise.all(promises);
      api.logAudit("SUBMIT_APPLICATION", company.merchant_id, `Submitted with ${officers.length} officers`);
      alert("✅ Onboarding Complete!\n\nAll data and files have been secured in the Vault.");
      window.location.href = "/"; 
    } catch (err) { alert("Error: " + err.message); } 
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-6 text-gray-100 pb-20 font-sans">
      
      {/* HEADER */}
      <div className="mb-8 border-b border-gray-800 pb-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <Link to="/">
            <motion.div whileHover={{ scale: 1.05 }} className="relative w-16 h-16 flex items-center justify-center bg-white rounded-2xl shadow-xl border border-gold-500/50">
              <img src="/finconnect-hub-tool/logo.png" alt="Logo" className="w-10 h-10 object-contain z-10" />
            </motion.div>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gold-gradient tracking-tight">Merchant Onboarding</h1>
            <p className="text-gray-500 text-sm mt-1">FinConnect Hub Secure Portal</p>
          </div>
        </div>
        <div className="flex gap-2 text-sm">
          <StepBadge num={1} label="Entity Details" active={step === 1} />
          <StepBadge num={2} label="Officers KYC" active={step === 2} />
        </div>
      </div>

      {/* LOADERS */}
      {analyzing && (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="mb-6 relative">
            <Cpu size={64} className="text-gold-400 relative z-10" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Dual-Engine Extraction...</h2>
          <p className="text-xs text-gray-500">Processing with Gemini AI + Regex</p>
        </div>
      )}
      {loading && !analyzing && <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"><Loader2 className="w-12 h-12 animate-spin text-gold-400" /></div>}

      {/* STEP 1: ENTITY */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-8">
            <div className="bg-obsidian-800 p-8 rounded-2xl border border-gray-700 shadow-xl relative">
               <div className="absolute top-6 right-6">
                  <button onClick={() => setShowDebug(!showDebug)} className="flex items-center gap-2 text-xs text-gold-400 hover:text-white transition-colors border border-gold-500/30 px-3 py-1.5 rounded-full">
                    {showDebug ? <EyeOff size={14}/> : <Eye size={14}/>} {showDebug ? 'Hide Analysis' : 'View AI Analysis'}
                  </button>
               </div>
               <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-white">
                  <div className="p-2 bg-gold-500/10 rounded-lg"><Upload className="text-gold-400" size={20} /></div>
                  Upload Corporate Documents
               </h3>
               
               <div className="mb-6">
                 <label className="block text-sm text-gray-400 mb-2">Select Missing Information Source:</label>
                 <select 
                   value={docType}
                   onChange={(e) => setDocType(e.target.value)}
                   className="w-full bg-obsidian-900 border border-gold-500/30 rounded-lg p-3 text-white focus:outline-none focus:border-gold-400"
                 >
                   <option value="">-- Choose Document --</option>
                   {getEntityDocOptions().map(opt => (
                     <option key={opt.val} value={opt.val}>{opt.label}</option>
                   ))}
                 </select>
               </div>

               {docType && docType !== "" ? (
                 <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-gold-400 hover:bg-gray-800/50 transition-all group">
                    <div className="flex flex-col items-center justify-center pt-2">
                      <Upload className="w-8 h-8 mb-2 text-gray-500 group-hover:text-gold-400 transition-colors" />
                      <p className="text-sm text-gray-300">Click to upload <strong>{docType.replace(/_/g, ' ')}</strong></p>
                    </div>
                    <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleAnalysis(e.target.files[0], docType, 'COMPANY')} />
                 </label>
               ) : (
                 <div className="h-32 border border-dashed border-gray-700 rounded-xl flex items-center justify-center bg-black/20 text-gray-500">
                   {getEntityDocOptions()[0].val === "" ? <span className="text-green-400 flex items-center gap-2"><CheckCircle size={16}/> Data Extracted</span> : "Select doc type to upload"}
                 </div>
               )}
            </div>

            <div className="space-y-5">
              <Input label="Company Legal Name" required value={company.company_name} onChange={e => setCompany({...company, company_name: e.target.value})} />
              <Input label="Registration Number" required value={company.registration_number} onChange={e => setCompany({...company, registration_number: e.target.value})} />
              <Input label="Date of Incorporation" required value={company.incorporation_date} onChange={e => setCompany({...company, incorporation_date: e.target.value})} />
              <Input label="Country of Registration" required value={company.country} onChange={e => setCompany({...company, country: e.target.value})} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Registered Address" required value={company.registered_address} onChange={e => setCompany({...company, registered_address: e.target.value})} />
                <Input label="Operational Address (Optional)" value={company.operational_address} onChange={e => setCompany({...company, operational_address: e.target.value})} />
              </div>
              <div className="pt-4 flex justify-end">
                <button onClick={saveCompanyStep} className="bg-gold-gradient text-black font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-gold-500/20">Proceed to Officers <CheckCircle size={18} /></button>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {showDebug && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="lg:col-span-1">
                <div className="bg-obsidian-800 p-6 rounded-xl border border-gray-700 h-full shadow-lg flex flex-col space-y-4">
                  <div className="bg-black/50 rounded-lg p-3 border border-gray-800">
                    <h4 className="text-xs font-semibold text-blue-400 mb-2 flex items-center gap-2"><Cpu size={12}/> Gemini AI</h4>
                    <div className="font-mono text-xs text-blue-300 overflow-auto max-h-40">{debugData ? <pre>{JSON.stringify(debugData, null, 2)}</pre> : <span className="italic opacity-50">Waiting...</span>}</div>
                  </div>
                  <div className="bg-black/50 rounded-lg p-3 border border-gray-800">
                    <h4 className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-2"><FileText size={12}/> Tesseract</h4>
                    <div className="font-mono text-xs text-green-300 overflow-auto max-h-40">{localData ? <pre>{JSON.stringify(localData, null, 2)}</pre> : <span className="italic opacity-50">Waiting...</span>}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* STEP 2: OFFICERS */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Directors & Shareholders</h2>
              <div className="flex gap-4 items-center">
                 <button onClick={() => setShowDebug(!showDebug)} className="text-xs text-gold-400 border border-gold-500/30 px-3 py-1.5 rounded-full flex items-center gap-2">{showDebug ? <EyeOff size={12}/> : <Eye size={12}/>} Debug</button>
                 <button onClick={() => setOfficers([...officers, { id: Date.now(), full_name: '', role: '', dob: '', passport_number: '', doc_type: '', file_id: '' }])} className="text-sm bg-obsidian-800 hover:bg-gray-700 px-4 py-2 rounded-lg border border-gray-600 flex items-center gap-2"><Plus size={16} /> Add Person</button>
              </div>
            </div>

            {officers.map((officer, index) => (
              <div key={officer.id} className="bg-obsidian-800 p-6 rounded-xl border border-gray-700 relative shadow-xl transition-all">
                <div className="absolute top-4 right-4 text-gray-500 hover:text-red-400 cursor-pointer p-2" onClick={() => setOfficers(officers.filter(o => o.id !== officer.id))}><Trash2 size={18} /></div>
                
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-2 bg-gold-500/10 rounded-lg text-gold-400"><User size={20} /></div>
                   <h3 className="text-lg font-medium text-white">Officer #{index + 1} Profile</h3>
                </div>

                <div className="mb-6">
                   <label className="block text-sm text-gray-400 mb-2">Role in Company <span className="text-red-500">*</span></label>
                   <select 
                      value={officer.role} 
                      onChange={e => setOfficers(officers.map(o => o.id === officer.id ? { ...o, role: e.target.value } : o))} 
                      className={`w-full bg-obsidian-900 border rounded-lg p-3 text-white focus:outline-none focus:border-gold-400 appearance-none cursor-pointer transition-all ${!officer.role ? 'border-gold-500/50 shadow-[0_0_15px_rgba(212,175,55,0.15)] animate-pulse' : 'border-gray-700'}`}
                   >
                      <option value="">-- Select Role (Required to Start) --</option>
                      <option value="UBO (Ultimate Beneficiary Owner)">UBO (Ultimate Beneficiary Owner)</option>
                      <option value="Shareholder">Shareholder</option>
                      <option value="Director">Director</option>
                      <option value="Authorized Representative">Authorized Representative</option>
                   </select>
                </div>

                <AnimatePresence>
                  {officer.role && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-700/50">
                        <div className="col-span-1">
                           <label className="block text-xs font-medium text-gray-400 mb-2">Upload Evidence:</label>
                           <select 
                             value={officer.doc_type}
                             onChange={(e) => setOfficers(officers.map(o => o.id === officer.id ? { ...o, doc_type: e.target.value } : o))}
                             className="w-full bg-black/30 text-xs border border-gray-700 rounded mb-3 p-2 text-gray-300"
                           >
                             <option value="">-- Select Document --</option>
                             {getOfficerDocOptions(officer).map(opt => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
                           </select>

                           {officer.doc_type && officer.doc_type !== "" ? (
                             <label className="flex flex-col items-center justify-center h-32 border border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-black/20 group">
                                <div className="text-center group-hover:scale-105 transition-transform"><Upload className="mx-auto text-gold-400 mb-1" size={20} /><span className="text-xs text-gray-300 font-medium">Click to Upload</span></div>
                                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleAnalysis(e.target.files[0], officer.doc_type, 'OFFICER', officer.id)} />
                             </label>
                           ) : (
                             <div className="h-32 border border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center bg-gray-900/50 text-gray-500 text-xs text-center p-2">
                               {getOfficerDocOptions(officer)[0].val === "" ? <span className="text-green-400 flex items-center gap-1"><CheckCircle size={12}/> Complete</span> : "Select doc to upload"}
                             </div>
                           )}
                        </div>

                        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2"><Input label="Full Name" required value={officer.full_name} onChange={e => setOfficers(officers.map(o => o.id === officer.id ? { ...o, full_name: e.target.value } : o))} /></div>
                          <Input label="Passport/ID Number" required value={officer.passport_number} onChange={e => setOfficers(officers.map(o => o.id === officer.id ? { ...o, passport_number: e.target.value } : o))} />
                          <Input label="Date of Birth" required value={officer.dob} onChange={e => setOfficers(officers.map(o => o.id === officer.id ? { ...o, dob: e.target.value } : o))} />
                          <div className="md:col-span-2"><Input label="Residential Address" required value={officer.residential_address} onChange={e => setOfficers(officers.map(o => o.id === officer.id ? { ...o, residential_address: e.target.value } : o))} /></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            ))}
            <div className="flex justify-end pt-6 border-t border-gray-800">
              <button onClick={submitAll} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg shadow-green-500/20 hover:scale-105 transition-all"><Save size={20} /> Complete Onboarding</button>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: DEBUG PANEL */}
          <AnimatePresence>
            {showDebug && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="lg:col-span-1">
                <div className="bg-obsidian-800 p-6 rounded-xl border border-gray-700 h-full shadow-lg flex flex-col space-y-4">
                  <div className="bg-black/50 rounded-lg p-3 border border-gray-800">
                    <h4 className="text-xs font-semibold text-blue-400 mb-2 flex items-center gap-2"><Cpu size={12}/> Gemini AI</h4>
                    <div className="font-mono text-xs text-blue-300 overflow-auto max-h-40">{debugData ? <pre>{JSON.stringify(debugData, null, 2)}</pre> : <span className="italic opacity-50">Waiting...</span>}</div>
                  </div>
                  <div className="bg-black/50 rounded-lg p-3 border border-gray-800">
                    <h4 className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-2"><FileText size={12}/> Tesseract</h4>
                    <div className="font-mono text-xs text-green-300 overflow-auto max-h-40">{localData ? <pre>{JSON.stringify(localData, null, 2)}</pre> : <span className="italic opacity-50">Waiting...</span>}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
};

const Input = ({ label, value, onChange, required }) => (
  <div className="w-full">
    <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input 
      type="text" 
      value={value || ''} 
      onChange={onChange} 
      className="w-full bg-obsidian-900 border border-gray-700 rounded-lg p-3 text-white focus:border-gold-400 focus:ring-1 focus:ring-gold-400 focus:outline-none transition-all" 
    />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div className="w-full">
    <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">{label}</label>
    <select 
      value={value} 
      onChange={onChange} 
      className="w-full bg-obsidian-900 border border-gray-700 rounded-lg p-3 text-white focus:border-gold-400 focus:ring-1 focus:ring-gold-400 focus:outline-none transition-all appearance-none cursor-pointer"
    >
      {options.map((opt, i) => (
        <option key={i} value={opt} className="bg-obsidian-900">{opt === "" ? "Select Role..." : opt}</option>
      ))}
    </select>
  </div>
);

const StepBadge = ({ num, label, active }) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${active ? 'bg-gold-500/20 border border-gold-500/30' : 'bg-transparent opacity-50'}`}>
    <span className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${active ? 'bg-gold-400 text-black' : 'bg-gray-700 text-gray-400'}`}>{num}</span>
    <span className={`text-xs font-medium ${active ? 'text-gold-100' : 'text-gray-500'}`}>{label}</span>
  </div>
);

export default MerchantIntake;
