import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MerchantIntake from './pages/MerchantIntake';

// Placeholder Admin Dashboard (We build this next)
const AdminDashboard = () => (
  <div className="p-10 text-center">
    <h1 className="text-2xl text-gold-400">Admin Dashboard</h1>
    <p>Select a merchant to view details.</p>
    <Link to="/intake" className="text-blue-400 underline mt-4 block">Go to New Merchant Intake</Link>
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
