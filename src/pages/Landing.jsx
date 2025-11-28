import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, ShieldCheck, Lock, ChevronRight } from 'lucide-react';

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
        className="relative z-10 w-full max-w-lg bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl text-center"
      >
        {/* 2. Authority Logo */}
        <div className="relative w-28 h-28 mx-auto mb-8">
            {/* Rotating Glow Ring */}
            <div className="absolute inset-0 rounded-3xl bg-gold-gradient blur-md opacity-40 animate-spin-slow"></div>
            <div className="relative w-full h-full bg-white rounded-3xl flex items-center justify-center shadow-lg border border-gold-500/50">
                <img src="/finconnect-hub-tool/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
            </div>
        </div>

        {/* 3. Value Proposition */}
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
          FinConnect <span className="text-transparent bg-clip-text bg-gold-gradient">Hub</span>
        </h1>
        <p className="text-gray-400 text-lg mb-10 leading-relaxed">
          The secure gateway for corporate onboarding and compliance verification.
        </p>

        {/* 4. The "Gold Standard" CTA */}
        <Link to="/onboard" className="block group relative">
            <div className="absolute -inset-1 bg-gold-gradient rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <button className="relative w-full bg-gold-gradient text-black font-bold text-lg py-5 px-8 rounded-xl flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all transform">
                <span>Begin Application</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </Link>

        {/* 5. Trust Indicators (Footer) */}
        <div className="mt-10 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-2 text-gray-500">
                <ShieldCheck size={20} className="text-gold-500/80" />
                <span className="text-[10px] uppercase tracking-widest">Bank-Grade Security</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-gray-500">
                <Lock size={20} className="text-gold-500/80" />
                <span className="text-[10px] uppercase tracking-widest">Encrypted Vault</span>
            </div>
        </div>

      </motion.div>

      {/* Footer Meta */}
      <div className="absolute bottom-6 text-gray-600 text-xs text-center">
        <p>&copy; 2025 FinConnect Hub. Authorized Personnel Only.</p>
      </div>
    </div>
  );
};

export default Landing;
