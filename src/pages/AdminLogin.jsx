import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // 🔐 MASTER PASSWORD (Change this to whatever you want)
    const MASTER_KEY = "FinAdmin2025"; 

    if (password === MASTER_KEY) {
      // Save "logged in" state to Session Storage (clears when tab closes)
      sessionStorage.setItem('finconnect_admin_auth', 'true');
      navigate('/admin/dashboard');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-900 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-obsidian-800 border border-gray-700 rounded-2xl shadow-2xl p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-gold-500/10 rounded-full mb-4">
            <Lock className="text-gold-400 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          <p className="text-gray-500 text-sm">FinConnect Hub Internal Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Access Key</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-black/30 border rounded-lg p-3 text-white focus:outline-none transition-all ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-700 focus:border-gold-400'}`}
              placeholder="Enter secure key..."
              autoFocus
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-gold-gradient text-black font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
          >
            Authenticate <ArrowRight size={18} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
