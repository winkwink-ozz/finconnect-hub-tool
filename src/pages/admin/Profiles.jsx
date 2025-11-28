import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Search, Filter, ChevronDown, ChevronUp, ExternalLink, Users, Building, FileText, Loader2, CheckCircle, XCircle, Edit3, Globe, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profiles = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [details, setDetails] = useState({}); 
  
  // EDIT STATE
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await api.getMerchants();
      setMerchants(data);
    } catch(e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setIsEditing(false);
    } else {
      setExpandedId(id);
      setIsEditing(false);
      if (!details[id]) {
        try {
          const fullData = await api.getMerchantDetails(id);
          setDetails(prev => ({ ...prev, [id]: fullData }));
          setEditData(fullData.company); 
        } catch(e) { console.error(e); }
      } else {
        setEditData(details[id].company);
      }
    }
  };

  const handleStatusUpdate = async (id, status) => {
    if (!window.confirm(`Mark this application as ${status}?`)) return;
    try {
      await api.updateMerchant({ merchant_id: id, status });
      setMerchants(prev => prev.map(m => m.merchant_id === id ? { ...m, status } : m));
    } catch (e) { alert("Error: " + e.message); }
  };

  const handleSaveEdits = async (id) => {
    try {
      await api.updateMerchant({ merchant_id: id, ...editData });
      setDetails(prev => ({
        ...prev,
        [id]: { ...prev[id], company: { ...prev[id].company, ...editData } }
      }));
      setMerchants(prev => prev.map(m => m.merchant_id === id ? { ...m, ...editData } : m));
      setIsEditing(false);
    } catch (e) { alert("Save failed: " + e.message); }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <h2 className="text-3xl font-bold text-white">Merchant Profiles</h2>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-3 text-gray-500" size={16} />
            <input type="text" placeholder="Search companies..." className="w-full bg-obsidian-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-gold-400 outline-none" />
          </div>
        </div>
      </div>

      <div className="bg-obsidian-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-12 bg-black/20 text-gray-500 text-xs uppercase tracking-widest p-5 font-bold hidden md:grid border-b border-gray-800">
          <div className="col-span-4">Company Details</div>
          <div className="col-span-3">Jurisdiction</div>
          <div className="col-span-3">Date Joined</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-gold-400" /></div>
        ) : (
          merchants.map((m) => (
            <div key={m.merchant_id} className="border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors">
              <div onClick={() => toggleExpand(m.merchant_id)} className="grid grid-cols-1 md:grid-cols-12 p-5 items-center cursor-pointer gap-4 md:gap-0">
                <div className="col-span-4 font-semibold text-white flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gold-gradient flex items-center justify-center text-black font-bold shadow-lg shadow-gold-500/20">{m.company_name ? m.company_name.charAt(0) : '?'}</div>
                  <div>
                    <h3 className="font-bold text-lg">{m.company_name || "Unknown Company"}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gold-400 font-mono tracking-wider">{m.registration_number || "NO-ID"}</span>
                    </div>
                  </div>
                </div>
                <div className="col-span-3 text-gray-300 text-sm flex items-center gap-2">
                  <Globe size={14} className="text-gray-500"/>
                  {m.country || "Not Detected"}
                </div>
                <div className="col-span-3 text-gray-400 text-sm">{m.incorporation_date || "N/A"}</div>
                <div className="col-span-2 flex justify-end gap-4 items-center">
                  <StatusPill status={m.status} />
                  {expandedId === m.merchant_id ? <ChevronUp size={20} className="text-gold-400"/> : <ChevronDown size={20} className="text-gray-600"/>}
                </div>
              </div>

              <AnimatePresence>
                {expandedId === m.merchant_id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden bg-black/40 border-t border-gray-800">
                    <div className="p-0"> {/* No padding here to allow full width split */}
                      {!details[m.merchant_id] ? (
                        <div className="p-10 flex items-center justify-center gap-2 text-gold-400"><Loader2 className="animate-spin"/> Loading Profile...</div>
                      ) : (
                        <div className="flex flex-col lg:flex-row h-[800px]"> {/* Fixed height for split view */}
                          
                          {/* LEFT: DATA & EDITING (Scrollable) */}
                          <div className="w-full lg:w-1/2 p-8 overflow-y-auto border-r border-gray-800">
                            
                            {/* ACTION BAR */}
                            <div className="flex justify-between items-center mb-6 bg-obsidian-800 p-4 rounded-xl border border-gray-700">
                              <h4 className="text-sm font-bold text-white flex items-center gap-2"><Building size={16}/> Entity Profile</h4>
                              {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="text-xs flex items-center gap-1 text-gold-400 hover:text-white border border-gold-500/30 px-3 py-1.5 rounded-lg transition-all"><Edit3 size={12}/> Enable Edit</button>
                              ) : (
                                <div className="flex gap-2">
                                  <button onClick={() => setIsEditing(false)} className="text-xs text-gray-400 hover:text-white px-2">Cancel</button>
                                  <button onClick={() => handleSaveEdits(m.merchant_id)} className="text-xs bg-gold-gradient text-black px-4 py-1.5 rounded-lg font-bold hover:brightness-110">Save Changes</button>
                                </div>
                              )}
                            </div>

                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <Field label="Company Name" value={editData.company_name} isEdit={isEditing} onChange={v => setEditData({...editData, company_name: v})} />
                                <Field label="Reg Number" value={editData.registration_number} isEdit={isEditing} onChange={v => setEditData({...editData, registration_number: v})} />
                                <Field label="Incorporation Date" value={editData.incorporation_date} isEdit={isEditing} onChange={v => setEditData({...editData, incorporation_date: v})} />
                                <Field label="Jurisdiction" value={editData.country} isEdit={isEditing} onChange={v => setEditData({...editData, country: v})} />
                                <div className="col-span-2">
                                  <Field label="Registered Address" value={editData.registered_address} isEdit={isEditing} onChange={v => setEditData({...editData, registered_address: v})} />
                                </div>
                                <div className="col-span-2">
                                  <Field label="Operational Address" value={editData.operational_address || "Same as Registered"} isEdit={isEditing} onChange={v => setEditData({...editData, operational_address: v})} />
                                </div>
                              </div>

                              <div className="border-t border-gray-700 pt-6">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Users size={14}/> Officers</h4>
                                <div className="space-y-3">
                                  {details[m.merchant_id].officers.map((off, idx) => (
                                    <div key={idx} className="bg-obsidian-900 p-4 rounded-xl border border-gray-700/50 flex flex-col gap-2">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <div className="font-bold text-white">{off.full_name}</div>
                                          <span className="text-[10px] text-gold-400 font-bold bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20">{off.role}</span>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mt-1">
                                        <div>PASSPORT: <span className="text-white font-mono">{off.passport_number}</span></div>
                                        <div>DOB: <span className="text-white">{off.dob}</span></div>
                                      </div>
                                      <div className="text-xs text-gray-500 border-t border-gray-800 pt-2 mt-1">{off.residential_address}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* ACTIONS */}
                              <div className="border-t border-gray-700 pt-6">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Decision</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <button onClick={() => handleStatusUpdate(m.merchant_id, 'Approved')} className="py-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl hover:bg-green-500 hover:text-black font-bold transition-all flex justify-center gap-2"><CheckCircle size={18}/> Approve</button>
                                  <button onClick={() => handleStatusUpdate(m.merchant_id, 'Rejected')} className="py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500 hover:text-black font-bold transition-all flex justify-center gap-2"><XCircle size={18}/> Reject</button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* RIGHT: DOCUMENT VERIFICATION DECK */}
                          <div className="w-full lg:w-1/2 bg-black flex flex-col border-l border-gray-700">
                            <div className="p-4 border-b border-gray-700 bg-obsidian-800 flex justify-between items-center">
                              <h4 className="text-sm font-bold text-white flex items-center gap-2"><FileText size={16}/> Evidence Vault</h4>
                              <a href={m.folder_url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-white flex items-center gap-1"><ExternalLink size={12}/> Open External</a>
                            </div>
                            
                            <div className="flex-1 bg-neutral-900 flex items-center justify-center relative overflow-hidden">
                              {/* 📄 IFRAME EMBED OF GOOGLE DRIVE FOLDER */}
                              {/* Note: This requires the viewer to be logged into Google and have permission */}
                              <iframe 
                                src={`https://drive.google.com/embeddedfolderview?id=${m.folder_id || m.folder_url.split('folders/')[1]}#grid`}
                                className="w-full h-full border-0"
                                title="Document Viewer"
                              />
                              {(!m.folder_id && !m.folder_url) && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                                  <FolderOpen size={48} className="mb-4 opacity-50"/>
                                  <p>No Folder Linked</p>
                                </div>
                              )}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Field = ({ label, value, isEdit, onChange }) => (
  <div className="bg-obsidian-900/50 p-3 rounded-lg border border-gray-800">
    <span className="text-gray-500 text-[10px] font-bold uppercase block mb-1">{label}</span>
    {isEdit ? (
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-black border border-gold-500/50 rounded px-2 py-1 text-white text-sm focus:outline-none" />
    ) : (
      <span className="text-white text-sm font-medium truncate block">{value || "N/A"}</span>
    )}
  </div>
);

const StatusPill = ({ status }) => {
  const color = status === 'Approved' ? 'green' : status === 'Rejected' ? 'red' : 'yellow';
  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-${color}-500/10 text-${color}-400 border border-${color}-500/20`}>
      <span className={`w-2 h-2 rounded-full bg-${color}-400 animate-pulse`}></span>
      {status || 'Pending'}
    </div>
  );
};

export default Profiles;
