import React, { useState, useEffect } from 'react';
import { Upload, Plus, Trash2, CheckCircle, Loader2, Save, Shield, ArrowLeft, Cpu, Eye, EyeOff, FileJson, Lock, FileText, User, X, AlertCircle, FileCheck, ChevronRight } from 'lucide-react';
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
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [docType, setDocType] = useState("");

  const [company, setCompany] = useState({
    company_name: '', registration_number: '', incorporation_date: '',
    country: '', registered_address: '', operational_address: '',
    file_id: '', folder_url: '', folder_id: '', uploaded_files: []
  });

  const [officers, setOfficers] = useState([
    { id: 1, full_name: '', role: '', dob: '', passport_number: '', residential_address: '', doc_type: '', file_id: '', uploaded_files: [] }
  ]);

  const [availableForms, setAvailableForms] = useState([]);
  const [answers, setAnswers] = useState({});

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const getVal = (primary, secondary) => {
    if (primary) {
        if (typeof primary === 'object' && primary.val) return primary.val;
        if (typeof primary === 'string') return primary;
    }
    if (secondary) return secondary;
    return "";
  };

  useEffect(() => {
    if (step === 3) loadQuestionnaires();
  }, [step]);

  const loadQuestionnaires = async () => {
    setLoading(true);
    try {
        const forms = await api.getQuestionnaires();
        setAvailableForms(forms);
    } catch (e) {
        showToast("Failed to load questionnaires", "error");
    } finally {
        setLoading(false);
    }
  };

  const handleAnswerChange = (questionnaireId, questionId, value) => {
    setAnswers(prev => ({
        ...prev,
        [questionnaireId]: {
            ...(prev[questionnaireId] || {}),
            [questionId]: value
        }
    }));
  };

  const handleAnalysis = async (file, category, context, officerId = null) => {
    if (!file) return;
    setAnalyzing(true);
    setDebugData(null);
    setLocalData(null);

    try {
        const geminiPromise = api.analyzeDocument 
            ? api.analyzeDocument(file, category).catch(e => ({ analysis: {}, error: e.message }))
            : Promise.resolve({ analysis: {} });

        const tesseractPromise = runOCR(file, category)
            .then(ocrResult => ({ ...ocrResult, extracted: parseRawText(ocrResult.raw_text, category) }))
            .catch(e => ({ data: {}, error: e.message }));

        const [geminiResult, tesseractResult] = await Promise.all([geminiPromise, tesseractPromise]);
        
        const aiData = geminiResult.analysis || {};
        const tessData = tesseractResult.extracted || {};
        const fileId = geminiResult.file_id || 'TEMP_ID';
        const newFileObj = { id: fileId, type: category };

        setDebugData(aiData);
        setLocalData(tessData);
        if(!showDebug) setShowDebug(true);

        if (context === 'COMPANY') {
            setCompany(prev => ({
                ...prev,
                file_id: fileId,
                uploaded_files: [...(prev.uploaded_files || []), newFileObj],
                company_name: getVal(aiData.company_name, tessData.company_name) || prev.company_name,
                registration_number: getVal(aiData.registration_number, tessData.registration_number) || prev.registration_number,
                incorporation_date: getVal(aiData.incorporation_date, tessData.incorporation_date) || prev.incorporation_date,
                country: getVal(aiData.country, tessData.country) || prev.country,
                registered_address: getVal(aiData.registered_address, tessData.registered_address) || prev.registered_address,
                operational_address: getVal(aiData.operational_address, tessData.operational_address) || prev.operational_address
            }));
            setDocType(""); 
            showToast("Dual-Engine Extraction Successful!", "success");
        } 
        else if (context === 'OFFICER') {
            setOfficers(prev => prev.map(o => o.id === officerId ? {
                ...o,
                file_id: fileId,
                uploaded_files: [...(o.uploaded_files || []), newFileObj],
                doc_type: "", // Reset after upload
                full_name: getVal(aiData.full_name, o.full_name),
                dob: getVal(aiData.dob, tessData.dob) || o.dob,
                passport_number: getVal(aiData.passport_number, tessData.passport_number) || o.passport_number,
                residential_address: getVal(aiData.residential_address, o.residential_address) || o.residential_address
            } : o));
            showToast("Officer ID Verified!", "success");
        }

    } catch (err) {
        console.error(err);
        showToast("Analysis Failed: " + err.message, "error");
    } finally {
        setAnalyzing(false);
    }
  };

  const getEntityDocOptions = () => {
    const options = [];
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

  const saveCompanyStep = async () => {
    const missing = [];
    if (!company.company_name) missing.push("Company Name");
    if (!company.registration_number) missing.push("Registration Number");
    if (missing.length > 0) { showToast(`Missing: ${missing.join(', ')}`, "error"); return; }

    setLoading(true);
    try {
        let filesPayload = company.uploaded_files;
        if ((!filesPayload || filesPayload.length === 0) && company.file_id) filesPayload = [{ id: company.file_id, type: 'LEGACY' }];
        
        const res = await api.initMerchant({ ...company, file_ids: filesPayload });
        if (res && (res.status === 'success' || res.merchant_id)) {
            setCompany(prev => ({ 
                ...prev, 
                merchant_id: res.data?.merchant_id || res.merchant_id, 
                folder_url: res.data?.folder_url || res.folder_url, 
                folder_id: res.data?.folder_id || res.folder_id 
            }));
            setStep(2); 
            showToast("Entity Details Saved", "success");
        }
    } catch (err) { showToast("Save Failed: " + err.message, "error"); } finally { setLoading(false); }
  };

  const saveOfficersStep = async () => {
    setLoading(true);
    try {
        const promises = officers.map(officer => {
            let filesPayload = officer.uploaded_files;
            if ((!filesPayload || filesPayload.length === 0) && officer.file_id) filesPayload = [{ id: officer.file_id, type: 'LEGACY_OFFICER' }];
            return api.saveOfficer({ ...officer, merchant_id: company.merchant_id, folder_id: company.folder_id, file_ids: filesPayload });
        });
        await Promise.all(promises);
        setStep(3); 
        showToast("Officers Saved. Loading Questionnaires...", "success");
    } catch (err) { showToast("Error: " + err.message, "error"); } finally { setLoading(false); }
  };

  const submitFinalApplication = async () => {
    setLoading(true);
    try {
        const promises = availableForms.map(form => {
            const formAnswers = answers[form.id];
            if (formAnswers) {
                return api.saveAnswers({
                    merchant_id: company.merchant_id,
                    questionnaire_id: form.id,
                    answers: formAnswers
                });
            }
            return Promise.resolve();
        });

        await Promise.all(promises);
        if(api.logAudit) await api.logAudit("SUBMIT_APPLICATION", company.merchant_id, `Application Finalized`);
        showToast("Application Submitted Successfully!", "success");
        setTimeout(() => window.location.href = "/", 3000);
    } catch (e) {
        showToast("Submission Error: " + e.message, "error");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-6 text-gray-100 pb-20 font-sans relative">
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${toast.type === 'error' ? 'bg-red-900/90 border-red-500 text-red-100' : 'bg-green-900/90 border-green-500 text-green-100'} backdrop-blur-md`}>
            {toast.type === 'error' ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
            <span className="font-medium text-sm">{toast.message}</span>
            <button onClick={() => setToast({ ...toast, show: false })} className="hover:opacity-75"><X size={18} /></button>
          </motion.div>
        )}
      </AnimatePresence>

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
            <StepBadge num={3} label="Compliance" active={step === 3} />
        </div>
      </div>

      {analyzing && (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="mb-6 relative">
                <Cpu size={64} className="text-gold-400 relative z-10" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">AI Extraction...</h2>
            <p className="text-xs text-gray-500">Processing with Gemini AI + Tesseract Regex</p>
        </div>
      )}

      {loading && !analyzing && <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"><Loader2 className="w-12 h-12 animate-spin text-gold-400" /></div>}

      {/* STEP 1: ENTITY */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-8">
                <div className="bg-obsidian-800 p-6 md:p-8 rounded-2xl border border-gray-700 shadow-xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <h3 className="text-xl font-semibold flex items-center gap-3 text-white">
                            <div className="p-2 bg-gold-500/10 rounded-lg"><Upload className="text-gold-400" size={20} /></div>
                            Upload Corporate Documents
                        </h3>
                        <button onClick={() => setShowDebug(!showDebug)} className="flex items-center gap-2 text-xs text-gold-400 hover:text-white transition-colors border border-gold-500/30 px-3 py-1.5 rounded-full">
                            {showDebug ? <EyeOff size={14}/> : <Eye size={14}/>} {showDebug ? 'Hide Analysis' : 'View AI Analysis'}
                        </button>
                    </div>
                    <div className="mb-6">
                        <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full bg-obsidian-900 border border-gold-500/30 rounded-lg p-3 text-white focus:outline-none focus:border-gold-400">
                            <option value="">-- Choose Document --</option>
                            {getEntityDocOptions().map(opt => ( <option key={opt.val} value={opt.val}>{opt.label}</option> ))}
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
                            <span className="text-gray-500">Select doc type to upload</span>
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
                        <button onClick={saveCompanyStep} className="bg-gold-gradient text-black font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-gold-500/20">Proceed to Officers <ChevronRight size={18} /></button>
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

      {/* STEP 2: OFFICERS (FIXED: Added Uploads Back) */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Directors & Shareholders</h2>
                    <div className="flex gap-4 items-center">
                         <button onClick={() => setShowDebug(!showDebug)} className="text-xs text-gold-400 border border-gold-500/30 px-3 py-1.5 rounded-full flex items-center gap-2">{showDebug ? <EyeOff size={12}/> : <Eye size={12}/>} Debug</button>
                         <button onClick={() => setOfficers([...officers, { id: Date.now(), full_name: '', role: '', dob: '', passport_number: '', doc_type: '', uploaded_files: [] }])} className="text-sm bg-obsidian-800 hover:bg-gray-700 px-4 py-2 rounded-lg border border-gray-600 flex items-center gap-2"><Plus size={16} /> Add Person</button>
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
                            <select value={officer.role} onChange={e => setOfficers(officers.map(o => o.id === officer.id ? { ...o, role: e.target.value } : o))} className="w-full bg-obsidian-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-gold-400">
                                <option value="">-- Select Role --</option>
                                <option value="UBO">UBO (Ultimate Beneficiary Owner)</option>
                                <option value="Director">Director</option>
                            </select>
                        </div>

                        {/* ✅ RESTORED OFFICER UPLOAD & AI */}
                        <AnimatePresence>
                            {officer.role && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-700/50">
                                        <div className="col-span-1">
                                            <label className="block text-xs font-medium text-gray-400 mb-2">Upload Evidence:</label>
                                            <select value={officer.doc_type} onChange={(e) => setOfficers(officers.map(o => o.id === officer.id ? { ...o, doc_type: e.target.value } : o))} className="w-full bg-obsidian-900 text-xs border border-gray-700 rounded mb-3 p-2 text-white focus:border-gold-400 outline-none">
                                                <option value="" className="bg-obsidian-900">-- Select Document --</option>
                                                {getOfficerDocOptions(officer).map(opt => ( <option key={opt.val} value={opt.val} className="bg-obsidian-900">{opt.label}</option> ))}
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
                    <button onClick={saveOfficersStep} className="bg-gold-gradient text-black font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg shadow-gold-500/20 hover:scale-105 transition-all">Next: Compliance <ChevronRight size={18} /></button>
                </div>
            </motion.div>
            
            {/* DEBUG PANEL FOR STEP 2 */}
            <AnimatePresence>
                {showDebug && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="lg:col-span-1">
                        <div className="bg-obsidian-800 p-6 rounded-xl border border-gray-700 h-full shadow-lg flex flex-col space-y-4">
                            <div className="bg-black/50 rounded-lg p-3 border border-gray-800">
                                <h4 className="text-xs font-semibold text-blue-400 mb-2 flex items-center gap-2"><Cpu size={12}/> Gemini AI</h4>
                                <div className="font-mono text-xs text-blue-300 overflow-auto max-h-40">{debugData ? <pre>{JSON.stringify(debugData, null, 2)}</pre> : <span className="italic opacity-50">Waiting...</span>}</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      )}

      {/* STEP 3: COMPLIANCE QUESTIONNAIRES */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="bg-obsidian-800 p-8 rounded-2xl border border-gray-700 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gold-500/10 rounded-lg text-gold-400"><FileCheck size={24} /></div>
                    <h2 className="text-2xl font-bold text-white">Compliance Questionnaires</h2>
                </div>
                <p className="text-gray-400 mb-8">Please complete the required questionnaires based on your service type.</p>

                {availableForms.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
                        <p className="text-gray-500">No questionnaires assigned.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {availableForms.map((form) => (
                            <div key={form.id} className="border border-gray-700 rounded-xl p-6 bg-black/20">
                                <h3 className="text-lg font-bold text-gold-400 mb-4">{form.psp_type} Declaration</h3>
                                <div className="space-y-5">
                                    {form.schema.map((q) => (
                                        <div key={q.id}>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">{q.label}</label>
                                            
                                            {/* ✅ FIXED TEXT INPUT RENDERING */}
                                            {q.type === 'text' && (
                                                <input 
                                                    type="text" 
                                                    className="w-full bg-obsidian-900 border border-gray-700 rounded-lg p-3 text-white focus:border-gold-400 focus:outline-none"
                                                    onChange={(e) => handleAnswerChange(form.id, q.id, e.target.value)}
                                                />
                                            )}
                                            
                                            {q.type === 'mcq' && (
                                                <select 
                                                    className="w-full bg-obsidian-900 border border-gray-700 rounded-lg p-3 text-white focus:border-gold-400 focus:outline-none"
                                                    onChange={(e) => handleAnswerChange(form.id, q.id, e.target.value)}
                                                >
                                                    <option value="">Select Option</option>
                                                    {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-end pt-8 mt-8 border-t border-gray-700">
                    <button onClick={submitFinalApplication} className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-10 rounded-xl flex items-center gap-2 shadow-lg shadow-green-500/20 hover:scale-105 transition-all">
                        <Save size={20} /> Submit Final Application
                    </button>
                </div>
            </div>
        </motion.div>
      )}

    </div>
  );
};

const Input = ({ label, value, onChange, required }) => (
    <div className="w-full">
        <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">{label} {required && <span className="text-red-500">*</span>}</label>
        <input type="text" value={value || ''} onChange={onChange} className="w-full bg-obsidian-900 border border-gray-700 rounded-lg p-3 text-white focus:border-gold-400 focus:ring-1 focus:ring-gold-400 focus:outline-none transition-all"/>
    </div>
);

const StepBadge = ({ num, label, active }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${active ? 'bg-gold-500/20 border border-gold-500/30' : 'bg-transparent opacity-50'}`}>
        <span className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${active ? 'bg-gold-400 text-black' : 'bg-gray-700 text-gray-400'}`}>{num}</span>
        <span className={`text-xs font-medium ${active ? 'text-gold-100' : 'text-gray-500'}`}>{label}</span>
    </div>
);

export default MerchantIntake;
