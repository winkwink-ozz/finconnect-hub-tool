import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
// 🛠️ FIX: Added 'Users' to the import list
import { Search, Filter, ChevronDown, ChevronUp, ExternalLink, Users, Building, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profiles = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [details, setDetails] = useState({}); // Cache for expanded details

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await api.getMerchants();
      setMerchants(data);
    } catch (error) {
      console.error("Failed to load merchants", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (!details[id]) {
        // Lazy load details only when clicked
        try {
          const fullData = await api.getMerchantDetails(id);
          setDetails(prev => ({ ...prev, [id]: fullData }));
        } catch (error) {
          console.error("Failed to load details", error);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER TOOLBAR */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Merchant Profiles</h2>
        <div className="flex gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 text-gray-500" size={16} />
            <input type="text" placeholder="Search companies..." className="w-full bg-obsidian-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-gold-400 outline-none" />
          </div>
          <button className="p-2 bg-obsidian-800 border border-gray-700 rounded-lg hover:text-gold-400"><Filter size={20} /></button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-obsidian-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="grid grid-cols-12 bg-black/40 text-gray-400 text-xs uppercase tracking-wider p-4 font-medium hidden md:grid">
          <div className="col-span-4">Company Name</div>
          <div className="col-span-3">Reg Number</div>
          <div className="col-span-3">Country</div>
          <div className="col-span-2">Status</div>
        </div>

        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-gold-400" /></div>
        ) : (
          merchants.map((m) => (
            <div key={m.merchant_id} className="border-t border-gray-700">
              {/* ROW HEADER */}
              <div 
                onClick={() => toggleExpand(m.merchant_id)}
                className="grid grid-cols-1 md:grid-cols-12 p-4 items-center hover:bg-white/5 cursor-pointer transition-colors gap-2 md:gap-0"
              >
                <div className="col-span-4 font-semibold text-white flex items-center gap-3">
                  <div className="p-2 bg-gold-500/10 rounded text-gold-400"><Building size={16}/></div>
                  {m.company_name}
                </div>
                <div className="col-span-3 text-gray-400 font-mono text-xs flex items-center gap-2">
                  <span className="md:hidden text-gray-600">ID:</span> {m.registration_number}
                </div>
                <div className="col-span-3 text-gray-300 text-sm">{m.country}</div>
                <div className="col-span-2 flex justify-between items-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${m.status === 'Approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {m.status || 'Pending'}
                  </span>
                  {expandedId === m.merchant_id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* EXPANDED DETAILS */}
              <AnimatePresence>
                {expandedId === m.merchant_id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: "auto", opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-black/30 border-t border-gray-700/50"
                  >
                    <div className="p-6 space-y-6">
                      
                      {!details[m.merchant_id] ? (
                        <div className="flex items-center gap-2 text-gold-400"><Loader2 className="animate-spin" size={16}/> Loading Profile Data...</div>
                      ) : (
                        <>
                          {/* 1. DOCUMENTS SECTION */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><FileText size={14}/> Documents</h4>
                            <div className="flex gap-4">
                              <a href={m.folder_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-obsidian-900 border border-gray-600 rounded-lg hover:border-gold-400 hover:text-gold-400 transition-colors">
                                <ExternalLink size={16} /> Open Drive Folder
                              </a>
                            </div>
                          </div>

                          {/* 2. OFFICERS SECTION */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Users size={14}/> Officers & Shareholders</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {details[m.merchant_id].officers && details[m.merchant_id].officers.length > 0 ? (
                                details[m.merchant_id].officers.map((off, idx) => (
                                  <div key={idx} className="bg-obsidian-900 p-4 rounded-xl border border-gray-700 flex flex-col gap-1">
                                    <div className="flex justify-between">
                                      <span className="font-semibold text-white">{off.full_name}</span>
                                      <span className="text-xs text-gold-400 border border-gold-500/30 px-2 py-0.5 rounded">{off.role}</span>
                                    </div>
                                    <div className="text-xs text-gray-400">Passport: {off.passport_number}</div>
                                    <div className="text-xs text-gray-400">DOB: {off.dob ? new Date(off.dob).toLocaleDateString() : 'N/A'}</div>
                                    <div className="text-xs text-gray-500 mt-2">{off.residential_address || "No Address Found"}</div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-gray-500 text-sm italic">No officers recorded.</div>
                              )}
                            </div>
                          </div>
                        </>
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

export default Profiles;
