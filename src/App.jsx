import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion'; 
import { ShieldCheck, LayoutDashboard, UserPlus } from 'lucide-react';
import MerchantIntake from './pages/MerchantIntake';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Profiles from './pages/admin/Profiles';
import Applications from './pages/admin/Applications';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

// 🏠 LANDING PAGE
const Landing = () => (
  <div className="min-h-screen bg-obsidian-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
    
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl w-full text-center space-y-8">
      <div className="relative w-24 h-24 mx-auto flex items-center justify-center bg-white rounded-3xl shadow-2xl border border-gold-500/50">
        <img src="/finconnect-hub-tool/logo.png" alt="Logo" className="w-14 h-14 object-contain z-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gold-gradient tracking-tight">FinConnect Hub</h1>
        <p className="text-gray-400 text-lg">Secure Compliance & Onboarding</p>
      </div>

      <div className="grid grid-cols-1 gap-4 pt-8 max-w-sm mx-auto">
        <Link to="/onboard" className="group flex items-center justify-between bg-obsidian-800 border border-gray-700 p-5 rounded-xl hover:border-gold-400 transition-all hover:scale-105">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gold-500/10 rounded-lg text-gold-400"><UserPlus size={24}/></div>
            <div className="text-left">
              <span className="block font-bold text-white">New Merchant</span>
              <span className="text-xs text-gray-500">Start Onboarding</span>
            </div>
          </div>
        </Link>

        <Link to="/login" className="group flex items-center justify-between bg-obsidian-800 border border-gray-700 p-5 rounded-xl hover:border-blue-400 transition-all hover:scale-105">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><LayoutDashboard size={24}/></div>
            <div className="text-left">
              <span className="block font-bold text-white">Admin Portal</span>
              <span className="text-xs text-gray-500">Staff Access Only</span>
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  </div>
);

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-obsidian-900 text-gray-100 font-sans">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/onboard" element={<MerchantIntake />} />
          <Route path="/login" element={<AdminLogin />} />

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="profiles" element={<Profiles />} />
              <Route path="applications" element={<Applications />} />
            </Route>
          </Route>

        </Routes>
      </div>
    </Router>
  );
};

export default App;
