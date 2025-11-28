import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Eye, AlertCircle } from 'lucide-react';

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
    <div className="p-6 min-h-screen bg-slate-900 text-white">
      <div className="flex justify-between items-center mb-8">
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
  const [formData, setFormData] = useState({ ...merchant });
  const [saving, setSaving] = useState(false);
  const evidenceUrl = merchant.folder_url; 

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
        className="bg-slate-900 w-full max-w-7xl h-[90vh] rounded-2xl border border-slate-700 flex overflow-hidden shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-slate-800 p-2 rounded-full text-white hover:bg-slate-700"><X size={20} /></button>

        {/* DATA EDITOR */}
        <div className="w-1/3 p-8 border-r border-slate-700 overflow-y-auto bg-slate-900">
          <h2 className="text-xl font-bold text-yellow-500 mb-6 flex items-center gap-2"><AlertCircle size={20}/> Extracted Data</h2>
          
          <div className="space-y-4">
            <Field label="Company Name" value={formData.company_name} onChange={v => setFormData({...formData, company_name: v})} />
            <Field label="Registration No" value={formData.registration_number} onChange={v => setFormData({...formData, registration_number: v})} />
            <Field label="Inc Date" value={formData.incorporation_date} onChange={v => setFormData({...formData, incorporation_date: v})} />
            <Field label="Country" value={formData.country} onChange={v => setFormData({...formData, country: v})} />
            <Field label="Registered Address" value={formData.registered_address} onChange={v => setFormData({...formData, registered_address: v})} type="textarea" />
          </div>

          <div className="mt-8 flex gap-4">
            <button onClick={() => handleDecision('Approved')} disabled={saving} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold flex justify-center gap-2">
              <Check size={18} /> {saving ? 'Saving...' : 'Approve'}
            </button>
            <button onClick={() => handleDecision('Rejected')} disabled={saving} className="flex-1 bg-slate-800 text-red-400 py-3 rounded-xl font-bold">Reject</button>
          </div>
        </div>

        {/* DOCUMENT VIEWER */}
        <div className="w-2/3 bg-black flex flex-col">
            <div className="bg-slate-800 py-2 px-4 text-xs text-slate-400 text-right">EVIDENCE VIEWER</div>
            <div className="flex-1 flex items-center justify-center bg-slate-950">
                {evidenceUrl ? (
                    <iframe src={evidenceUrl} className="w-full h-full border-none" title="Evidence" />
                ) : (
                    <div className="text-slate-500">No Document Attached</div>
                )}
            </div>
        </div>
      </motion.div>
    </div>
  );
}

const Field = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{label}</label>
    {type === "textarea" ? (
      <textarea value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none h-24" />
    ) : (
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" />
    )}
  </div>
);
