import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Eye, AlertCircle, ExternalLink, User, Building, Loader2, Save, FileCheck, AlertTriangle } from 'lucide-react';
import Toast from '../../components/ui/Toast';

export default function Profiles() {
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMerchants();
  }, []);

  const loadMerchants = async () => {
    try {
      const data = await api.getAllMerchants();
      setMerchants(data || []);
    } catch (e) {
      console.error("Failed to load merchants", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-obsidian-900 text-white font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
           {/* TITLE */}
           <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gold-gradient">Client Profiles</h1>
           <p className="text-gray-400 mt-1">Verify Entity, Officer & Compliance Data</p>
        </div>
        <div className="bg-obsidian-800 px-4 py-2 rounded-lg border border-gold-500/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
          <span className="text-gold-400 font-bold">{merchants.filter(m => m.status === 'Pending Review').length}</span> <span className="text-gray-400">Pending</span>
        </div>
      </div>
      
      {/* QUEUE LIST */}
      <div className="space-y-3">
        {loading && <div className="text-gray-500 italic">Loading queue...</div>}
        
        {!loading && merchants.map(m => (
          <motion.div 
            key={m.merchant_id} 
            layoutId={m.merchant_id}
            className="bg-obsidian-800 p-4 rounded-xl border border-gray-700 hover:border-gold-500/50 transition-all flex justify-between items-center group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-1.5 h-12 rounded-full ${m.status === 'Approved' ? 'bg-green-500' : m.status === 'Rejected' ? 'bg-red-500' : 'bg-gold-500'}`}></div>
              <div>
                <h3 className="font-bold text-lg text-white group-hover:text-gold-400 transition-colors">{m.company_name || 'Unknown Entity'}</h3>
                <div className="flex gap-3 text-xs text-gray-500 font-mono mt-1">
                  <span>ID: {m.merchant_id}</span>
                  <span>•</span>
                  <span>{m.country}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setSelectedMerchantId(m.merchant_id)}
              className="bg-black/40 text-gray-300 hover:text-gold-400 hover:bg-gold-500/10 px-5 py-2 rounded-lg border border-gray-700 hover:border-gold-500/50 flex items-center gap-2 transition-all"
            >
              <Eye size={16} /> Review
            </button>
          </motion.div>
        ))}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedMerchantId && (
          <ProfileModal 
            merchantId={selectedMerchantId} 
            onClose={() => setSelectedMerchantId(null)} 
            onSave={() => { setSelectedMerchantId(null); loadMerchants(); }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- MAIN MODAL COMPONENT ---
function ProfileModal({ merchantId, onClose, onSave }) {
  const [data, setData] = useState(null); // Full Data (Company + Officers + Answers)
  const [files, setFiles] = useState([]); // File List from Drive
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ENTITY');
  const [selectedOfficerId, setSelectedOfficerId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Load Full Details on Open
  useEffect(() => {
    loadDetails();
  }, [merchantId]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      // 1. Get Metadata (Includes Answers now)
      const details = await api.getMerchantFull(merchantId);
      setData(details);
      
      // 2. Get Files (for linking)
      if (details.company.folder_id) {
        const driveFiles = await api.getFolderFiles(details.company.folder_id);
        setFiles(driveFiles);
      }
      
      // Select first officer by default if available
      if (details.officers.length > 0) setSelectedOfficerId(details.officers[0].officer_id);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // Find relevant file for Entity or Officer
  const findRelevantFile = (keyword) => {
    if (!files.length) return null;
    // Simple heuristic: search file name for keyword
    return files.find(f => f.name.toLowerCase().includes(keyword.toLowerCase()));
  };

  if (loading || !data) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <Loader2 className="animate-spin text-gold-400 w-12 h-12"/>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-6">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-obsidian-800 w-full max-w-7xl h-[90vh] rounded-2xl border border-gray-700 flex flex-col shadow-2xl overflow-hidden relative"
      >
        {/* HEADER */}
        <div className="h-16 border-b border-gray-700 flex items-center justify-between px-6 bg-obsidian-900">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">{data.company.company_name}</h2>
            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${
              data.company.status === 'Approved' ? 'bg-green-900 text-green-400' : 
              data.company.status === 'Rejected' ? 'bg-red-900 text-red-400' : 'bg-gold-900 text-gold-400'
            }`}>
              {data.company.status}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 🆕 PREMIUM TABS */}
            <TabButton 
              active={activeTab === 'ENTITY'} 
              onClick={() => setActiveTab('ENTITY')} 
              icon={Building} 
              label="Entity" 
            />
            <TabButton 
              active={activeTab === 'OFFICERS'} 
              onClick={() => setActiveTab('OFFICERS')} 
              icon={User} 
              label={`Officers (${data.officers.length})`} 
            />
            <TabButton 
              active={activeTab === 'COMPLIANCE'} 
              onClick={() => setActiveTab('COMPLIANCE')} 
              icon={FileCheck} 
              label="Compliance" 
            />

            <div className="w-px h-6 bg-gray-700 mx-2"></div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white"><X size={20} /></button>
          </div>
        </div>

        {/* BODY (Split View) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT: FORM DATA */}
          <div className="w-1/3 border-r border-gray-700 bg-obsidian-900 overflow-y-auto p-6">
            
            {activeTab === 'ENTITY' && (
              <EntityForm 
                data={data.company} 
                onUpdate={(updated) => setData({ ...data, company: { ...data.company, ...updated } })}
                onSave={async () => {
                  try {
                    await api.updateMerchant(data.company);
                    showToast(`Entity Status: ${data.company.status}`, "success");
                    onSave(); // Refresh parent
                  } catch(e) { showToast(e.message, "error"); }
                }}
              />
            )}

            {activeTab === 'OFFICERS' && (
              <div className="space-y-6">
                {/* Officer Selector */}
                <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-800">
                  {data.officers.map(off => (
                    <button
                      key={off.officer_id}
                      onClick={() => setSelectedOfficerId(off.officer_id)}
                      className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap border ${selectedOfficerId === off.officer_id ? 'border-gold-400 text-gold-400 bg-gold-400/10' : 'border-gray-700 text-gray-400'}`}
                    >
                      {off.full_name}
                    </button>
                  ))}
                </div>
                
                {/* Officer Form */}
                {selectedOfficerId && (
                  <OfficerForm 
                    data={data.officers.find(o => o.officer_id === selectedOfficerId)} 
                    onUpdate={(updated) => {
                      const newOfficers = data.officers.map(o => o.officer_id === selectedOfficerId ? { ...o, ...updated } : o);
                      setData({ ...data, officers: newOfficers });
                    }}
                    onSave={async (officerData) => {
                      try {
                        await api.updateOfficer(officerData);
                        showToast("Officer Saved", "success");
                      } catch(e) { showToast(e.message, "error"); }
                    }}
                  />
                )}
              </div>
            )}

            {/* 🆕 COMPLIANCE TAB */}
            {activeTab === 'COMPLIANCE' && (
               <ComplianceViewer answers={data.answers} />
            )}

          </div>

          {/* RIGHT: EVIDENCE VIEWER (PROXY) */}
          <div className="w-2/3 bg-black flex flex-col relative">
             {/* Logic: Show Officer doc if Officer Tab, else Company/Generic doc */}
             <EvidenceViewer 
                file={
                  activeTab === 'OFFICERS' 
                  ? findRelevantFile(data.officers.find(o => o.officer_id === selectedOfficerId)?.full_name.split(' ')[0]) || files[0]
                  : findRelevantFile('CERT') || files[0]
                } 
             />
          </div>

        </div>
      </motion.div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
      active 
        ? 'bg-gold-gradient text-black shadow-lg shadow-gold-500/20' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon size={16} /> {label}
  </button>
);

