import React, { useState } from 'react';
import { Upload, Plus, Trash2, CheckCircle, Loader2, Save, Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { runOCR } from '../utils/ocr';

const MerchantIntake = () => {
  // --- STATE MANAGEMENT ---
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [showDebug, setShowDebug] = useState(false); // Toggle to see raw text
  const [rawText, setRawText] = useState(''); // Store the raw text for debugging
  
  // Data State: Company
  const [company, setCompany] = useState({
    company_name: '',
    registration_number: '',
    incorporation_date: '',
    country: '',
    registered_address: '',
    folder_url: '' 
  });

  // Data State: Officers
  const [officers, setOfficers] = useState([
    { id: 1, full_name: '', role: 'Director', dob: '', passport_number: '', residential_address: '' }
  ]);

  // --- INTELLIGENT PARSERS (The "Brain") ---

  const parseCompanyText = (text) => {
    // 1. Clean up text
    const cleanLines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let extracted = { ...company }; // Start with current state

    // STRATEGY A: Find Company Name via "LIMITED" / "LTD"
    // Most corp names are uppercase and end with entity type
    const nameLine = cleanLines.find(line => 
      (line.toUpperCase().includes("LIMITED") || line.toUpperCase().includes("LTD")) && 
      !line.toUpperCase().includes("PRIVATE") // Exclude "Private Limited" descriptor lines
    );
    if (nameLine) extracted.company_name = nameLine.replace(/[^a-zA-Z0-9\s\.\-]/g, '').trim();

    // STRATEGY B: Find Reg Number (Look for 6-10 digits in a row)
    // Common in HK/UK docs
    const regMatch = text.match(/\b(?<!\d)(\d{6,10})(?!\d)\b/);
    if (regMatch) extracted.registration_number = regMatch[0];

    // STRATEGY C: Dates (DD/MM/YYYY or DD-MMM-YYYY)
    const dateMatch = text.match(/(\d{1,2}[\/\-\s](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{1,2})[\/\-\s]\d{4})/i);
    if (dateMatch) extracted.incorporation_date = dateMatch[0];

    // STRATEGY D: Country Guessing
    if (text.match(/Hong Kong|HK/i)) extracted.country = "Hong Kong";
    else if (text.match(/United Kingdom|England|Wales/i)) extracted.country = "United Kingdom";

    return extracted;
  };

  const parseOfficerText = (text, currentOfficer) => {
    let extracted = { ...currentOfficer };

    // STRATEGY A: MRZ Parsing (Passport Machine Readable Zone)
    // Look for lines starting with P< or I<
    const mrzLine = text.match(/P<([A-Z]{3})([A-Z0-9<]+)/);
    if (mrzLine) {
      // MRZ format is very reliable
      extracted.passport_number = text.match(/[A-Z0-9]{9}/) ? text.match(/[A-Z0-9]{9}/)[0] : extracted.passport_number;
      
      // Try to find DOB in MRZ (usually 2nd line, starts with Passport No + Check digit + DOB)
      // This is complex regex, falling back to simple date finder for V1 safety
    }

    // STRATEGY B: Date of Birth Labels
    // Look for "Date of Birth", "DOB", "Birth"
    const dobMatch = text.match(/(?:Date of Birth|DOB|Birth)[:\s\.]+(\d{1,2}[\/\-\s]\w+[\/\-\s]\d{4}|\d{6})/i);
    if (dobMatch) extracted.dob = dobMatch[1];
    else {
        // Fallback: Just find a date that isn't today (Expiry dates usually future, DOB past)
        const anyDate = text.match(/(\d{2}[/-]\d{2}[/-]\d{4})/);
        if (anyDate) extracted.dob = anyDate[0];
    }

    // STRATEGY C: Passport Number (Generic 9 char alphanumeric)
    if (!extracted.passport_number) {
        const passMatch = text.match(/\b([A-Z][0-9]{8})\b/);
        if (passMatch) extracted.passport_number = passMatch[0];
    }

    return extracted;
  };

  // --- HANDLERS ---
  
  const handleCompanyOCR = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      alert("⚠️ System Limitation (V1)\n\nPlease upload a JPG or PNG image.\nPDF processing requires paid APIs.");
      return;
    }

    setLoading(true);
    setRawText(''); // Clear previous debug text
    try {
      const { text } = await runOCR(file, setOcrProgress);
      setRawText(text); // Show raw text to user for trust
      
      const smartData = parseCompanyText(text);
      setCompany(prev => ({ ...prev, ...smartData }));
      
    } catch (err) {
      alert("OCR Failed: " + err.message);
    } finally {
      setLoading(false);
      setOcrProgress(0);
    }
  };

  const handleOfficerOCR = async (id, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      alert("Please upload an Image (JPG/PNG).");
      return;
    }
    
    setLoading(true);
    setRawText('');
    try {
      const { text } = await runOCR(file);
      setRawText(text);

      const currentOfficer = officers.find(o => o.id === id);
      const smartData = parseOfficerText(text, currentOfficer);

      setOfficers(officers.map(o => o.id === id ? smartData : o));
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveCompanyStep = async () => {
    if (!company.company_name) return alert("Company Name is required");
    setLoading(true);
    try {
      const res = await api.initMerchant(company);
      if (res.status === 'success') {
        setCompany(prev => ({ ...prev, merchant_id: res.data.merchant_id }));
        setStep(2); 
      }
    } catch (err) {
      alert("Save Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const submitAll = async () => {
    setLoading(true);
    try {
      const promises = officers.map(officer => 
        api.saveOfficer({ ...officer, merchant_id: company.merchant_id })
      );
      await Promise.all(promises);
      api.logAudit("SUBMIT_APPLICATION", company.merchant_id, `Submitted with ${officers.length} officers`);
      alert("Application Submitted Successfully!");
      window.location.href = "/"; 
    } catch (err) {
      alert("Error saving officers: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- UI COMPONENTS ---

  return (
    <div className="max-w-5xl mx-auto p-6 text-gray-100 pb-20">
      
      {/* Header */}
      <div className="mb-8 border-b border-gray-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gold-gradient">
            New Client Intake
          </h1>
          <div className="flex gap-4 mt-4 text-sm">
            <span className={`px-3 py-1 rounded ${step === 1 ? 'bg-gold-gradient text-black font-semibold' : 'bg-gray-800'}`}>1. Entity Details</span>
            <span className={`px-3 py-1 rounded ${step === 2 ? 'bg-gold-gradient text-black font-semibold' : 'bg-gray-800'}`}>2. Officers (KYC)</span>
          </div>
        </div>
        <Link to="/" className="text-gray-500 hover:text-white flex items-center gap-1">
          <ArrowLeft size={16} /> Back
        </Link>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-gold-400 mx-auto mb-2" />
            <p className="text-gold-400">Analyzing Document... {ocrProgress > 0 && `${ocrProgress}%`}</p>
          </div>
        </div>
      )}

      {/* STEP 1: COMPANY INFO */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
          
          {/* LEFT: FORM */}
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-obsidian-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gold-400">
                <Upload size={20} /> Upload Certificate of Incorporation
              </h3>
              <input 
                type="file" 
                onChange={handleCompanyOCR}
                accept="image/png, image/jpeg, image/jpg" 
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold-gradient file:text-black hover:file:brightness-110 cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-2">*Upload JPG/PNG only</p>
            </div>

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
                className="bg-gold-gradient text-black font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-all hover:brightness-110 hover:scale-105 shadow-lg"
              >
                Next: Add Officers <CheckCircle size={18} />
              </button>
            </div>
          </div>

          {/* RIGHT: DEBUG PANEL */}
          <div className="lg:col-span-1">
             <div className="bg-obsidian-800 p-4 rounded-xl border border-gray-700 h-full">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-semibold text-gray-400">Extracted Data Analysis</h4>
                  <button onClick={() => setShowDebug(!showDebug)} className="text-xs text-gold-400 flex items-center gap-1">
                    {showDebug ? <EyeOff size={12}/> : <Eye size={12}/>} {showDebug ? 'Hide Raw' : 'Show Raw'}
                  </button>
                </div>
                
                {showDebug ? (
                  <textarea 
                    readOnly 
                    value={rawText} 
                    className="w-full h-96 bg-black/50 text-green-500 font-mono text-xs p-2 rounded border border-gray-700 resize-none"
                  />
                ) : (
                  <div className="text-xs text-gray-500 space-y-2">
                    <p>System is looking for:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>"LIMITED" / "LTD" for Name</li>
                      <li>6-10 Digit Numbers for Reg No</li>
                      <li>Date formats (DD/MM/YYYY)</li>
                    </ul>
                    <div className="mt-4 p-3 bg-blue-500/10 text-blue-400 rounded">
                      💡 <strong>Tip:</strong> Ensure image is clear and text is horizontal.
                    </div>
                  </div>
                )}
             </div>
          </div>

        </div>
      )}

      {/* STEP 2: OFFICERS */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Directors & Shareholders</h2>
            <button onClick={addOfficer} className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded flex items-center gap-2 border border-gray-600">
              <Plus size={16} /> Add Person
            </button>
          </div>

          {officers.map((officer, index) => (
            <div key={officer.id} className="bg-obsidian-800 p-6 rounded-xl border border-gray-700 relative shadow-xl">
               <div className="absolute top-4 right-4 text-gray-500 hover:text-red-400 cursor-pointer transition-colors" onClick={() => removeOfficer(officer.id)}>
                <Trash2 size={18} />
              </div>
              <h3 className="text-gold-400 font-medium mb-4 flex items-center gap-2">
                <Shield size={16} /> Officer #{index + 1}
              </h3>
              <div className="mb-4 p-4 bg-black/20 rounded border border-dashed border-gray-700">
                <p className="text-xs text-gray-500 mb-2">Upload ID/Passport to Auto-fill</p>
                <input 
                  type="file" 
                  onChange={(e) => handleOfficerOCR(officer.id, e)} 
                  accept="image/png, image/jpeg, image/jpg"
                  className="text-xs text-gray-400" 
                />
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
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-green-500/20 transition-all transform hover:scale-105"
            >
              <Save size={20} /> Submit Application
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

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
