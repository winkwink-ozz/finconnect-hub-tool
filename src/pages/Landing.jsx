import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, UserPlus } from 'lucide-react';

const Landing = () => {
  return (
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

        {/* Action Grid (Step 1 Selection) */}
        <div className="grid grid-cols-1 gap-4 pt-8 max-w-sm mx-auto">
          
          {/* Path 1: Merchant Onboarding */}
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

          {/* Path 2: Admin Portal */}
          <Link to="/login" className="group flex items-center justify-between bg-obsidian-800 border border-gray-700 p-5 rounded-xl hover:border-blue-400 transition-all hover:scale-105 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
                <LayoutDashboard size={24} />
              </div>
              <div className="text-left">
                <span className="block font-bold text-white group-hover:text-blue-400 transition-colors">Admin Portal</span>
                <span className="text-xs text-gray-500">Staff Access Only</span>
              </div>
            </div>
          </Link>

        </div>
      </motion.div>
    </div>
  );
};

export default Landing;
