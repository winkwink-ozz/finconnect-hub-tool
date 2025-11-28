import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, CheckCircle2, ChevronRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-obsidian-900 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* 1. Ambient Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-900/40 rounded-full blur-[100px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl text-center flex flex-col items-center"
      >
        {/* 2. Authority Logo (Glass Card Effect) */}
        <div className="relative w-32 h-32 mb-6 group">
            {/* Glow Behind */}
            <div className="absolute inset-0 rounded-3xl bg-gold-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            
            {/* The Card */}
            <div className="relative w-full h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
                <img src="/finconnect-hub-tool/logo.png" alt="Logo" className="w-16 h-16 object-contain drop-shadow-lg" />
            </div>
        </div>

        {/* 3. Typography & Messaging */}
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
          FinConnect <span className="text-transparent bg-clip-text bg-gold-gradient">Hub</span>
        </h1>
        
        {/* Gold Subtitle (Requested) */}
        <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gold-gradient tracking-wide uppercase mb-1">
          Merchant Onboarding & KYC
        </h2>
        
        <p className="text-gray-400 text-sm font-medium tracking-wider mb-8">
          Secure Compliance & Onboarding
        </p>

        {/* 4. The Trust Badge (Gemini AI & Vault) */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-10">
            <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-gold-400" />
                <span className="text-xs font-semibold text-gray-300">Gemini AI</span>
            </div>
            <div className="w-px h-4 bg-white/10"></div>
            <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-gold-400" />
                <span className="text-xs font-semibold text-gray-300">Vault Protected</span>
            </div>
        </div>

        {/* 5. The "Gold Standard" CTA (Single Action) */}
        <Link to="/onboard" className="w-full group relative">
            <div className="absolute -inset-0.5 bg-gold-gradient rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <button className="relative w-full bg-gold-gradient text-black font-bold text-lg py-4 px-8 rounded-xl flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all transform">
                <UserPlus size={20} className="text-black" />
                <span>Begin Application</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </Link>

      </motion.div>

      {/* Footer Meta */}
      <div className="absolute bottom-6 text-gray-600 text-xs text-center">
        <p>&copy; 2025 FinConnect Hub. Authorized Personnel Only.</p>
      </div>
    </div>
  );
};

export default Landing;
