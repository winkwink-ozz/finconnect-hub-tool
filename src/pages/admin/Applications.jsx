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
      const formUrl = '/forms/merchant_application_template.pdf';
      const formBytes = await fetch(formUrl).then(res => {
        if (!res.ok) throw new Error("Template PDF not found in public/forms/");
        return res.arrayBuffer();
      });

      const pdfDoc = await PDFDocument.load(formBytes);
      const form = pdfDoc.getForm();

      const fields = {
        'company_name': merchant.company_name,
        'registration_number': merchant.registration_number,
        'incorporation_date': merchant.incorporation_date,
        'country': merchant.country,
        'address': merchant.registered_address,
        'merchant_id': merchant.merchant_id,
        'status': 'APPROVED'
      };

      Object.entries(fields).forEach(([key, value]) => {
        try {
          const field = form.getTextField(key);
          if (field) field.setText(value || '');
        } catch (err) {
          // Field not found
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
    <div className="p-8 min-h-screen bg-obsidian-900 text-white font-sans">
      <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gold-gradient">
            Application Factory
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Generate official banking forms for approved entities.</p>
        </div>
        <button 
            onClick={loadApprovedMerchants} 
            className="p-2 bg-obsidian-800 border border-gray-700 rounded-lg hover:border-gold-400 hover:text-gold-400 transition-all text-gray-400"
        >
            <RefreshCw size={20} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gold-400"><Loader className="animate-spin"/> Loading Approved List...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            
            {merchants.length === 0 && (
            <div className="col-span-3 text-center p-12 border border-dashed border-gray-700 rounded-xl bg-black/20">
                <AlertTriangle className="mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400 font-bold">No Approved Merchants</p>
                <p className="text-gray-600 text-xs mt-1">Go to 'Profiles' and approve a merchant first.</p>
            </div>
            )}

            {merchants.map(m => (
            <motion.div 
                key={m.merchant_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-obsidian-800 p-6 rounded-xl border border-gray-700 hover:border-gold-500/50 transition-all group shadow-lg"
            >
                <div className="flex justify-between items-start mb-4">
                <div className="bg-green-500/10 p-3 rounded-lg text-green-400 border border-green-500/20">
                    <Check size={20} />
                </div>
                <span className="text-xs font-mono text-gray-500 bg-black/40 px-2 py-1 rounded border border-gray-800">{m.merchant_id}</span>
                </div>
                
                <h3 className="font-bold text-lg mb-1 truncate text-white group-hover:text-gold-400 transition-colors">{m.company_name}</h3>
                <div className="flex gap-2 text-xs text-gray-400 mb-6 font-mono">
                    <span>{m.country}</span>
                    <span>•</span>
                    <span>{m.incorporation_date}</span>
                </div>

                <button
                onClick={() => generatePDF(m)}
                disabled={generating === m.merchant_id}
                className="w-full bg-gold-gradient text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-gold-500/20 disabled:opacity-50 disabled:scale-100"
                >
                {generating === m.merchant_id ? (
                    <>
                    <Loader size={18} className="animate-spin" />
                    Printing...
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
