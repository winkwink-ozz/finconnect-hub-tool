import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Search, Filter, ChevronDown, ChevronUp, ExternalLink, Users, Building, FileText, Loader2, MapPin, Calendar, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profiles = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [details, setDetails] = useState({}); 

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await api.getMerchants();
      setMerchants(data);
    } catch (error) {
      console.error(error);
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
        try {
          const fullData = await api.getMerchantDetails(id);
          setDetails(prev => ({ ...prev, [id]: fullData }));
        } catch (error) { console.error(error); }
      }
    }
  };

  // 💊 Helper: Status Pills
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'Rejected': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default: return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-400';
      case 'Rejected': return 'bg-red-400';
      default: return 'bg-yellow-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Merchant Profiles</h2>
          <p className="text-gray-400 text-sm">Manage and review incoming client applications.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-3 text-gray-500" size={16} />
            <input type="text" placeholder="Search companies, IDs..." className="w-full bg-obsidian-800/50 backdrop-blur border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-gold-400 outline-none transition-all" />
          </div>
          <button className="p-2.5 bg-obsidian-800/50 backdrop-blur border border-gray-700 rounded-xl hover:border-gold-400 hover:text-gold-400 transition-all"><Filter size={20} /></button>
        </div>
      </div>

      {/* TABLE CONTAINER (Glassmorphism) */}
      <div className="bg-obsidian-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        {/* Table Header */}
        <div className="grid grid-cols-12 bg-black/20 text-gray-500 text-xs uppercase tracking-widest p-5 font-bold hidden md:grid border-b border-gray-800">
          <div className="col-span-4">Company Details</div>
          <div className="col-span-3">Jurisdiction</div>
          <div className="col-span-3">Date Joined</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-gold-400 w-8 h-8" />
            <span className="text-gray-500 text-sm">Syncing with Secure Vault...</span>
          </div>
        ) : (
          merchants.map((m) => (
            <div key={m.merchant_id} className="border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors group">
              {/* ROW SUMMARY */}
              <div 
                onClick={() => toggleExpand(m.merchant_id)}
                className="grid grid-cols-1 md:grid-cols-12 p-5 items-center cursor-pointer gap-4 md:gap-0"
              >
                {/* Company Name & Reg */}
                <div className="col-span-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gold-gradient flex items-center justify-center text-black shadow-lg shadow-gold-500/20">
                    <Building size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg leading-tight">{m.company_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded font-mono border border-gray-700">ID: {m.registration_number}</span>
                    </div>
                  </div>
                </div>

                {/* Country */}
                <div className="col-span-3 text-gray-300 flex items-center gap-2">
                  <Globe size={16} className="text-gray-500" />
                  {m.country || <span className="text-gray-600 italic">Not Detected</span>}
                </div>

                {/* Date (Placeholder for now until format standardized, using Inc Date if available) */}
                <div className="col-span-3 text-gray-400 text-sm flex items-center gap-2">
                  <Calendar size={16} className="text-gray-600" />
                  {m.incorporation_date || "N/A"}
                </div>

                {/* Status & Toggle */}
                <div className="col-span-2 flex justify-between items-center md:justify-end gap-4">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${getStatusStyle(m.status || 'Pending')}`}>
                    <span className={`w-2 h-2 rounded-full ${getStatusDot(m.status || 'Pending')} animate-pulse`}></span>
                    {m.status || 'Pending'}
                  </div>
                  <div className="text-gray-600 group-hover:text-white transition-colors">
                    {expandedId === m.merchant_id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>

              {/* EXPANDED DETAILS PANEL */}
              <AnimatePresence>
                {expandedId === m.merchant_id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: "auto", opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-black/40 shadow-inner"
                  >
                    <div className="p-6 md:p-8 space-y-8 border-t border-gray-800">
                      
                      {!details[m.merchant_id] ? (
                        <div className="flex items-center justify-center py-10 gap-3 text-gold-400">
                          <Loader2 className="animate-spin" /> Fetching Full Profile...
                        </div>
                      ) : (
                        <>
                          {/* 🏢 SECTION 1: EXTENDED ENTITY DATA */}
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Building size={14}/> Corporate Particulars</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <DetailItem label="Registered Address" value={details[m.merchant_id].company.registered_address} />
                               <DetailItem label="Operational Address" value={details[m.merchant_id].company.operational_address || "Same as Registered"} />
                               <DetailItem label="Incorporation Date" value={details[m.merchant_id].company.incorporation_date} />
                               <DetailItem label="Jurisdiction" value={details[m.merchant_id].company.country} />
                            </div>
                          </div>

                          {/* 👥 SECTION 2: OFFICERS */}
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Users size={14}/> Corporate Structure</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {details[m.merchant_id].officers && details[m.merchant_id].officers.length > 0 ? (
                                details[m.merchant_id].officers.map((off, idx) => (
                                  <div key={idx} className="bg-obsidian-800 p-5 rounded-xl border border-gray-700/50 hover:border-gold-500/30 transition-all flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                      <span className="font-bold text-white text-lg">{off.full_name}</span>
                                      {/* GRADIENT TEXT FOR ROLE */}
                                      <span className="text-xs font-bold bg-clip-text text-transparent bg-gold-gradient border border-gold-500/20 px-2 py-1 rounded">
                                        {off.role}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-2 mt-2 text-sm">
                                      <div className="text-gray-500">Passport No:</div>
                                      <div className="text-gray-300 font-mono text-right">{off.passport_number}</div>
                                      
                                      <div className="text-gray-500">DOB:</div>
                                      <div className="text-gray-300 text-right">{off.dob}</div>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400">
                                      <span className="text-gray-600 block mb-1">Residential Address:</span>
                                      {off.residential_address || "No Address Found"}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-gray-500 text-sm italic p-4 border border-dashed border-gray-700 rounded-lg">No officers recorded for this entity.</div>
                              )}
                            </div>
                          </div>

                          {/* 📂 SECTION 3: DOCUMENTS */}
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><FileText size={14}/> Document Vault</h4>
                            <a href={m.folder_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 px-6 py-3 bg-obsidian-800 border border-gray-600 rounded-xl hover:border-gold-400 hover:text-white transition-all group">
                              <ExternalLink size={18} className="text-gold-400 group-hover:scale-110 transition-transform"/> 
                              <span className="font-medium text-gray-300 group-hover:text-white">Access Google Drive Secure Vault</span>
                            </a>
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

const DetailItem = ({ label, value }) => (
  <div className="bg-obsidian-900/50 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
    <span className="text-gray-500 text-xs font-medium">{label}</span>
    <span className="text-gray-200 text-sm font-semibold truncate max-w-[200px]" title={value}>{value || "N/A"}</span>
  </div>
);

export default Profiles;
