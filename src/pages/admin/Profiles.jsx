import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Eye, AlertCircle, ExternalLink } from 'lucide-react';

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
           <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gold-gradient">Sniper Review Queue</h1>
           <p className="text-gray-400 mt-1">Verify AI Extraction against Original Documents</p>
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
              <div className={`w-1.5 h-12 rounded-full ${m.status === 'Approved' ? 'bg-green-500' : 'bg-gold-500'}`}></div>
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
  const [formData, setFormData] = useState({ ...merchant });
  const [saving, setSaving] = useState(false);
  const evidenceUrl = merchant.folder_url; 

  const getEmbedUrl = (url) => {
    if (!url) return null;
    return url.replace('/view', '/preview');
  };

  const handleDecision = async (status) => {
    setSaving(true);
    try {
        await api.updateMerchant({ ...formData, status });
        onSave();
    } catch (e) {
        alert("Save failed");
    } finally {
        setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-obsidian-800 w-full max-w-7xl h-[90vh] rounded-2xl border border-gray-700 flex overflow-hidden shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-black/50 p-2 rounded-full text-white hover:text-gold-400 hover:bg-black transition-colors"><X size={20} /></button>

        {/* LEFT: DATA EDITOR */}
        <div className="w-1/3 p-8 border-r border-gray-700 overflow-y-auto bg-obsidian-900">
          <h2 className="text-xl font-bold text-gold-400 mb-6 flex items-center gap-2"><AlertCircle size={20}/> Extracted Data</h2>
          
          <div className="space-y-5">
            <Field label="Company Name" value={formData.company_name} onChange={v => setFormData({...formData, company_name: v})} />
            <Field label="Registration No" value={formData.registration_number} onChange={v => setFormData({...formData, registration_number: v})} />
            <Field label="Inc Date" value={formData.incorporation_date} onChange={v => setFormData({...formData, incorporation_date: v})} />
            <Field label="Country" value={formData.country} onChange={v => setFormData({...formData, country: v})} />
            <Field label="Registered Address" value={formData.registered_address} onChange={v => setFormData({...formData, registered_address: v})} type="textarea" />
          </div>

          <div className="mt-8 flex gap-4 pt-6 border-t border-gray-800">
            <button 
              onClick={() => handleDecision('Approved')} 
              disabled={saving} 
              className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold flex justify-center gap-2 transition-all hover:scale-105 shadow-lg shadow-green-900/50"
            >
              <Check size={18} /> {saving ? 'Saving...' : 'Approve'}
            </button>
            <button 
              onClick={() => handleDecision('Rejected')} 
              disabled={saving} 
              className="flex-1 bg-red-900/50 border border-red-900 hover:bg-red-900 text-red-200 py-3 rounded-xl font-bold transition-all"
            >
              Reject
            </button>
          </div>
        </div>

        {/* RIGHT: DOCUMENT VIEWER */}
        <div className="w-2/3 bg-black flex flex-col relative group">
            <div className="bg-obsidian-800 py-3 px-6 text-xs text-gray-400 flex justify-between items-center border-b border-gray-700">
                <span className="font-bold tracking-wider">EVIDENCE VIEWER</span>
                {evidenceUrl && (
                    <a href={evidenceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gold-400 hover:text-white transition-colors">
                        <ExternalLink size={14} /> Open in Drive
                    </a>
                )}
            </div>
            <div className="flex-1 flex items-center justify-center bg-obsidian-900 relative">
                {evidenceUrl ? (
                    <>
                        <iframe 
                            src={getEmbedUrl(evidenceUrl)} 
                            className="w-full h-full border-none opacity-60 group-hover:opacity-100 transition-opacity duration-300" 
                            title="Evidence" 
                        />
                        {/* Fallback Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                             <div className="bg-black/80 p-8 rounded-2xl text-center pointer-events-auto border border-gray-700 backdrop-blur-sm shadow-2xl">
                                <AlertCircle className="mx-auto text-gold-400 mb-3" size={40}/>
                                <p className="text-white font-bold mb-2 text-lg">Access Verification Required</p>
                                <p className="text-xs text-gray-400 mb-6 max-w-xs mx-auto">Google Drive permissions may restrict inline viewing.</p>
                                <a href={evidenceUrl} target="_blank" rel="noopener noreferrer" className="bg-gold-gradient text-black px-6 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-gold-500/20">
                                    <ExternalLink size={18}/> Open Evidence Folder
                                </a>
                             </div>
                        </div>
                    </>
                ) : (
                    <div className="text-gray-500 flex flex-col items-center">
                        <AlertCircle size={32} className="mb-2 opacity-50"/>
                        No Document Attached
                    </div>
                )}
            </div>
        </div>
      </motion.div>
    </div>
  );
}

const Field = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">{label}</label>
    {type === "textarea" ? (
      <textarea 
        value={value || ''} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none h-24 transition-all"
      />
    ) : (
      <input 
        type="text" 
        value={value || ''} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-all"
      />
    )}
  </div>
);
