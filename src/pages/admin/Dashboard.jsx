import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Users, FileCheck, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    api.getMerchants().then(data => {
      setStats({
        total: data.length,
        pending: data.filter(m => m.status === 'Pending Review').length,
        approved: data.filter(m => m.status === 'Approved').length,
        rejected: data.filter(m => m.status === 'Rejected').length
      });
    });
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white">Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total Merchants" value={stats.total} color="text-blue-400" border="border-blue-500" />
        <StatCard icon={Clock} label="Pending Review" value={stats.pending} color="text-yellow-400" border="border-yellow-500" />
        <StatCard icon={FileCheck} label="Approved" value={stats.approved} color="text-green-400" border="border-green-500" />
        <StatCard icon={AlertTriangle} label="Rejected" value={stats.rejected} color="text-red-400" border="border-red-500" />
      </div>

      <div className="p-8 bg-obsidian-800 rounded-2xl border border-gray-700 shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-obsidian-900 rounded-lg text-gold-400"><TrendingUp /></div>
          <h3 className="text-xl font-semibold text-white">Live Activity</h3>
        </div>
        <div className="h-40 flex items-center justify-center text-gray-500 border-t border-gray-700">
          Activity Stream Loading...
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, border }) => (
  <div className={`p-6 rounded-xl bg-obsidian-800 border-t border-gray-700 shadow-lg border-l-4 ${border} relative overflow-hidden group`}>
    <div className="relative z-10 flex justify-between items-start">
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">{label}</p>
        <p className="text-3xl font-bold text-white mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-lg bg-obsidian-900 ${color} shadow-inner`}>
        <Icon size={24} />
      </div>
    </div>
    <div className={`absolute -bottom-4 -right-4 w-24 h-24 bg-current opacity-5 rounded-full blur-2xl ${color}`}></div>
  </div>
);

export default Dashboard;
