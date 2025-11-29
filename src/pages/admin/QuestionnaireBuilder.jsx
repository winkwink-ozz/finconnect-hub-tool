import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { motion } from 'framer-motion';
import { Plus, Save, Trash2, FileText, CheckSquare, Type } from 'lucide-react';

const PSP_TYPES = [
  "Card Processing", "Crypto Processing", "EMI / Bank Wire", "Mobile Money", "Wallet"
];

const QUESTION_TYPES = [
  { id: 'text', label: 'Text Field', icon: Type },
  { id: 'mcq', label: 'Multiple Choice', icon: CheckSquare },
  { id: 'long_text', label: 'Long Answer', icon: FileText }
];

export default function QuestionnaireBuilder() {
  const [selectedType, setSelectedType] = useState(PSP_TYPES[0]);
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);

  const addQuestion = (type) => {
    setQuestions([...questions, {
      id: Date.now(),
      type,
      label: '',
      options: type === 'mcq' ? ['Option 1'] : []
    }]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.saveQuestionnaire({
        psp_type: selectedType,
        schema: questions
      });
      alert("Questionnaire Saved Successfully!");
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-obsidian-900 text-white font-sans flex gap-8">
      
      {/* LEFT: CONTROLS */}
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
          disabled={saving}
          className="w-full bg-gold-gradient text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20 hover:scale-[1.02] transition-transform"
        >
          {saving ? 'Saving...' : <><Save size={20} /> Save Blueprint</>}
        </button>
      </div>

      {/* RIGHT: CANVAS */}
      <div className="w-2/3 bg-obsidian-800 rounded-3xl border border-gray-700 p-8 shadow-2xl min-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
          <h2 className="text-xl font-bold text-white">{selectedType} Questionnaire</h2>
          <span className="text-xs text-gold-400 bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/30">Preview Mode</span>
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
                    placeholder="E.g., What is your monthly volume?"
                    className="w-full bg-transparent text-lg font-medium text-white border-b border-gray-700 focus:border-gold-400 focus:outline-none py-2"
                  />
                </div>

                {q.type === 'mcq' && (
                  <div className="pl-4 border-l-2 border-gray-700">
                    <label className="block text-xs text-gray-500 mb-2">Options (Comma separated)</label>
                    <input 
                      type="text" 
                      value={q.options.join(', ')}
                      onChange={(e) => updateQuestion(q.id, 'options', e.target.value.split(',').map(s => s.trim()))}
                      className="w-full bg-obsidian-900 border border-gray-700 rounded-lg p-2 text-sm text-gray-300 focus:border-gold-400 focus:outline-none"
                    />
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
