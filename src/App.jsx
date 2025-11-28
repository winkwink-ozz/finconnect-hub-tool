import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, LayoutDashboard, UserPlus } from 'lucide-react';
import MerchantIntake from './pages/MerchantIntake';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Profiles from './pages/admin/Profiles';
import Applications from './pages/admin/Applications';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

// 🏠 LANDING PAGE (Step 1: Entry Point)
const Landing = () => (
  <div className="min-h-screen bg-obsidian-900 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
    {/* Background Ambient Glow */}
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
    
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-xl w-full text-center space-y-8"
    >
      {/* Logo Container */}
      <div className="relative w-24 h-24 mx-auto flex items-center justify-center bg-white rounded-3xl shadow-2xl border border-gold-500/50">
        <img src="/finconnect-hub-tool/logo.png" alt="Logo" className="w-14 h-14 object-contain z-10" />
      </div>

      {/* Hero Text */}
      <div className="space-y-2">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gold-gradient tracking-tight">
          FinConnect Hub
        </h1>
        <p className="text-gray-400 text-lg">Secure Compliance & Onboarding</p>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 gap-4 pt-8 max-w-sm mx-auto">
        
        {/* Option A: Merchant Onboarding */}
        <Link to="/onboard" className="group flex items-center justify-between bg-obsidian-800 border border-gray-700 p-5 rounded-xl hover:border-gold-400 transition-all hover:scale-105 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gold-500/10 rounded-lg text-gold-400 border border-gold-500/20">
              <UserPlus size={24} />
            </div>
            <div className="text-left">
              <span className="block font-bold text-white group-hover:text-gold-400 transition-colors">New Merchant</span>
              <span className="text-xs text-gray-500">Start Application</span>
            </div>
          </div>
        </Link>

        {/* Option B: Admin Portal (Fixed: Removed Blue Theme) */}
        <Link to="/login" className="group flex items-center justify-between bg-obsidian-800 border border-gray-700 p-5 rounded-xl hover:border-white/50 transition-all hover:scale-105 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-lg text-white border border-white/10">
              <LayoutDashboard size={24} />
            </div>
            <div className="text-left">
              <span className="block font-bold text-white group-hover:text-gray-300 transition-colors">Admin Portal</span>
              <span className="text-xs text-gray-500">Staff Access Only</span>
            </div>
          </div>
        </Link>

      </div>
    </motion.div>
  </div>
);

// 🚀 MAIN APP ROUTER
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
