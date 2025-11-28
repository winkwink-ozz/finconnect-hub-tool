import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Loader2, Search, Filter, FolderOpen, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await api.getMerchants();
      setMerchants(data);
    } catch (e) {
      alert("Failed to load: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 text-gray-100">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 bg-obsidian-800 rounded-lg hover:bg-gray-700"><ArrowLeft size={20}/></Link>
          <h1 className="text-2xl font-bold text-white">Merchant Applications</h1>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-500" size={16} />
            <input type="text" placeholder="Search..." className="bg-obsidian-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-gold-400 outline-none" />
          </div>
          <button className="p-2 bg-obsidian-800 border border-gray-700 rounded-lg hover:text-gold-400"><Filter size={20} /></button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold-400 w-10 h-10" /></div>
      ) : (
        <div className="bg-obsidian-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Company Name</th>
                <th className="p-4 font-medium">Reg Number</th>
                <th className="p-4 font-medium">Country</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {merchants.map((m, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-semibold text-white">{m.company_name}</td>
                  <td className="p-4 text-gray-400 font-mono text-xs">{m.registration_number}</td>
                  <td className="p-4 text-gray-300">{m.country}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${m.status === 'Approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {m.status || 'Pending'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="flex items-center gap-2 text-xs bg-gold-500/10 text-gold-400 px-3 py-1.5 rounded hover:bg-gold-500 hover:text-black transition-colors">
                      <FolderOpen size={14} /> Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {merchants.length === 0 && <div className="p-10 text-center text-gray-500">No applications found.</div>}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
