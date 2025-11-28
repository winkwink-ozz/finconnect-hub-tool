import React from 'react';
import { FileText, Construction } from 'lucide-react';

const Applications = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
      <div className="p-4 bg-obsidian-800 rounded-full border border-gray-700">
        <Construction className="w-12 h-12 text-gold-400" />
      </div>
      <h2 className="text-2xl font-bold text-white">Application Factory</h2>
      <p className="text-gray-400 max-w-md">This module will allow mapping extracted data to PDF templates (Stripe, EMI Forms). Coming in Phase 2.</p>
    </div>
  );
};

export default Applications;