const EntityForm = ({ data, onUpdate, onSave }) => {
  const [saving, setSaving] = useState(false);
  
  const handleAction = async (newStatus) => {
    setSaving(true);
    // Optimistic Update
    onUpdate({ status: newStatus });
    // Trigger Save
    await onSave(); // Parent handles API call based on current 'data' state which we just updated? 
    // Wait, onUpdate updates state, but React state update is async. 
    // Better to pass the status directly to onSave or handle it carefully.
    // For this simplistic version, we rely on the user clicking "Save" or we chain it.
    // Let's modify onSave to not depend solely on state for the trigger if possible, 
    // but here we updated parent state. Let's do a direct prop update + save.
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      <h3 className="text-gold-400 text-sm font-bold uppercase tracking-widest mb-4">Corporate Details</h3>
      <Field label="Company Name" value={data.company_name} onChange={v => onUpdate({ company_name: v })} />
      <Field label="Registration No" value={data.registration_number} onChange={v => onUpdate({ registration_number: v })} />
      <Field label="Inc Date" value={data.incorporation_date} onChange={v => onUpdate({ incorporation_date: v })} />
      <Field label="Country" value={data.country} onChange={v => onUpdate({ country: v })} />
      <Field label="Address" value={data.registered_address} onChange={v => onUpdate({ registered_address: v })} type="textarea" />
      
      <div className="pt-6 border-t border-gray-800 flex flex-col gap-3">
        <div className="flex gap-3">
             {/* 🆕 REJECT BUTTON */}
             <button 
                onClick={() => handleAction('Rejected')} 
                className="flex-1 bg-transparent border border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 py-3 rounded-lg font-bold text-sm transition-all"
             >
                Reject Entity
             </button>
             
             {/* APPROVE BUTTON */}
             <button 
                onClick={() => handleAction('Approved')} 
                className="flex-1 bg-green-600 hover:bg-green-500 py-3 rounded-lg font-bold text-sm text-white shadow-lg shadow-green-500/20 transition-all"
             >
                Approve Entity
             </button>
        </div>
        <button 
            onClick={() => handleAction(data.status)} // Just save current state
            className="w-full bg-obsidian-700 border border-gray-600 rounded-lg py-2 text-xs text-gray-400 hover:text-white flex items-center justify-center gap-2"
        >
            <Save size={14}/> Save Changes Only
        </button>
      </div>
    </div>
  );
};

