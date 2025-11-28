import React, { useEffect, useState } from 'react';
import { api } from '../services/api'; // ✅ FIXED: Correct relative path
import { Users, FileCheck, Clock, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Fetch all data to calculate stats locally
      const data = await api.getAllMerchants();
      
      setStats({
        total: data.length,
        pending: data.filter(m => m.status === 'Pending Review').length,
        approved: data.filter(m => m.status === 'Approved').length,
        rejected: data.filter(m => m.status === 'Rejected').length
      });
    } catch (e) {
      console.error("Dashboard Load Failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Mission Control</h1>
            <p className="text-gray-400 mt-1">Real-time onboarding telemetry.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-mono text-green-400 uppercase">System Online</span>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard icon={Users} label="Total Applications" value={stats.total} color="blue" delay={0} />
        <StatCard icon={Clock} label="Pending Review" value={stats.pending} color="yellow" delay={0.1} />
        <StatCard icon={FileCheck} label="Approved" value={stats.approved} color="green" delay={0.2} />
        <StatCard icon={AlertTriangle} label="Rejected" value={stats.rejected} color="red" delay={0.3} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Stream Placeholder */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-obsidian-800 rounded-2xl border border-gray-700 p-6 shadow-xl"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gold-500/10 rounded-lg text-gold-400"><Activity size={20}/></div>
                <h3 className="text-lg font-bold text-white">Live Activity Stream</h3>
            </div>
            <div className="space-y-4">
                {[1,2,3].map(i => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-black/20 border border-gray-800/50">
                        <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                        <div className="flex-1 space-y-1">
                            <div className="h-2 w-24 bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-2 w-full max-w-xs bg-gray-800 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>

        {/* System Health */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-obsidian-800 rounded-2xl border border-gray-700 p-6 shadow-xl"
        >
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><TrendingUp size={20}/></div>
                <h3 className="text-lg font-bold text-white">System Health</h3>
            </div>
            <div className="space-y-6">
                <HealthBar label="API Latency" value="24ms" percent={90} color="green" />
                <HealthBar label="Database Load" value="12%" percent={12} color="blue" />
                <HealthBar label="AI Token Usage" value="450/1M" percent={45} color="yellow" />
            </div>
        </motion.div>
      </div>
    </div>
  );
};

// Sub-Components
const StatCard = ({ icon: Icon, label, value, color, delay }) => {
    const colors = {
        blue: "text-blue-400 border-blue-500/30 hover:border-blue-500",
        yellow: "text-yellow-400 border-yellow-500/30 hover:border-yellow-500",
        green: "text-green-400 border-green-500/30 hover:border-green-500",
        red: "text-red-400 border-red-500/30 hover:border-red-500",
    };
    
    return (
        <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }} className={`p-6 rounded-2xl bg-obsidian-800 border ${colors[color]} shadow-xl transition-all group relative overflow-hidden`}>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-black/40 ${colors[color].split(' ')[0]}`}>
                        <Icon size={24} />
                    </div>
                    {/* Glowing Orb Effect */}
                    <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full blur-3xl opacity-10 bg-current ${colors[color].split(' ')[0]}`}></div>
                </div>
                <div className="space-y-1">
                    <h3 className="text-3xl font-bold text-white">{value}</h3>
                    <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">{label}</p>
                </div>
            </div>
        </motion.div>
    );
};

const HealthBar = ({ label, value, percent, color }) => (
    <div>
        <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-400">{label}</span>
            <span className="text-white font-mono">{value}</span>
        </div>
        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full bg-${color}-500`} style={{ width: `${percent}%` }}></div>
        </div>
    </div>
);

export default AdminDashboard;
