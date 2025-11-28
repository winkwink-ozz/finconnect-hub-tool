import React, { useState } from 'react';
import { FileText, Upload, Settings, Wand2, FileType, Cpu, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Applications = () => {
  const [mode, setMode] = useState(null); 

  return (
    <div className="space-y-12">
      
      {/* 🏭 FACTORY HEADER ANIMATION */}
      <div className="relative h-80 bg-gradient-to-b from-obsidian-900 to-black rounded-3xl border border-gray-700 overflow-hidden flex items-end justify-center shadow-2xl">
        
        {/* SMOKE STACKS */}
        <div className="absolute top-20 left-1/3 flex gap-4">
           {[0, 1, 2].map(i => (
             <motion.div 
               key={i}
               initial={{ y: 0, opacity: 0.8, scale: 1 }}
               animate={{ y: -100, opacity: 0, scale: 2 }}
               transition={{ duration: 3, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
               className="w-8 h-8 bg-white/10 rounded-full blur-xl"
             />
           ))}
        </div>

        {/* FACTORY SVG STRUCTURE */}
        <svg width="600" height="200" viewBox="0 0 600 200" className="text-gray-800 fill-current z-10">
           <path d="M50,200 L50,100 L100,50 L150,100 L150,200 Z" /> {/* Stack 1 */}
           <path d="M160,200 L160,80 L210,30 L260,80 L260,200 Z" /> {/* Stack 2 */}
           <rect x="300" y="100" width="200" height="100" /> {/* Main Building */}
           <rect x="0" y="190" width="600" height="10" className="fill-gray-700"/> {/* Floor */}
        </svg>

        {/* ANIMATED GEARS */}
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="absolute bottom-8 left-[320px] z-20">
           <Gear size={60} color="#D4AF37" />
        </motion.div>
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="absolute bottom-8 left-[375px] z-20">
           <Gear size={40} color="#4A90E2" />
        </motion.div>

        {/* TITLE OVERLAY */}
        <div className="absolute top-10 w-full text-center z-30">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 text-gold-400 text-xs font-bold uppercase tracking-widest border border-gold-500/20"
          >
            <Cpu size={14} /> FinConnect Core
          </motion.div>
          <h1 className="text-5xl font-bold text-white mt-4 tracking-tight drop-shadow-2xl">
            Application Factory
          </h1>
        </div>
      </div>

      {/* MODULE SELECTORS */}
      {!mode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FactoryCard title="Smart Word Template" desc="Map data to .docx {{tags}}." icon={FileType} color="blue" onClick={() => setMode('word')} />
          <FactoryCard title="Visual PDF Overlay" desc="Drag & drop fields onto PDF." icon={FileText} color="red" onClick={() => setMode('pdf')} />
        </div>
      ) : (
        <div className="p-20 text-center border-2 border-dashed border-gray-700 rounded-2xl bg-black/20">
          <h3 className="text-2xl font-bold text-gray-500 mb-4">Module Initializing...</h3>
          <button onClick={() => setMode(null)} className="text-gold-400 hover:text-white underline">Cancel</button>
        </div>
      )}
    </div>
  );
};

const Gear = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
  </svg>
);

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
