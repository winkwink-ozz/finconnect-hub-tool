import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MerchantIntake from './pages/MerchantIntake';

const AdminDashboard = () => (
  <div className="p-10 text-center flex flex-col items-center justify-center h-screen bg-obsidian-900">
    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gold-gradient mb-6">
      Finconnect Hub Admin
    </h1>
    <p className="text-gray-400 mb-8">Select a module to begin.</p>
    
    <Link 
      to="/intake" 
      className="bg-gold-gradient text-black font-bold py-3 px-8 rounded-lg shadow-lg hover:brightness-110 transition-all transform hover:scale-105"
    >
      Start New Client Intake
    </Link>
  </div>
);

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-obsidian-900 text-gray-100 font-sans">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/intake" element={<MerchantIntake />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;


