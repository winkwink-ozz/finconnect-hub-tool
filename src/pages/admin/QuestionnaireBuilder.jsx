// === START FILE: src/pages/admin/QuestionnaireBuilder.jsx ===
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { motion } from 'framer-motion';
import { Plus, Save, Trash2, CheckSquare, Type, X, Loader2, Table as TableIcon, Settings } from 'lucide-react';
import Toast from '../../components/ui/Toast';

const PSP_TYPES = [
  "Card Processing", "Crypto Processing", "EMI / Bank Wire", "Mobile Money", "Wallet"
];

const QUESTION_TYPES = [
  { id: 'text', label: 'Text Field', icon: Type },
  { id: 'mcq', label: 'Multiple Choice', icon: CheckSquare },
  { id: 'table', label: 'Data Table', icon: TableIcon }
];

export default function QuestionnaireBuilder() {
  const [selectedType, setSelectedType] = useState(PSP_TYPES[0]);
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 🔔 Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // 🔄 Effect: Load Existing when Type Changes
  useEffect(() => {
    loadExistingQuestionnaire(selectedType);
  }, [selectedType]);

  const loadExistingQuestionnaire = async (type) => {
    setLoading(true);
    try {
      const allForms = await api.getQuestionnaires();
      const existing = allForms.find(f => f.psp_type === type);
      if (existing) {
        setQuestions(existing.schema);
      } else {
        setQuestions([]);
      }
    } catch (e) {
      console.error("Load failed", e);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = (type) => {
    const base = { id: Date.now(), type, label: '' };
    
    if (type === 'mcq') base.options = [''];
    if (type === 'table') {
      base.columns = ['Column 1', 'Column 2'];
      base.initialRows = 3;
      // ✅ NEW: Store default values here
      base.defaults = []; 
    }
    
    setQuestions([...questions, base]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  // --- MCQ Helpers ---
  const addOption = (qId) => {
    setQuestions(questions.map(q => 
      q.id === qId ? { ...q, options: [...q.options, ''] } : q
    ));
  };

  const updateOption = (qId, index, value) => {
    setQuestions(questions.map(q => {
      if (q.id !== qId) return q;
      const newOpts = [...q.options];
      newOpts[index] = value;
      return { ...q, options: newOpts };
    }));
  };

  const removeOption = (qId, index) => {
    setQuestions(questions.map(q => {
      if (q.id !== qId) return q;
      const newOpts = q.options.filter((_, i) => i !== index);
      return { ...q, options: newOpts };
    }));
  };

  // --- Table Helpers ---
  const addColumn = (qId) => {
    setQuestions(questions.map(q => 
      q.id === qId ? { ...q, columns: [...q.columns, `Column ${q.columns.length + 1}`] } : q
    ));
  };

  const updateColumn = (qId, index, value) => {
    setQuestions(questions.map(q => {
      if (q.id !== qId) return q;
      const newCols = [...q.columns];
      newCols[index] = value;
      return { ...q, columns: newCols };
    }));
  };

  const removeColumn = (qId, index) => {
    setQuestions(questions.map(q => {
      if (q.id !== qId) return q;
      const newCols = q.columns.filter((_, i) => i !== index);
      return { ...q, columns: newCols };
    }));
  };

  // ✅ NEW: Handle updates to the default values in the table
  const updateTableDefault = (qId, rowIndex, colName, value) => {
    setQuestions(questions.map(q => {
      if (q.id !== qId) return q;

      // Copy existing defaults or initialize
      const newDefaults = [...(q.defaults || [])];

      // Ensure the row object exists at this index
      if (!newDefaults[rowIndex]) newDefaults[rowIndex] = {};

      // Update the specific cell
      newDefaults[rowIndex] = {
        ...newDefaults[rowIndex],
        [colName]: value
      };

      return { ...q, defaults: newDefaults };
    }));
  };

  const handleSave = async () => {
    if (questions.length === 0) {
      showToast("Cannot save an empty form", "error");
      return;
    }
    setSaving(true);
    try {
      await api.saveQuestionnaire({
        psp_type: selectedType,
        schema: questions
      });
      showToast("Questionnaire Saved Successfully!", "success");
    } catch (e) {
      showToast("Error: " + e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-obsidian-900 text-white font-sans flex gap-8 relative">
      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, show: false })}
      />

      <div className="w-1/3 space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gold-gradient mb-2">Form Builder</h1>
          <p className="text-gray-400 text-sm">Design compliance forms for specific PSPs.</p>
        </div>

        <div className="bg-obsidian-800 p-6 rounded-2xl border border-gray-700">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Target Service</label>
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-black/40 border border-gray-600 rounded-xl p-3 text-white focus:border-gold-400 focus:outline-none"
          >
            {PSP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="bg-obsidian-800 p-6 rounded-2xl border border-gray-700">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Toolbox</label>
          <div className="space-y-3">
            {QUESTION_TYPES.map(t => (
              <button 
                key={t.id} 
                onClick={() => addQuestion(t.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-black/20 hover:bg-gold-500/10 border border-gray-700 hover:border-gold-500/50 transition-all text-left group"
              >
                <t.icon size={18} className="text-gray-400 group-hover:text-gold-400" />
                <span className="text-sm font-medium text-gray-300 group-hover:text-white">{t.label}</span>
                <Plus size={16} className="ml-auto opacity-0 group-hover:opacity-100 text-gold-400" />
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleSave} 
          disabled={saving || loading}
          className="w-full bg-gold-gradient text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20 hover:scale-[1.02] transition-transform disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          {saving ? 'Saving...' : 'Save Blueprint'}
        </button>
      </div>

      <div className="w-2/3 bg-obsidian-800 rounded-3xl border border-gray-700 p-8 shadow-2xl min-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
          <h2 className="text-xl font-bold text-white">{selectedType} Questionnaire</h2>
          <div className="flex items-center gap-3">
            {loading && <span className="text-xs text-gray-400 flex items-center gap-1"><Loader2 size={12} className="animate-spin"/> Syncing...</span>}
            <span className="text-xs text-gold-400 bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/30">Preview Mode</span>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-700 rounded-2xl">
            <p>Canvas Empty</p>
            <p className="text-sm opacity-50">Select items from the toolbox to start.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <motion.div 
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/30 p-6 rounded-xl border border-gray-700 hover:border-gold-500/30 transition-colors relative group"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setQuestions(questions.filter(x => x.id !== q.id))} className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg"><Trash2 size={16}/></button>
                </div>

                <div className="mb-4">
                  <label className="block text-xs text-gray-500 mb-1">Question {idx + 1} Label</label>
                  <input 
                    type="text" 
                    value={q.label}
                    onChange={(e) => updateQuestion(q.id, 'label', e.target.value)}
                    placeholder="Enter question text here..."
                    className="w-full bg-transparent text-lg font-medium text-white border-b border-gray-700 focus:border-gold-400 focus:outline-none py-2"
                  />
                </div>

                {/* --- MCQ EDITOR --- */}
                {q.type === 'mcq' && (
                  <div className="pl-4 border-l-2 border-gray-700 space-y-2">
                    <label className="block text-xs text-gray-500 mb-2">Answer Options</label>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gold-500/50"></div>
                        <input 
                          type="text" 
                          value={opt} 
                          onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                          placeholder={`Option ${optIdx + 1}`}
                          className="flex-1 bg-obsidian-900 border border-gray-700 rounded-lg p-2 text-sm text-gray-300 focus:border-gold-400 focus:outline-none"
                        />
                        <button onClick={() => removeOption(q.id, optIdx)} className="text-gray-600 hover:text-red-400"><X size={14}/></button>
                      </div>
                    ))}
                    <button onClick={() => addOption(q.id)} className="text-xs text-gold-400 hover:text-white flex items-center gap-1 mt-2">
                      <Plus size={12}/> Add Option
                    </button>
                  </div>
                )}

                {/* --- TABLE EDITOR --- */}
                {q.type === 'table' && (
                  <div className="space-y-4">
                    <div className="flex gap-4 p-4 bg-obsidian-900 rounded-lg border border-gray-700">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-2 font-bold uppercase">Table Columns</label>
                        <div className="space-y-2">
                          {q.columns.map((col, cIdx) => (
                            <div key={cIdx} className="flex items-center gap-2">
                              <div className="text-xs text-gray-600 font-mono">Col {cIdx+1}</div>
                              <input 
                                type="text" 
                                value={col}
                                onChange={(e) => updateColumn(q.id, cIdx, e.target.value)}
                                className="flex-1 bg-black/40 border border-gray-600 rounded p-1.5 text-sm text-white focus:border-gold-400 outline-none"
                              />
                              <button onClick={() => removeColumn(q.id, cIdx)} className="text-gray-600 hover:text-red-400"><X size={14}/></button>
                            </div>
                          ))}
                          <button onClick={() => addColumn(q.id)} className="text-xs text-gold-400 hover:text-white flex items-center gap-1 mt-2">
                            <Plus size={12}/> Add Column
                          </button>
                        </div>
                      </div>
                      <div className="w-1/3 border-l border-gray-700 pl-4">
                        <label className="block text-xs text-gray-500 mb-2 font-bold uppercase">Default Rows</label>
                        <input 
                          type="number" 
                          min="1"
                          value={q.initialRows}
                          onChange={(e) => updateQuestion(q.id, 'initialRows', parseInt(e.target.value))}
                          className="w-full bg-black/40 border border-gray-600 rounded p-2 text-white focus:border-gold-400 outline-none"
                        />
                      </div>
                    </div>

                    {/* ✅ TEMPLATE EDITOR (Was Read-Only Preview) */}
                    <div className="border border-gray-700 rounded-lg overflow-hidden">
                      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 text-xs font-bold text-gold-400 flex justify-between items-center">
                         <div className="flex items-center gap-2">
                           <Settings size={12}/> TEMPLATE EDITOR
                         </div>
                         <span className="text-[10px] text-gray-500 font-normal normal-case">
                           Type in cells to set default values for merchants
                         </span>
                      </div>
                      <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-black/40 text-gray-500 uppercase text-xs">
                          <tr>
                            {q.columns.map((c, i) => <th key={i} className="px-4 py-2">{c || `Col ${i+1}`}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {[...Array(q.initialRows)].map((_, r) => (
                            <tr key={r} className="border-b border-gray-800/50">
                              {q.columns.map((c, i) => (
                                <td key={i} className="p-1">
                                  {/* ✅ NEW: Interactive Input for Defaults */}
                                  <input 
                                    type="text" 
                                    placeholder="(Empty)"
                                    value={q.defaults?.[r]?.[c] || ''}
                                    onChange={(e) => updateTableDefault(q.id, r, c, e.target.value)}
                                    className="w-full bg-black/20 border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:border-gold-400 focus:outline-none transition-colors hover:bg-black/40"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// === END FILE: src/pages/admin/QuestionnaireBuilder.jsx ===
