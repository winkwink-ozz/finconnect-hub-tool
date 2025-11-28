
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PDFDocument } from 'pdf-lib';
import download from 'downloadjs';
import { motion } from 'framer-motion';
import { FileText, Download, Loader, AlertTriangle, Check, RefreshCw } from 'lucide-react';

export default function Applications() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);

  useEffect(() => {
    loadApprovedMerchants();
  }, []);

  const loadApprovedMerchants = async () => {
    try {
      setLoading(true);
      const all = await api.getAllMerchants();
      // Filter: Only show merchants that have been Approved in the Profiles Sniper View
      setMerchants(all.filter(m => m.status === 'Approved'));
    } catch (e) {
      console.error("Failed to load merchants");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async (merchant) => {
    setGenerating(merchant.merchant_id);
    
    try {
      // ⚠️ TARGET FILE: Ensure 'merchant_application_template.pdf' is in 'public/forms/'
      const formUrl = '/forms/merchant_application_template.pdf';
      
      const formBytes = await fetch(formUrl).then(res => {
        if (!res.ok) throw new Error("Template PDF not found. Please check public/forms folder.");
        return res.arrayBuffer();
      });

      const pdfDoc = await PDFDocument.load(formBytes);
      const form = pdfDoc.getForm();

      // 📝 MAPPING ENGINE
      // Key = The 'Name' of the text field in the PDF
      // Value = The data from our system
      const fields = {
        'company_name': merchant.company_name,
        'registration_number': merchant.registration_number,
        'incorporation_date': merchant.incorporation_date,
        'country': merchant.country,
        'address': merchant.registered_address,
        'merchant_id': merchant.merchant_id,
        'status': 'APPROVED'
      };

      // Fill fields safely (Skip if PDF field doesn't exist)
      Object.entries(fields).forEach(([key, value]) => {
        try {
          const field = form.getTextField(key);
          if (field) field.setText(value || '');
        } catch (err) {
          console.warn(`Field '${key}' not found in PDF template.`);
        }
      });

      const pdfBytes = await pdfDoc.save();
      download(pdfBytes, `Application_${merchant.company_name.replace(/\s/g, '_')}.pdf`, "application/pdf");

    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-slate-900 text-white">
      <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Application Factory
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Generate official banking forms for approved entities.</p>
        </div>
        <button onClick={loadApprovedMerchants} className="p-2 bg-slate-800 rounded hover:text-cyan-400 transition-colors">
            <RefreshCw size={18} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500"><Loader className="animate-spin"/> Loading Approved List...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            
            {merchants.length === 0 && (
            <div className="col-span-3 text-center p-12 border border-dashed border-slate-700 rounded-xl bg-slate-800/30">
                <AlertTriangle className="mx-auto text-slate-500 mb-4" />
                <p className="text-slate-400 font-bold">No Approved Merchants</p>
                <p className="text-slate-500 text-xs mt-1">Go to 'Profiles' and approve a merchant first.</p>
            </div>
            )}

            {merchants.map(m => (
            <motion.div 
                key={m.merchant_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all group"
            >
                <div className="flex justify-between items-start mb-4">
                <div className="bg-cyan-900/30 p-3 rounded-lg text-cyan-400">
                    <Check size={20} />
                </div>
                <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">{m.merchant_id}</span>
                </div>
                
                <h3 className="font-bold text-lg mb-1 truncate text-white">{m.company_name}</h3>
                <div className="flex gap-2 text-xs text-slate-400 mb-6">
                    <span>{m.country}</span>
                    <span>•</span>
                    <span>{m.incorporation_date}</span>
                </div>

                <button
                onClick={() => generatePDF(m)}
                disabled={generating === m.merchant_id}
                className="w-full bg-slate-700 hover:bg-cyan-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                {generating === m.merchant_id ? (
                    <>
                    <Loader size={18} className="animate-spin" />
                    Generating...
                    </>
                ) : (
                    <>
                    <Download size={18} />
                    Generate PDF
                    </>
                )}
                </button>
            </motion.div>
            ))}
        </div>
      )}
    </div>
  );
}
