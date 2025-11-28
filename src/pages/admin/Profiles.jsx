[cite: 209] import React, { useState, useEffect } from 'react';
[cite: 210] import { api } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Eye, AlertCircle, ExternalLink } from 'lucide-react';

export default function Profiles() {
  // ... (Same as before, no changes here)
[cite: 211]   const [merchants, setMerchants] = useState([]);
[cite: 212]   const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMerchants();
  }, []);

  const loadMerchants = async () => {
    try {
[cite: 213]       const data = await api.getAllMerchants();
[cite: 214]       setMerchants(data || []);
    } catch (e) {
      console.error("Failed to load merchants", e);
[cite: 215]     } finally {
      setLoading(false);
    }
  };

  return (
[cite: 216]     <div className="p-6 min-h-screen bg-slate-900 text-white">
      {/* ... (Rest of the component remains the same) */}
[cite: 217]       <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-yellow-500">Sniper Review Queue</h1>
           <p className="text-slate-400 mt-1">Verify AI Extraction against Original Documents</p>
        </div>
        <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
          <span className="text-yellow-500 font-bold">{merchants.filter(m => m.status === 'Pending Review').length}</span> Pending
        </div>
      </div>
      
      {/* QUEUE LIST */}
      <div className="space-y-3">
        {loading && <div className="text-slate-400">Loading queue...</div>}
        
        {!loading && merchants.map(m => (
          <motion.div 
            key={m.merchant_id} 
            layoutId={m.merchant_id}
            className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-yellow-500/50 flex justify-between items-center"
          >
            <div className="flex items-center gap-4">
              <div className={`w-2 h-12 rounded-full ${m.status === 'Approved' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <div>
                <h3 className="font-bold text-lg">{m.company_name || 'Unknown Entity'}</h3>
                <div className="flex gap-3 text-xs text-slate-400 font-mono">
                  <span>ID: {m.merchant_id}</span>
                  <span>•</span>
                  <span>{m.country}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedMerchant(m)}
              className="bg-slate-900 text-slate-300 hover:text-white px-5 py-2 rounded-lg border border-slate-700 hover:border-yellow-500 flex items-center gap-2"
            >
              <Eye size={16} /> Review
            </button>
          </motion.div>
        ))}
      </div>

      {/* SNIPER MODAL */}
      <AnimatePresence>
        {selectedMerchant && (
          <SniperModal 
            merchant={selectedMerchant} 
            onClose={() => setSelectedMerchant(null)} 
            onSave={() => { setSelectedMerchant(null); loadMerchants(); }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SniperModal({ merchant, onClose, onSave }) {
[cite: 221]   const [formData, setFormData] = useState({ ...merchant });
[cite: 222]   const [saving, setSaving] = useState(false);
  const evidenceUrl = merchant.folder_url; 

  // 🛠️ HELPER: Try to make the Drive URL embeddable (Preview Mode)
[cite: 223]   const getEmbedUrl = (url) => {
[cite: 224]     if (!url) return null;
    // If it's a folder, we can't easily embed it without auth.
    // If it's a file, replace /view with /preview
    return url.replace('/view', '/preview');
  };

[cite: 225]   const handleDecision = async (status) => {
    setSaving(true);
    try {
[cite: 226]         await api.updateMerchant({ ...formData, status });
[cite: 227]         onSave();
    } catch (e) {
      alert("Save failed");
[cite: 228]     } finally {
        setSaving(false);
    }
  };

  return (
[cite: 229]     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 w-full max-w-7xl h-[90vh] rounded-2xl border border-slate-700 flex overflow-hidden shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-slate-800 p-2 rounded-full text-white hover:bg-slate-700"><X size={20} /></button>

        {/* DATA EDITOR */}
[cite: 230]         <div className="w-1/3 p-8 border-r border-slate-700 overflow-y-auto bg-slate-900">
          <h2 className="text-xl font-bold text-yellow-500 mb-6 flex items-center gap-2"><AlertCircle size={20}/> Extracted Data</h2>
          
          <div className="space-y-4">
[cite: 231]             <Field label="Company Name" value={formData.company_name} onChange={v => setFormData({...formData, company_name: v})} />
            <Field label="Registration No" value={formData.registration_number} onChange={v => setFormData({...formData, registration_number: v})} />
            <Field label="Inc Date" value={formData.incorporation_date} onChange={v => setFormData({...formData, incorporation_date: v})} />
            <Field label="Country" value={formData.country} onChange={v => setFormData({...formData, country: v})} />
            <Field label="Registered Address" value={formData.registered_address} onChange={v => setFormData({...formData, registered_address: v})} type="textarea" />
          </div>

[cite: 232]           <div className="mt-8 flex gap-4">
            <button onClick={() => handleDecision('Approved')} disabled={saving} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold flex justify-center gap-2">
              <Check size={18} /> {saving ? 'Saving...' : 'Approve'}
            </button>
            <button onClick={() => handleDecision('Rejected')} disabled={saving} className="flex-1 bg-slate-800 text-red-400 py-3 rounded-xl font-bold">Reject</button>
          </div>
        </div>

        {/* DOCUMENT VIEWER */}
[cite: 233]         <div className="w-2/3 bg-black flex flex-col relative group">
            <div className="bg-slate-800 py-2 px-4 text-xs text-slate-400 flex justify-between items-center">
                <span>EVIDENCE VIEWER</span>
                {evidenceUrl && (
[cite: 234]                     <a href={evidenceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gold-400 hover:text-white"> {/* ✅ FIXED: Gold Link */}
                        <ExternalLink size={12} /> Open in Drive
                    </a>
                )}
            </div>
[cite: 235]             <div className="flex-1 flex items-center justify-center bg-slate-950 relative">
                {evidenceUrl ? (
                    <>
                        <iframe 
[cite_start][cite: 236]                             src={getEmbedUrl(evidenceUrl)} 
                            className="w-full h-full border-none opacity-50 group-hover:opacity-100 transition-opacity" 
                            title="Evidence" 
                        />
                        {/* Fallback Overlay if 403 happens */}
[cite: 238]                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                             <div className="bg-black/80 p-6 rounded-xl text-center pointer-events-auto border border-slate-700">
                                <AlertCircle className="mx-auto text-yellow-500 mb-2" size={32}/>
                                <p className="text-white font-bold mb-2">Access Restricted</p>
                                <p className="text-xs text-slate-400 mb-4 max-w-xs">Google Drive folder permissions may prevent embedding.</p>
[cite: 240]                                 <a href={evidenceUrl} target="_blank" rel="noopener noreferrer" className="bg-gold-gradient text-black px-4 py-3 rounded-lg text-sm font-bold inline-flex items-center gap-2 hover:scale-105 transition-transform"> {/* ✅ FIXED: Gold Gradient Button */}
                                    <ExternalLink size={16}/> Open Evidence Folder
                                </a>
                             </div>
                        </div>
                    </>
                ) : (
[cite: 242]                     <div className="text-slate-500">No Document Attached</div>
                )}
            </div>
        </div>
      </motion.div>
    </div>
  );
}

const Field = ({ label, value, onChange, type = "text" }) => (
  <div>
[cite: 243]     <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{label}</label>
    {type === "textarea" ? (
      <textarea value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none h-24" />
    ) : (
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" />
    )}
  </div>
);
