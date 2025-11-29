import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, ShieldCheck, Lock, ChevronRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-obsidian-900 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* 1. Ambient Background Effects (Subtle) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-900/40 rounded-full blur-[100px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl text-center flex flex-col items-center"
      >
        {/* 2. Authority Logo (Clean & Sharp - No Blur) */}
        <div className="relative w-28 h-28 mb-8">
            <div className="relative w-full h-full bg-white rounded-2xl flex items-center justify-center border-2 border-gold-500 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                <img src="/finconnect-hub-tool/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
            </div>
        </div>

        {/* 3. Typography */}
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
          FinConnect <span className="text-transparent bg-clip-text bg-gold-gradient">Hub</span>
        </h1>
        
        <h2 className="text-sm font-bold text-gold-400 tracking-[0.2em] uppercase mb-8">
          Merchant Onboarding & KYC
        </h2>

        {/* 4. The "Tech HUD" Trust Badges (Option B) */}
        <div className="flex items-center justify-center gap-3 w-full mb-10">
            {/* Chip 1: Gemini AI */}
            <div className="flex items-center gap-2 px-4 py-2 bg-black border border-gold-500/40 rounded-lg shadow-[0_0_10px_rgba(212,175,55,0.05)] hover:border-gold-400 transition-colors">
                <ShieldCheck size={14} className="text-gold-400" />
                <span className="text-[10px] font-bold text-gray-300 tracking-wider">GEMINI AI</span>
            </div>

            {/* Chip 2: Vault */}
            <div className="flex items-center gap-2 px-4 py-2 bg-black border border-gold-500/40 rounded-lg shadow-[0_0_10px_rgba(212,175,55,0.05)] hover:border-gold-400 transition-colors">
                <Lock size={14} className="text-gold-400" />
                <span className="text-[10px] font-bold text-gray-300 tracking-wider">VAULT SECURE</span>
            </div>
        </div>

        {/* 5. The "Gold Standard" CTA */}
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
      <div className="absolute bottom-6 text-gray-600 text-[10px] text-center uppercase tracking-widest">
        <p>&copy; 2025 FinConnect Hub. Authorized Access Only.</p>
      </div>
    </div>
  );
};

export default Landing;