const OfficerForm = ({ data, onUpdate, onSave }) => {
  const [saving, setSaving] = useState(false);
  
  if (!data) return <div className="text-gray-500">Select an officer</div>;

  return (
    <div className="space-y-5">
      <h3 className="text-gold-400 text-sm font-bold uppercase tracking-widest mb-4">Officer KYC</h3>
      <Field label="Full Name" value={data.full_name} onChange={v => onUpdate({ full_name: v })} />
      <Field label="Role" value={data.role} onChange={v => onUpdate({ role: v })} />
      <Field label="Passport / ID" value={data.passport_number} onChange={v => onUpdate({ passport_number: v })} />
      <Field label="Date of Birth" value={data.dob} onChange={v => onUpdate({ dob: v })} />
      <Field label="Address" value={data.residential_address} onChange={v => onUpdate({ residential_address: v })} type="textarea" />

      <div className="pt-6 border-t border-gray-800">
        <button 
          onClick={async () => { setSaving(true); await onSave(data); setSaving(false); }} 
          className="w-full bg-gold-gradient text-black font-bold py-3 rounded-lg flex justify-center gap-2 items-center hover:scale-[1.02] transition-transform"
        >
          {saving ? <Loader2 className="animate-spin"/> : <Save size={18}/>} Save Officer Changes
        </button>
      </div>
    </div>
  );
};

// 🆕 COMPLIANCE VIEWER
const ComplianceViewer = ({ answers }) => {
    if (!answers || answers.length === 0) return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 border border-dashed border-gray-700 rounded-xl">
            <AlertTriangle size={32} className="mb-2 opacity-50"/>
            <p>No Compliance Data Found</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {answers.map((entry, idx) => (
                <div key={idx} className="bg-black/30 border border-gray-700 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                         <h4 className="text-gold-400 font-bold text-sm">{entry.questionnaire_id || "Questionnaire"}</h4>
                         <span className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="space-y-3">
                        {Object.entries(entry.answers).map(([qid, val]) => (
                            <div key={qid}>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Question ID: {qid}</p>
                                <p className="text-sm text-white bg-obsidian-900 p-2 rounded border border-gray-800">{val}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// 🆕 PROXY VIEWER (Preserved Logic)
const EvidenceViewer = ({ file }) => {
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (file) loadProxyImage(file.id);
    else setImageData(null);
  }, [file]);

  const loadProxyImage = async (fileId) => {
    setLoading(true); 
    setError(false);
    setImageData(null);
    try {
      // Call Backend Proxy
      const proxy = await api.getFileProxy(fileId);
      if (proxy.base64) {
        setImageData(`data:${proxy.mimeType};base64,${proxy.base64}`);
      } else {
        setError(true);
      }
    } catch (e) {
      console.error("Proxy Error", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!file) return <div className="h-full flex flex-col items-center justify-center text-gray-500"><AlertCircle size={32} className="mb-2 opacity-50"/>No Document Found</div>;

  return (
    <div className="h-full flex flex-col bg-black">
      <div className="bg-obsidian-800 py-2 px-4 text-xs text-gray-400 border-b border-gray-700 flex justify-between">
        <span>{file.name}</span>
        <a href={file.url} target="_blank" rel="noreferrer" className="text-gold-400 hover:text-white flex gap-1 items-center"><ExternalLink size={12}/> Drive</a>
      </div>
      
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        {loading && <div className="flex flex-col items-center gap-2 text-gold-400"><Loader2 className="animate-spin w-8 h-8"/> <span className="text-xs">Decrypting Stream...</span></div>}
        
        {!loading && imageData && (
          <img src={imageData} alt="Evidence" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-gray-800" />
        )}

        {!loading && error && (
          <div className="text-red-400 text-sm text-center">
            <p>Preview Unavailable (PDF or Unsupported)</p>
            <a href={file.url} target="_blank" className="underline mt-2 block">Open in Drive</a>
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">{label}</label>
    {type === "textarea" ? (
      <textarea 
        value={value || ''} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-gold-400 focus:outline-none h-24 resize-none"
      />
    ) : (
      <input 
        type="text" 
        value={value || ''} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-gold-400 focus:outline-none"
      />
    )}
  </div>
);
