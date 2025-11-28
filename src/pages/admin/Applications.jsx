import React, { useState } from 'react';
import { FileText, Upload, Settings, Wand2, FileType } from 'lucide-react';

const Applications = () => {
  const [mode, setMode] = useState(null); // 'word' or 'pdf'

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Application Factory</h2>
          <p className="text-gray-400 text-sm">Generate filled application forms instantly.</p>
        </div>
      </div>

      {!mode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {/* OPTION 1: WORD */}
          <div 
            onClick={() => setMode('word')}
            className="group bg-obsidian-800 border border-gray-700 hover:border-blue-500 p-10 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors"></div>
            <FileType className="w-16 h-16 text-blue-500 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">Smart Word Template</h3>
            <p className="text-gray-400 mb-6">Best for flexible forms. Upload a .docx with <code className="bg-black px-1 rounded text-blue-300">{'{{tags}}'}</code> and map data automatically.</p>
            <div className="flex items-center gap-2 text-blue-400 font-semibold group-hover:translate-x-2 transition-transform">
              Launch Mapper <Wand2 size={18}/>
            </div>
          </div>

          {/* OPTION 2: PDF */}
          <div 
            onClick={() => setMode('pdf')}
            className="group bg-obsidian-800 border border-gray-700 hover:border-red-500 p-10 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-32 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-red-500/10 transition-colors"></div>
            <FileText className="w-16 h-16 text-red-500 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">Visual PDF Overlay</h3>
            <p className="text-gray-400 mb-6">Best for fixed bank forms. Upload a .pdf and drag-and-drop text fields onto specific coordinates.</p>
            <div className="flex items-center gap-2 text-red-400 font-semibold group-hover:translate-x-2 transition-transform">
              Launch Visual Editor <Settings size={18}/>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-20 text-center border-2 border-dashed border-gray-700 rounded-2xl">
          <h3 className="text-2xl font-bold text-gray-500 mb-4">Module Loading...</h3>
          <button onClick={() => setMode(null)} className="text-gold-400 hover:underline">Go Back</button>
        </div>
      )}
    </div>
  );
};

export default Applications;
