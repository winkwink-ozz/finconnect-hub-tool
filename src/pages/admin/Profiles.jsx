import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Search, Filter, ChevronDown, ChevronUp, ExternalLink, Users, Building, FileText, Loader2, CheckCircle, XCircle, Edit3, Globe, FolderOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profiles = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [details, setDetails] = useState({}); 
  const [files, setFiles] = useState({}); // Cache for files { merchantId: [files] }
  
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

  const toggleExpand = async (m) => {
    if (expandedId === m.merchant_id) {
      setExpandedId(null);
      setIsEditing(false);
    } else {
      setExpandedId(m.merchant_id);
      setIsEditing(false);
      
      // Fetch Details if not cached
      if (!details[m.merchant_id]) {
        const fullData = await api.getMerchantDetails(m.merchant_id);
        setDetails(prev => ({ ...prev, [m.merchant_id]: fullData }));
        setEditData(fullData.company); 
      } else {
        setEditData(details[m.merchant_id].company);
      }

      // Fetch Files if not cached (using folder_id from merchant row)
      if (m.folder_id && !files[m.merchant_id]) {
        const fileList = await api.getFolderFiles(m.folder_id);
        setFiles(prev => ({ ...prev, [m.merchant_id]: fileList }));
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
      setDetails(prev => ({ ...prev, [id]: { ...prev[id], company: { ...prev[id].company, ...editData } } }));
      setMerchants(prev => prev.map(m => m.merchant_id === id ? { ...m, ...editData } : m));
      setIsEditing(false);
      alert("Profile Updated!");
    } catch (e) { alert("Save failed: " + e.message); }
  };

  // 🌍 Jurisdiction Helper
  const getJurisdiction = (m) => {
    if (m.country) return m.country;
    const addr = m.registered_address || "";
    if (addr.includes("Cyprus") || addr.includes("Limassol") || addr.includes("Nicosia")) return "Cyprus";
    if (addr.includes("Kingdom") || addr.includes("London")) return "United Kingdom";
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <h2 className="text-3xl font-bold text-white">Merchant Profiles</h2>
        <div className="relative flex-1 md:w-72">
          <Search className="absolute left-3 top-3 text-gray-500" size={16} />
          <input type="text" placeholder="Search companies..." className="w-full bg-obsidian-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-gold-400 outline-none" />
        </div>
      </div>

      <div className="bg-obsidian-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-12 bg-black/20 text-gray-500 text-xs uppercase tracking-widest p-5 font-bold hidden md:grid border-b border-gray-800">
          <div className="col-span-4">Company Details</div>
          <div className="col-span-3">Jurisdiction</div>
          <div className="col-span-3">Date Joined</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        {loading ? <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-gold-400" /></div> : merchants.map((m) => (
          <div key={m.merchant_id} className="border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors">
            <div onClick={() => toggleExpand(m)} className="grid grid-cols-1 md:grid-cols-12 p-5 items-center cursor-pointer gap-4 md:gap-0">
              <div className="col-span-4 font-semibold text-white flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gold-gradient flex items-center justify-center text-black font-bold shadow-lg shadow-gold-500/20">{m.company_name ? m.company_name.charAt(0) : '?'}</div>
                <div>
                  <h3 className="font-bold text-lg">{m.company_name || "Unknown"}</h3>
                  <span className="text-sm text-gold-400 font-mono tracking-wider">{m.registration_number || "NO-ID"}</span>
                </div>
              </div>
              <div className="col-span-3 text-gray-300 text-sm flex items-center gap-2">
                <Globe size={14} className="text-gray-500"/>
                {getJurisdiction(m) || "Not Detected"}
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
                  <div className="p-0">
                    {!details[m.merchant_id] ? (
                      <div className="p-10 flex items-center justify-center gap-2 text-gold-400"><Loader2 className="animate-spin"/> Loading Profile...</div>
                    ) : (
                      <div className="flex flex-col lg:flex-row h-[800px]">
                        
                        {/* LEFT: DATA */}
                        <div className="w-full lg:w-1/2 p-8 overflow-y-auto border-r border-gray-800">
                          <div className="flex justify-between items-center mb-6 bg-obsidian-800 p-4 rounded-xl border border-gray-700">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2"><Building size={16}/> Entity Profile</h4>
                            {!isEditing ? (
                              <button onClick={() => setIsEditing(true)} className="text-xs flex items-center gap-1 text-gold-400 hover:text-white border border-gold-500/30 px-3 py-1.5 rounded-lg"><Edit3 size={12}/> Edit Data</button>
                            ) : (
                              <div className="flex gap-2">
                                <button onClick={() => setIsEditing(false)} className="text-xs text-gray-400">Cancel</button>
                                <button onClick={() => handleSaveEdits(m.merchant_id)} className="text-xs bg-gold-gradient text-black px-4 py-1.5 rounded-lg font-bold">Save</button>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <Field label="Company Name" value={editData.company_name} isEdit={isEditing} onChange={v => setEditData({...editData, company_name: v})} />
                            <Field label="Reg Number" value={editData.registration_number} isEdit={isEditing} onChange={v => setEditData({...editData, registration_number: v})} />
                            <Field label="Incorporation Date" value={editData.incorporation_date} isEdit={isEditing} onChange={v => setEditData({...editData, incorporation_date: v})} />
                            <Field label="Jurisdiction" value={editData.country} isEdit={isEditing} onChange={v => setEditData({...editData, country: v})} />
                            <div className="col-span-2">
                              <Field label="Registered Address" value={editData.registered_address} isEdit={isEditing} onChange={v => setEditData({...editData, registered_address: v})} />
                            </div>
                          </div>

                          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-8 mb-4 flex items-center gap-2"><Users size={14}/> Officers</h4>
                          <div className="space-y-3">
                            {details[m.merchant_id].officers.map((off, idx) => (
                              <div key={idx} className="bg-obsidian-800 p-4 rounded-xl border border-gray-700/50">
                                <div className="flex justify-between">
                                  <span className="font-bold text-white">{off.full_name}</span>
                                  <span className="text-xs text-gold-400 border border-gold-500/30 px-2 py-0.5 rounded">{off.role}</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">Passport: {off.passport_number}</div>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-gray-700 pt-6 mt-6">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Decision</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <button onClick={() => handleStatusUpdate(m.merchant_id, 'Approved')} className="py-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl hover:bg-green-500 hover:text-black font-bold flex justify-center gap-2"><CheckCircle size={18}/> Approve</button>
                              <button onClick={() => handleStatusUpdate(m.merchant_id, 'Rejected')} className="py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500 hover:text-black font-bold flex justify-center gap-2"><XCircle size={18}/> Reject</button>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT: DOCUMENT GALLERY */}
                        <div className="w-full lg:w-1/2 bg-black flex flex-col border-l border-gray-700">
                          <div className="p-4 border-b border-gray-700 bg-obsidian-800 flex justify-between items-center">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2"><FileText size={16}/> Evidence Vault</h4>
                            <a href={m.folder_url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-white flex items-center gap-1"><ExternalLink size={12}/> Open Drive</a>
                          </div>
                          
                          <div className="flex-1 bg-neutral-900 relative overflow-hidden">
                            {files[m.merchant_id] ? (
                              <FileCarousel files={files[m.merchant_id]} />
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                {m.folder_id ? <Loader2 className="animate-spin mb-2"/> : <FolderOpen size={48} className="mb-4 opacity-50"/>}
                                <p>{m.folder_id ? "Loading Files..." : "No Folder Linked"}</p>
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
        ))}
      </div>
    </div>
  );
};

// 🖼️ CAROUSEL COMPONENT
const FileCarousel = ({ files }) => {
  const [idx, setIdx] = useState(0);
  if (files.length === 0) return <div className="h-full flex items-center justify-center text-gray-500">No files in folder.</div>;

  const file = files[idx];
  const isImage = file.mimeType.includes('image');
  const isPDF = file.mimeType.includes('pdf');

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative flex items-center justify-center bg-black p-4">
        {isImage ? (
          <img src={file.url} alt="Doc" className="max-h-full max-w-full object-contain rounded shadow-2xl" />
        ) : isPDF ? (
          <iframe src={file.url.replace('view', 'preview')} className="w-full h-full border-0" title="PDF"></iframe>
        ) : (
          <div className="text-gray-400 flex flex-col items-center"><FileText size={48} className="mb-2"/><span>Preview not available for {file.mimeType}</span></div>
        )}
        
        {/* Navigation */}
        {files.length > 1 && (
          <>
            <button onClick={() => setIdx(i => (i - 1 + files.length) % files.length)} className="absolute left-4 p-2 bg-black/50 rounded-full text-white hover:bg-gold-500 hover:text-black"><ChevronLeft /></button>
            <button onClick={() => setIdx(i => (i + 1) % files.length)} className="absolute right-4 p-2 bg-black/50 rounded-full text-white hover:bg-gold-500 hover:text-black"><ChevronRight /></button>
          </>
        )}
      </div>
      <div className="p-4 bg-obsidian-800 border-t border-gray-700 text-center">
        <p className="text-white font-medium text-sm truncate">{file.name}</p>
        <p className="text-gray-500 text-xs">{idx + 1} of {files.length}</p>
      </div>
    </div>
  );
};

const Field = ({ label, value, isEdit, onChange }) => (
  <div className="bg-obsidian-900/50 p-3 rounded-lg border border-gray-800">
    <span className="text-gray-500 text-[10px] font-bold uppercase block mb-1">{label}</span>
    {isEdit ? <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-black border border-gold-500/50 rounded px-2 py-1 text-white text-sm focus:outline-none" /> : <span className="text-white text-sm font-medium truncate block">{value || "N/A"}</span>}
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
