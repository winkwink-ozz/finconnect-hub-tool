import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ show, message, type, onClose }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -50, x: "-50%" }}
          className={`fixed top-6 left-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md transition-colors ${
            type === 'error'
              ? 'bg-red-900/90 border-red-500 text-red-100'
              : 'bg-green-900/90 border-green-500 text-green-100'
          }`}
        >
          {type === 'error' ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
          <span className="font-medium text-sm">{message}</span>
          <button onClick={onClose} className="hover:opacity-75 ml-2">
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
