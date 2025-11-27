import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // Animation
import { ArrowRight, ShieldCheck } from 'lucide-react';
import MerchantIntake from './pages/MerchantIntake';

const AdminDashboard = () => (
  <div className="min-h-screen bg-obsidian-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
    
    {/* Background Ambient Glow */}
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>

    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-xl w-full text-center space-y-8"
    >
      {/* 🔹 LOGO ANIMATION (Same as Portal) */}
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="relative w-24 h-24 mx-auto flex items-center justify-center bg-white rounded-3xl shadow-2xl border border-gold-500/50"
      >
        <img src="/finconnect-hub-tool/logo.png" alt="Logo" className="w-14 h-14 object-contain z-10" />
        <motion.div 
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-gold-400/30 rounded-3xl blur-xl -z-10"
        />
      </motion.div>

      {/* 🔹 TEXT CONTENT */}
      <div className="space-y-2">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gold-gradient tracking-tight">
          FinConnect Hub
        </h1>
        <p className="text-gray-400 text-lg">Merchant Onboarding & KYC Automation</p>
      </div>

      {/* 🔹 ACTION BUTTON */}
      <div className="pt-8">
        <Link 
          to="/intake" 
          className="group relative inline-flex items-center gap-3 bg-gold-gradient text-black font-bold py-4 px-10 rounded-xl shadow-xl shadow-gold-500/20 overflow-hidden transition-transform hover:scale-105"
        >
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          
          <span className="relative z-10 text-lg">Start New Client Intake</span>
          <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Footer Badge */}
      <div className="pt-12 flex justify-center opacity-50">
        <div className="flex items-center gap-2 text-xs text-gray-500 border border-gray-800 px-4 py-2 rounded-full">
          <ShieldCheck size={14} className="text-gold-500" />
          <span>Secured by Google Gemini AI & Drive Vault</span>
        </div>
      </div>

    </motion.div>
  </div>
);

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-obsidian-900 text-gray-100 font-sans">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/intake" element={<MerchantIntake />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
