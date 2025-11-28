import React, { useState } from 'react';
import { FileText, Upload, Settings, Wand2, FileType, Cpu, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Applications = () => {
  const [mode, setMode] = useState(null); 

  return (
    <div className="space-y-12">
      
      {/* 🏭 HERO SECTION: FACTORY ANIMATION */}
      <div className="relative h-72 bg-gradient-to-br from-obsidian-900 to-obsidian-800 rounded-3xl border border-gray-700 overflow-hidden flex items-center justify-center shadow-2xl">
        
        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        
        {/* ⚙️ GEARS */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -left-10 top-10 w-64 h-64 border-4 border-gold-500/10 rounded-full border-dashed opacity-50"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -right-10 bottom-10 w-96 h-96 border-4 border-blue-500/10 rounded-full border-dotted opacity-50"
        />

        {/* 💨 SMOKE PARTICLES */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
           {[...Array(6)].map((_, i) => (
             <motion.div
               key={i}
               className="absolute top-0 left-1/2 w-4 h-4 bg-white/5 rounded-full blur-xl"
               animate={{
                 y: [-20, -150],
                 x: [0, (i % 2 === 0 ? 30 : -30)],
                 opacity: [0, 0.5, 0],
                 scale: [1, 3]
               }}
               transition={{
                 duration: 4,
                 repeat: Infinity,
                 delay: i * 0.5,
                 ease: "easeOut"
               }}
             />
           ))}
        </div>

        {/* CONTENT */}
        <div className="relative z-10 text-center space-y-4">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 text-gold-400 text-xs font-bold uppercase tracking-widest border border-gold-500/20 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            <Cpu size={14} /> FinConnect Core
          </motion.div>
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gold-gradient tracking-tight drop-shadow-lg">
            Application Factory
          </h1>
          <p className="text-gray-400 text-lg max-w-lg mx-auto">
            Automated document mapping & generation engine.
          </p>
        </div>
      </div>

      {/* MODULE SELECTORS */}
      {!mode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FactoryCard 
            title="Smart Word Template"
            desc="Upload .docx files with {{tags}}. Perfect for flexible legal agreements and contracts."
            icon={FileType}
            color="blue"
            onClick={() => setMode('word')}
          />
          <FactoryCard 
            title="Visual PDF Overlay"
            desc="Upload .pdf banking forms. Drag-and-drop database fields onto specific coordinates."
            icon={FileText}
            color="red"
            onClick={() => setMode('pdf')}
          />
        </div>
      ) : (
        <div className="p-20 text-center border-2 border-dashed border-gray-700 rounded-2xl bg-black/20">
          <h3 className="text-2xl font-bold text-gray-500 mb-4">Initializing Module...</h3>
          <p className="text-gray-600 mb-8">Connecting to Document Generation Engine.</p>
          <button onClick={() => setMode(null)} className="text-gold-400 hover:text-white underline font-semibold">Cancel & Go Back</button>
        </div>
      )}
    </div>
  );
};

const FactoryCard = ({ title, desc, icon: Icon, color, onClick }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    onClick={onClick}
    className={`group bg-obsidian-800 border border-gray-700 hover:border-${color}-500/50 p-10 rounded-2xl cursor-pointer transition-all shadow-2xl relative overflow-hidden`}
  >
    <div className={`absolute top-0 right-0 p-32 bg-${color}-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-${color}-500/10 transition-colors`}></div>
    <div className={`w-16 h-16 rounded-2xl bg-black/50 flex items-center justify-center mb-6 border border-gray-700 group-hover:border-${color}-500/50 transition-colors`}>
      <Icon className={`w-8 h-8 text-${color}-500`} />
    </div>
    <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400 mb-8 leading-relaxed">{desc}</p>
    <div className={`flex items-center gap-2 text-${color}-400 font-bold uppercase text-xs tracking-widest group-hover:translate-x-2 transition-transform`}>
      Launch Engine <ArrowRight size={16}/>
    </div>
  </motion.div>
);

export default Applications;
