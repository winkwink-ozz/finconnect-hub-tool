import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Users, FileCheck, Clock, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });

  useEffect(() => {
    // Quick fetch to calculate stats
    api.getMerchants().then(data => {
      setStats({
        total: data.length,
        pending: data.filter(m => m.status === 'Pending Review').length,
        approved: data.filter(m => m.status === 'Approved').length
      });
    });
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white">Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Users} label="Total Merchants" value={stats.total} color="text-blue-400" bg="bg-blue-500/10" />
        <StatCard icon={Clock} label="Pending Review" value={stats.pending} color="text-gold-400" bg="bg-gold-500/10" />
        <StatCard icon={FileCheck} label="Approved" value={stats.approved} color="text-green-400" bg="bg-green-500/10" />
      </div>

      <div className="p-8 bg-obsidian-800 rounded-2xl border border-gray-700 text-center">
        <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-300">Activity Feed</h3>
        <p className="text-gray-500">Recent application updates will appear here.</p>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className={`p-6 rounded-2xl border border-gray-700 ${bg} flex items-center gap-4`}>
    <div className={`p-3 rounded-xl bg-obsidian-900 ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  </div>
);

export default Dashboard;
