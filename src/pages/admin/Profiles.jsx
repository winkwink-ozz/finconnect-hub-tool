// === START FILE: src/pages/admin/Profiles.jsx ===
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Eye, AlertCircle, ExternalLink, User, Building, Loader2, Save, FileCheck, AlertTriangle, ScanLine } from 'lucide-react';
import Toast from '../../components/ui/Toast';
import Skeleton from '../../components/ui/Skeleton';

export default function Profiles() {
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
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
           <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gold-gradient">Client Profiles</h1>
           <p className="text-gray-400 mt-1">Verify Entity, Officer & Compliance Data</p>
        </div>
        {!loading && (
          <div className="bg-obsidian-800 px-4 py-2 rounded-lg border border-gold-500/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
            <span className="text-gold-400 font-bold">{merchants.filter(m => m.status === 'Pending Review').length}</span> <span className="text-gray-400">Pending</span>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {loading ? (
           [1,2,3].map(i => (
             <div key={i} className="bg-obsidian-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-1.5 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-10 w-24 rounded-lg" />
             </div>
           ))
        ) : (
           merchants.map(m => (
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
                onClick={() => setSelectedMerchant(m)} 
                className="bg-black/40 text-gray-300 hover:text-gold-400 hover:bg-gold-500/10 px-5 py-2 rounded-lg border border-gray-700 hover:border-gold-500/50 flex items-center gap-2 transition-all"
              >
                <Eye size={16} /> Review
              </button>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {selectedMerchant && (
          <ProfileModal 
            merchant={selectedMerchant}
            onClose={() => setSelectedMerchant(null)} 
            onSave={() => { setSelectedMerchant(null); loadMerchants(); }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- MAIN MODAL COMPONENT ---
function ProfileModal({ merchant, onClose, onSave }) {
  const [data, setData] = useState(null);
  const [schemas, setSchemas] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [activeTab, setActiveTab] = useState('ENTITY');
  const [selectedOfficerId, setSelectedOfficerId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const imageCache = useRef({}); 

  useEffect(() => {
    loadDetails();
  }, [merchant.merchant_id]);

  const loadDetails = async () => {
    setLoading(true);
    setLoadingFiles(true);
    try {
      const promises = [
         api.getMerchantFull(merchant.merchant_id),
         api.getQuestionnaires()
      ];

      if (merchant.folder_id) {
        promises.push(api.getFolderFiles(merchant.folder_id));
      } else {
        promises.push(Promise.resolve([]));
      }

      const [details, allSchemas, driveFiles] = await Promise.all(promises);

      setData(details);
      setSchemas(allSchemas);
      setFiles(driveFiles || []);
      
      if (!merchant.folder_id && details.company.folder_id) {
         api.getFolderFiles(details.company.folder_id).then(f => setFiles(f));
      }
      
      if (details.officers && details.officers.length > 0) {
        setSelectedOfficerId(details.officers[0].officer_id);
      }

    } catch (e) {
      console.error(e);
      showToast("Failed to load profile data", "error");
    } finally {
      setLoading(false);
      setLoadingFiles(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const findRelevantFile = (keyword) => {
    if (!files.length) return null;
    return files.find(f => f.name.toLowerCase().includes(keyword.toLowerCase()));
  };

  if (loading || !data) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
       <div className="bg-obsidian-800 w-full max-w-7xl h-[90vh] rounded-2xl border border-gray-700 flex flex-col shadow-2xl p-6 space-y-6">
          <div className="flex justify-between">
             <Skeleton className="h-8 w-64" />
             <Skeleton className="h-8 w-32" />
          </div>
          <div className="flex gap-4 border-b border-gray-700 pb-4">
             <Skeleton className="h-10 w-24" />
             <Skeleton className="h-10 w-24" />
             <Skeleton className="h-10 w-24" />
          </div>
          <div className="flex-1 flex gap-6">
             <Skeleton className="w-1/3 h-full rounded-xl" />
             <Skeleton className="w-2/3 h-full rounded-xl" />
          </div>
       </div>
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
            <TabButton active={activeTab === 'ENTITY'} onClick={() => setActiveTab('ENTITY')} icon={Building} label="Entity" />
            <TabButton active={activeTab === 'OFFICERS'} onClick={() => setActiveTab('OFFICERS')} icon={User} label={`Officers (${data.officers.length})`} />
            <TabButton active={activeTab === 'COMPLIANCE'} onClick={() => setActiveTab('COMPLIANCE')} icon={FileCheck} label="Compliance" />
            <div className="w-px h-6 bg-gray-700 mx-2"></div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white"><X size={20} /></button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className={`${activeTab === 'COMPLIANCE' ? 'w-full' : 'w-1/3 border-r'} border-gray-700 bg-obsidian-900 overflow-y-auto p-6 transition-all duration-300`}>
            {activeTab === 'ENTITY' && (
              <EntityForm 
                data={data.company} 
                onUpdate={(updated) => setData({ ...data, company: { ...data.company, ...updated } })}
                onSave={async () => {
                  try {
                    await api.updateMerchant(data.company);
                    showToast(`Entity Status: ${data.company.status}`, "success");
                    onSave(); 
                  } catch(e) { showToast(e.message, "error"); }
                }}
              />
            )}

            {activeTab === 'OFFICERS' && (
              <div className="space-y-6">
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

            {activeTab === 'COMPLIANCE' && (
               <div className="max-w-4xl mx-auto">
                 <ComplianceViewer 
                   answers={data.answers} 
                   schemas={schemas} 
                   onSave={async (responseId, newAnswers) => {
                       try {
                           await api.updateAnswers({ response_id: responseId, answers: newAnswers });
                           showToast("Compliance Data Updated", "success");
                       } catch(e) { showToast("Save Failed", "error"); }
                   }}
                 />
               </div>
            )}
          </div>

          {activeTab !== 'COMPLIANCE' && (
            <div className="w-2/3 bg-black flex flex-col relative">
               <EvidenceViewer 
                 file={
                   activeTab === 'OFFICERS' 
                   ? findRelevantFile(data.officers.find(o => o.officer_id === selectedOfficerId)?.full_name.split(' ')[0]) || files[0]
                   : findRelevantFile('CERT') || files[0]
                 }
                 loadingFiles={loadingFiles}
                 cache={imageCache}
               />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// --- UPDATED EVIDENCE VIEWER ---
const EvidenceViewer = ({ file, loadingFiles, cache }) => {
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (file) {
      loadProxyImage(file.id);
    } else {
      setImageData(null);
    }
  }, [file]);

  const loadProxyImage = async (fileId) => {
    setError(false);
    if (cache.current[fileId]) {
        setImageData(cache.current[fileId]);
        setLoading(false);
        return;
    }
    setLoading(true);
    setImageData(null);
    try {
      const proxy = await api.getFileProxy(fileId);
      if (proxy.base64) {
        const src = `data:${proxy.mimeType};base64,${proxy.base64}`;
        cache.current[fileId] = src;
        setImageData(src);
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

  if (!file) {
      if (loadingFiles) {
          return (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Skeleton className="w-16 h-16 rounded-xl" />
                <div className="flex items-center gap-2 text-gold-400 text-xs animate-pulse">
                    <ScanLine size={14} /> Scanning Repository...
                </div>
            </div>
          );
      }
      return (
        <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <AlertCircle size={32} className="mb-2 opacity-50"/>
            No Document Found
        </div>
      );
  }

  return (
    <div className="h-full flex flex-col bg-black">
      <div className="bg-obsidian-800 py-2 px-4 text-xs text-gray-400 border-b border-gray-700 flex justify-between">
        <span className="flex items-center gap-2"><FileCheck size={12} className="text-gold-400"/> {file.name}</span>
        <a href={file.url} target="_blank" rel="noreferrer" className="text-gold-400 hover:text-white flex gap-1 items-center"><ExternalLink size={12}/> Drive</a>
      </div>
      
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        {loading && (
             <div className="flex flex-col items-center gap-2 text-gold-400">
                <Skeleton className="w-64 h-96 rounded-lg opacity-20" /> 
                <span className="text-xs absolute mt-40 flex items-center gap-2"><Loader2 className="animate-spin" size={14}/> Decrypting Secure Stream...</span>
             </div>
        )}
        
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

// --- SUB-COMPONENTS ---
const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
      active ? 'bg-gold-gradient text-black shadow-lg shadow-gold-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon size={16} /> {label}
  </button>
);

const EntityForm = ({ data, onUpdate, onSave }) => (
  <div className="space-y-5">
    <h3 className="text-gold-400 text-sm font-bold uppercase tracking-widest mb-4">Corporate Details</h3>
    <Field label="Company Name" value={data.company_name} onChange={v => onUpdate({ company_name: v })} />
    <Field label="Registration No" value={data.registration_number} onChange={v => onUpdate({ registration_number: v })} />
    <Field label="Inc Date" value={data.incorporation_date} onChange={v => onUpdate({ incorporation_date: v })} />
    <Field label="Country" value={data.country} onChange={v => onUpdate({ country: v })} />
    <Field label="Address" value={data.registered_address} onChange={v => onUpdate({ registered_address: v })} type="textarea" />
    <div className="pt-6 border-t border-gray-800 flex flex-col gap-3">
      <div className="flex gap-3">
           <button onClick={() => { onUpdate({ status: 'Rejected' }); onSave(); }} className="flex-1 bg-transparent border border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 py-3 rounded-lg font-bold text-sm transition-all">Reject Entity</button>
           <button onClick={() => { onUpdate({ status: 'Approved' }); onSave(); }} className="flex-1 bg-green-600 hover:bg-green-500 py-3 rounded-lg font-bold text-sm text-white shadow-lg shadow-green-500/20 transition-all">Approve Entity</button>
      </div>
      <button onClick={onSave} className="w-full bg-obsidian-700 border border-gray-600 rounded-lg py-2 text-xs text-gray-400 hover:text-white flex items-center justify-center gap-2"><Save size={14}/> Save Changes Only</button>
    </div>
  </div>
);

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
        <button onClick={async () => { setSaving(true); await onSave(data); setSaving(false); }} className="w-full bg-gold-gradient text-black font-bold py-3 rounded-lg flex justify-center gap-2 items-center hover:scale-[1.02] transition-transform">
          {saving ? <Loader2 className="animate-spin"/> : <Save size={18}/>} Save Officer Changes
        </button>
      </div>
    </div>
  );
};

const ComplianceViewer = ({ answers, schemas, onSave }) => {
    if (!answers || answers.length === 0) return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 border border-dashed border-gray-700 rounded-xl">
            <AlertTriangle size={32} className="mb-2 opacity-50"/>
            <p>No Compliance Data Found</p>
        </div>
    );
    return (
        <div className="space-y-6">
            <div className="bg-obsidian-800/50 p-4 rounded-xl border border-gold-500/20 mb-6">
                <h3 className="text-gold-400 font-bold flex items-center gap-2"><FileCheck size={20}/> Compliance Overview</h3>
                <p className="text-xs text-gray-400 mt-1">Review & Edit the merchant's submitted declarations below.</p>
            </div>
            {answers.map((entry, idx) => (
                <EditableAnswerCard key={idx} entry={entry} schema={schemas.find(s => s.id === entry.questionnaire_id)} onSave={onSave}/>
            ))}
        </div>
    );
};

// ✅ UPGRADED CARD TO HANDLE LEGACY DATA
const EditableAnswerCard = ({ entry, schema, onSave }) => {
    const [localAnswers, setLocalAnswers] = useState(entry.answers);
    const [saving, setSaving] = useState(false);

    // 🧠 INTELLIGENT FIELD MAPPING (Fixes Issue 2: Data Loss on Column Change)
    const fields = schema 
        ? schema.schema.map(field => {
            // For Tables: Check if the answer data uses columns that match the schema
            // If there's a total mismatch (Legacy Data), we must override the columns
            if (field.type === 'table') {
                const answerRows = localAnswers[field.id] || [];
                if (answerRows.length > 0) {
                    const dataKeys = Object.keys(answerRows[0]);
                    // Check if current schema columns are found in the data
                    const isSchemaMatch = field.columns.some(col => dataKeys.includes(col));
                    
                    // If NO match, it means the Admin changed column names. 
                    // We must render the table using the OLD keys found in the data, 
                    // otherwise the cells will be blank.
                    if (!isSchemaMatch) {
                        return { ...field, columns: dataKeys, label: `${field.label} (Legacy Format)` };
                    }
                }
            }
            return field;
        })
        : Object.keys(entry.answers).map(k => {
            // Fallback for totally unknown questions (Deleted Forms)
            const val = entry.answers[k];
            if (Array.isArray(val)) {
                return { 
                    id: k, 
                    label: `Unknown Question (${k})`, 
                    type: 'table', 
                    columns: val.length > 0 ? Object.keys(val[0]) : ['Column 1'] 
                };
            }
            return { id: k, label: `Unknown Question (${k})`, type: 'text' };
        });

    const handleSave = async () => { setSaving(true); await onSave(entry.response_id, localAnswers); setSaving(false); };
    const handleTableEdit = (qId, rowIndex, colName, value) => {
        const currentTable = [...(localAnswers[qId] || [])];
        if(!currentTable[rowIndex]) currentTable[rowIndex] = {};
        currentTable[rowIndex] = { ...currentTable[rowIndex], [colName]: value };
        setLocalAnswers({ ...localAnswers, [qId]: currentTable });
    };

    return (
        <div className="bg-black/30 border border-gray-700 rounded-xl overflow-hidden hover:border-gold-500/30 transition-colors">
            {/* ✅ GOLD GRADIENT HEADER */}
            <div className="bg-gold-gradient p-4 flex justify-between items-center">
                 <h4 className="text-black font-bold text-lg">{schema ? schema.psp_type : entry.questionnaire_id}</h4>
                 <span className="text-xs text-black/70 font-mono font-bold">{new Date(entry.timestamp).toLocaleDateString()}</span>
            </div>
            
            <div className="p-6 grid grid-cols-1 gap-6">
                {fields.map((field) => (
                    <div key={field.id} className="p-4 bg-obsidian-900 rounded-xl border border-gray-800">
                        <p className="text-xs text-gold-500/70 uppercase tracking-wider mb-3 font-bold">{field.label}</p>
                        
                        {field.type === 'mcq' && (
                             <select value={localAnswers[field.id] || ''} onChange={(e) => setLocalAnswers({ ...localAnswers, [field.id]: e.target.value })} className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-gold-400 focus:outline-none text-sm">
                                <option value="">-- Select --</option>
                                {field.options && field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                             </select>
                        )}

                        {field.type === 'text' && (
                             <input type="text" value={localAnswers[field.id] || ''} onChange={(e) => setLocalAnswers({ ...localAnswers, [field.id]: e.target.value })} className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-gold-400 focus:outline-none text-sm" />
                        )}

                        {field.type === 'table' && (
                            <div className="overflow-x-auto border border-gray-700 rounded-lg bg-black/20">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-gray-800/50 text-gray-400 text-xs uppercase">
                                            {field.columns.map((c, i) => <th key={i} className="p-3 border-b border-gray-700">{c}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(localAnswers[field.id] || []).map((row, rIdx) => (
                                            <tr key={rIdx} className="border-b border-gray-800 last:border-0">
                                                {field.columns.map((col, cIdx) => (
                                                    <td key={cIdx} className="p-1">
                                                        <input 
                                                            type="text" 
                                                            value={row[col] || ''} 
                                                            onChange={(e) => handleTableEdit(field.id, rIdx, col, e.target.value)} 
                                                            className="w-full bg-transparent border-none focus:ring-1 focus:ring-gold-400 rounded px-2 py-1.5 text-white placeholder-gray-700"
                                                            placeholder="-"
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            {/* ✅ FIXED: SAVE BUTTON NOW HAS GOLD GRADIENT (Fixes Issue 1) */}
            <div className="flex justify-end p-4 border-t border-gray-800 bg-black/20">
                <button onClick={handleSave} className="bg-gold-gradient text-black font-bold py-2 px-6 rounded-lg text-sm transition-all flex items-center gap-2 shadow-lg shadow-gold-500/20 hover:scale-105">
                    {saving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Save Section
                </button>
            </div>
        </div>
    );
};

const Field = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">{label}</label>
    {type === "textarea" ? (
      <textarea value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-gold-400 focus:outline-none h-24 resize-none" />
    ) : (
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-gold-400 focus:outline-none" />
    )}
  </div>
);
// === END FILE: src/pages/admin/Profiles.jsx ===
