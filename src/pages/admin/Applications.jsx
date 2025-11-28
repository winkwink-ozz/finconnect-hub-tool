import React, { useState } from 'react';
import { FileText, Upload, Settings, Wand2, FileType, Cpu, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Applications = () => {
  const [mode, setMode] = useState(null); 

  return (
    <div className="space-y-12">
      
      {/* 🏭 HERO SECTION: FACTORY ANIMATION */}
      <div className="relative h-64 bg-obsidian-800 rounded-3xl border border-gray-700 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        
        {/* The Core Animation */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-96 h-96 border border-gold-500/10 rounded-full border-dashed"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-64 h-64 border border-blue-500/10 rounded-full border-dotted"
        />

        {/* Content */}
        <div className="relative z-10 text-center space-y-2">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 text-gold-400 text-xs font-bold uppercase tracking-widest border border-gold-500/20"
          >
            <Cpu size={14} /> FinConnect Core
          </motion.div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Application Factory</h1>
          <p className="text-gray-400">Generate compliance-ready documents instantly.</p>
        </div>
      </div>

      {!mode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FactoryCard 
            title="Smart Word Template"
            desc="Upload .docx with {{tags}}. Best for flexible legal agreements."
            icon={FileType}
            color="blue"
            onClick={() => setMode('word')}
          />
          <FactoryCard 
            title="Visual PDF Overlay"
            desc="Upload .pdf and drag data fields. Best for fixed bank forms."
            icon={FileText}
            color="red"
            onClick={() => setMode('pdf')}
          />
        </div>
      ) : (
        <div className="p-20 text-center border-2 border-dashed border-gray-700 rounded-2xl bg-black/20">
          <h3 className="text-2xl font-bold text-gray-500 mb-4">Module Initializing...</h3>
          <p className="text-gray-600 mb-8">Ready to integrate pdf-lib engine.</p>
          <button onClick={() => setMode(null)} className="text-gold-400 hover:text-white underline">Cancel & Go Back</button>
        </div>
      )}
    </div>
  );
};

const FactoryCard = ({ title, desc, icon: Icon, color, onClick }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    onClick={onClick}
    className={`group bg-obsidian-800 border border-gray-700 hover:border-${color}-500 p-10 rounded-2xl cursor-pointer transition-all shadow-2xl relative overflow-hidden`}
  >
    <div className={`absolute top-0 right-0 p-32 bg-${color}-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-${color}-500/10 transition-colors`}></div>
    <Icon className={`w-12 h-12 text-${color}-500 mb-6`} />
    <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400 mb-6">{desc}</p>
    <div className={`flex items-center gap-2 text-${color}-400 font-semibold group-hover:translate-x-2 transition-transform`}>
      Initialize Engine <ArrowRight size={18}/>
    </div>
  </motion.div>
);

export default Applications;
